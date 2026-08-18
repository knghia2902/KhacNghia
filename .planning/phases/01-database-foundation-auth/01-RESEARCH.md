# Phase 1: Database Foundation & Auth - Research

## Executive Summary

Phase 1 establishes the entire backend data layer on Supabase (PostgreSQL 15+) for the **Network Command Lookup Tool**. This foundational phase creates 6 relational tables, enables specialized PostgreSQL extensions (`pg_trgm`, `unaccent`), creates an immutable text normalization pipeline for Vietnamese diacritics, builds a high-performance hybrid search RPC function (<50ms response), configures Row Level Security (RLS) for authenticated access, and seeds baseline reference data along with 50–70 representative network configuration commands across 7 vendors and 4 device types.

---

## 1. Domain Analysis

### 1.1 Core Entities & Relational Model

```
                    ┌─────────────────────────┐
                    │   command_categories    │ (8 Hierarchical Networking Domains)
                    │  (id, slug, name_vi,...) │
                    └────────────┬────────────┘
                                 │ 1:N
                    ┌────────────▼────────────┐
                    │    canonical_actions    │ (Normalized Action Slugs: vlan.create,...)
                    │(id, action_key, name_vi)│
                    └────────────┬────────────┘
                                 │ 1:N
┌──────────────┐    ┌────────────▼────────────┐    ┌──────────────────────┐
│   vendors    ├───►│        commands         │◄───┤ command_device_types │
│  (7 Vendors) │1:N │(CLI Syntaxes & Metadata)│1:N └──────────┬───────────┘
└──────────────┘    └────────────┬────────────┘               │ N:1
                                 │ 1:N             ┌──────────▼───────────┐
                    ┌────────────▼────────────┐    │     device_types     │
                    │    command_favorites    │    │ (4 Hardware Roles)   │
                    │   (Optional / Bookmarks)│    └──────────────────────┘
                    └─────────────────────────┘
```

### 1.2 Table Specifications

1. **`vendors` (DB-01)**:
   - Stores supported hardware manufacturers: Cisco, Fortinet, Juniper, Palo Alto, MikroTik, Aruba / HPE, Huawei.
   - Key attributes: `id` (UUID PK), `name` (TEXT UNIQUE), `slug` (TEXT UNIQUE), `os_flavors` (TEXT[] array of supported OS variants like `IOS-XE`, `FortiOS 7.x`, `Junos`, `RouterOS v7`), `icon_name` (TEXT), `badge_color` (TEXT), `display_order` (INT).

2. **`device_types` (DB-02)**:
   - Stores 4 core hardware roles: Switch (`switch`), Router (`router`), Firewall (`firewall`), Access Point / WLC (`ap_wlc`).
   - Key attributes: `id` (UUID PK), `name` (TEXT UNIQUE), `slug` (TEXT UNIQUE), `icon_name` (TEXT), `description_vi` (TEXT), `display_order` (INT).

3. **`command_categories` (DB-03)**:
   - Stores 8 functional networking domains (per Decision D-03):
     1. `interface-port`: Interface & Port (Cấu hình port, speed, duplex, shutdown)
     2. `vlan`: VLAN (Tạo/xóa VLAN, trunk, access port)
     3. `routing`: Routing (Static route, OSPF, BGP, RIP)
     4. `switching`: Switching (STP, EtherChannel, port-security)
     5. `security-acl`: Security & ACL (Access-list, firewall rules, NAT)
     6. `system-mgmt`: System & Management (Hostname, NTP, SNMP, logging, save config)
     7. `aaa-user`: AAA & User Management (Local user, RADIUS, TACACS+)
     8. `monitoring-troubleshooting`: Monitoring & Troubleshooting (Show commands, ping, traceroute, debug)
   - Self-referencing `parent_id` allows future sub-category hierarchies.

4. **`canonical_actions` (DB-04)**:
   - Acts as the universal cross-vendor task anchor linking equivalent commands across different vendors (e.g. `vlan.create`, `route.static_add`, `interface.shutdown`).
   - Key attributes: `id` (UUID PK), `category_id` (UUID FK), `action_key` (TEXT UNIQUE, dot-notation slug), `name_vi` (TEXT), `name_en` (TEXT), `description_vi` (TEXT).

5. **`commands` (DB-05)**:
   - The central repository of CLI commands.
   - Key attributes:
     - Relational FKs: `vendor_id` (UUID FK), `canonical_action_id` (UUID FK, nullable), `created_by` (UUID FK to `auth.users`, nullable).
     - CLI Syntax & Context: `command_syntax` (TEXT NOT NULL), `full_syntax` (TEXT), `prompt_mode` (TEXT e.g. `Switch(config-if)#`, `[edit]`, `config system interface`), `os_flavor` (TEXT).
     - Content & Localization: `title_vi` (TEXT NOT NULL), `description_vi` (TEXT NOT NULL), `notes_vi` (TEXT).
     - Operational Metadata: `verification_command` (TEXT), `rollback_command` (TEXT), `is_destructive` (BOOLEAN DEFAULT FALSE), `requires_commit` (BOOLEAN DEFAULT FALSE), `is_verified` (BOOLEAN DEFAULT TRUE), `tags` (TEXT[] DEFAULT '{}').
     - Flexible JSONB Columns (Decisions D-04, D-05):
       - `parameters`: JSONB array of objects: `[{"name": "vlan_id", "type": "integer", "required": true, "default": null, "description_vi": "ID của VLAN (1-4094)"}]`
       - `examples`: JSONB array of objects: `[{"scenario_vi": "Tạo VLAN 10 đặt tên DATA", "cli_input": "vlan 10\nname DATA", "cli_output": "", "notes_vi": "Gõ exit để hoàn tất"}]`
       - `warnings`: JSONB array of strings: `["Cổng sẽ reset STP state trong giây lát khi chuyển mode"]`
     - Generated FTS Vector: `search_vector` (TSVECTOR STORED).

6. **`command_device_types` (DB-06)**:
   - Junction table supporting M:N relationship between `commands` and `device_types` (e.g. IP routing commands apply to both Switch L3 and Router).
   - Composite PK: `(command_id, device_type_id)`.

7. **`command_favorites` (Optional / Bookmarks)**:
   - User bookmarks table: `(user_id, command_id)` with `created_at`.

---

## 2. Technical Approach

### 2.1 PostgreSQL Extensions & Normalization Helpers

PostgreSQL standard functions `unaccent()` and `array_to_string()` are marked as `STABLE` in standard catalogs, meaning they cannot be used directly inside `GENERATED ALWAYS AS (...) STORED` columns or deterministic functional indexes.

To resolve this without runtime performance penalties:

```sql
-- 1. Enable extensions in public/extensions schema
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- 2. Create IMMUTABLE wrapper for unaccent (Crucial for Vietnamese TSVECTOR & GIN indexes)
CREATE OR REPLACE FUNCTION immutable_unaccent(text)
RETURNS text AS $$
    SELECT public.unaccent('public.unaccent', $1);
$$ LANGUAGE sql IMMUTABLE PARALLEL SAFE STRICT;

-- 3. Create IMMUTABLE wrapper for array_to_string (Crucial for tags in TSVECTOR)
CREATE OR REPLACE FUNCTION immutable_array_to_string(text[], text)
RETURNS text AS $$
    SELECT array_to_string($1, $2);
$$ LANGUAGE sql IMMUTABLE PARALLEL SAFE STRICT;
```

### 2.2 Search Vector & Performance Indexing (DB-08)

To support sub-50ms search with Vietnamese diacritic insensitivity and CLI shorthand matching:

```sql
-- Generated TSVECTOR column on commands table
ALTER TABLE commands ADD COLUMN search_vector tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('simple', coalesce(command_syntax, '')), 'A') ||
    setweight(to_tsvector('simple', immutable_unaccent(coalesce(title_vi, ''))), 'A') ||
    setweight(to_tsvector('simple', immutable_unaccent(coalesce(description_vi, ''))), 'B') ||
    setweight(to_tsvector('simple', coalesce(prompt_mode, '')), 'C') ||
    setweight(to_tsvector('simple', coalesce(verification_command, '')), 'C') ||
    setweight(to_tsvector('simple', immutable_unaccent(coalesce(notes_vi, ''))), 'D') ||
    setweight(to_tsvector('simple', immutable_unaccent(immutable_array_to_string(tags, ' '))), 'B')
) STORED;

-- GIN Index for Full-Text Search
CREATE INDEX idx_commands_search_vector ON commands USING gin (search_vector);

-- GIN Trigram Indexes for CLI shorthand, typos, and partial matching
CREATE INDEX idx_commands_syntax_trgm ON commands USING gin (command_syntax gin_trgm_ops);
CREATE INDEX idx_commands_title_trgm ON commands USING gin (immutable_unaccent(title_vi) gin_trgm_ops);
CREATE INDEX idx_commands_desc_trgm ON commands USING gin (immutable_unaccent(description_vi) gin_trgm_ops);

-- B-Tree Indexes for Relational Filters & Foreign Keys
CREATE INDEX idx_commands_vendor_id ON commands (vendor_id);
CREATE INDEX idx_commands_canonical_id ON commands (canonical_action_id);
CREATE INDEX idx_commands_created_by ON commands (created_by);
CREATE INDEX idx_commands_tags ON commands USING gin (tags);
CREATE INDEX idx_command_device_types_device ON command_device_types (device_type_id);
CREATE INDEX idx_canonical_actions_category ON canonical_actions (category_id);
```

### 2.3 Hybrid Search RPC Function (DB-07)

The RPC function `search_network_commands` merges Full-Text Search, Trigram Similarity, exact prefix boosts, and relational filtering into an atomic query:

```sql
CREATE OR REPLACE FUNCTION search_network_commands(
    p_query TEXT DEFAULT NULL,
    p_vendor_id UUID DEFAULT NULL,
    p_device_type_slug TEXT DEFAULT NULL,
    p_category_slug TEXT DEFAULT NULL,
    p_limit INT DEFAULT 30,
    p_offset INT DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    command_syntax TEXT,
    full_syntax TEXT,
    prompt_mode TEXT,
    title_vi TEXT,
    description_vi TEXT,
    os_flavor TEXT,
    verification_command TEXT,
    rollback_command TEXT,
    is_destructive BOOLEAN,
    requires_commit BOOLEAN,
    notes_vi TEXT,
    tags TEXT[],
    parameters JSONB,
    examples JSONB,
    warnings JSONB,
    vendor JSONB,
    device_types JSONB,
    canonical_action JSONB,
    relevance_score FLOAT
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_clean_query TEXT := trim(coalesce(p_query, ''));
    v_unaccented_query TEXT := immutable_unaccent(v_clean_query);
    v_tsquery tsquery;
BEGIN
    IF v_unaccented_query <> '' THEN
        v_tsquery := plainto_tsquery('simple', v_unaccented_query);
    END IF;

    RETURN QUERY
    SELECT 
        c.id,
        c.command_syntax,
        c.full_syntax,
        c.prompt_mode,
        c.title_vi,
        c.description_vi,
        c.os_flavor,
        c.verification_command,
        c.rollback_command,
        c.is_destructive,
        c.requires_commit,
        c.notes_vi,
        c.tags,
        c.parameters,
        c.examples,
        c.warnings,
        jsonb_build_object(
            'id', v.id,
            'name', v.name,
            'slug', v.slug,
            'badge_color', v.badge_color,
            'icon_name', v.icon_name
        ) AS vendor,
        COALESCE(
            (
                SELECT jsonb_agg(
                    jsonb_build_object(
                        'id', dt.id,
                        'name', dt.name,
                        'slug', dt.slug,
                        'icon_name', dt.icon_name
                    ) ORDER BY dt.display_order ASC
                )
                FROM command_device_types cdt
                JOIN device_types dt ON dt.id = cdt.device_type_id
                WHERE cdt.command_id = c.id
            ),
            '[]'::jsonb
        ) AS device_types,
        CASE 
            WHEN ca.id IS NOT NULL THEN
                jsonb_build_object(
                    'id', ca.id,
                    'action_key', ca.action_key,
                    'name_vi', ca.name_vi,
                    'category_id', ca.category_id
                )
            ELSE NULL
        END AS canonical_action,
        (
            CASE 
                WHEN v_clean_query = '' THEN 1.0
                ELSE (
                    -- Exact command syntax prefix boost (shorthand e.g., 'sh ip' -> 'show ip interface brief')
                    CASE WHEN c.command_syntax ILIKE v_clean_query || '%' THEN 8.0 ELSE 0.0 END +
                    -- Exact title match boost
                    CASE WHEN immutable_unaccent(c.title_vi) ILIKE '%' || v_unaccented_query || '%' THEN 4.0 ELSE 0.0 END +
                    -- Full-Text search rank weight
                    CASE WHEN v_tsquery IS NOT NULL AND c.search_vector @@ v_tsquery 
                         THEN coalesce(ts_rank_cd(c.search_vector, v_tsquery), 0.0) * 3.5 
                         ELSE 0.0 END +
                    -- Trigram similarity on command syntax
                    similarity(c.command_syntax, v_clean_query) * 4.0 +
                    -- Trigram similarity on Vietnamese title
                    similarity(immutable_unaccent(c.title_vi), v_unaccented_query) * 3.0 +
                    -- Tag array match boost
                    CASE WHEN c.tags @> ARRAY[lower(v_clean_query)] THEN 4.0 ELSE 0.0 END
                )
            END
        )::FLOAT AS relevance_score
    FROM commands c
    JOIN vendors v ON v.id = c.vendor_id
    LEFT JOIN canonical_actions ca ON ca.id = c.canonical_action_id
    LEFT JOIN command_categories cat ON cat.id = ca.category_id
    WHERE
        -- Relational filter: Vendor
        (p_vendor_id IS NULL OR c.vendor_id = p_vendor_id)
        -- Relational filter: Device Type
        AND (
            p_device_type_slug IS NULL OR EXISTS (
                SELECT 1 FROM command_device_types cdt
                JOIN device_types dt ON dt.id = cdt.device_type_id
                WHERE cdt.command_id = c.id AND dt.slug = p_device_type_slug
            )
        )
        -- Relational filter: Category
        AND (p_category_slug IS NULL OR cat.slug = p_category_slug)
        -- Text / Semantic search filter
        AND (
            v_clean_query = ''
            OR (v_tsquery IS NOT NULL AND c.search_vector @@ v_tsquery)
            OR c.command_syntax ILIKE '%' || v_clean_query || '%'
            OR immutable_unaccent(c.title_vi) ILIKE '%' || v_unaccented_query || '%'
            OR immutable_unaccent(c.description_vi) ILIKE '%' || v_unaccented_query || '%'
            OR c.command_syntax % v_clean_query
            OR immutable_unaccent(c.title_vi) % v_unaccented_query
            OR c.tags @> ARRAY[lower(v_clean_query)]
        )
    ORDER BY 
        CASE WHEN v_clean_query = '' THEN 0.0 ELSE relevance_score END DESC,
        c.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$;
```

### 2.4 Row Level Security (RLS) Configuration (DB-09)

Security requirements dictate that all command catalog tables require authentication (`authenticated` Supabase role) for reading and writing, while anonymous/unauthenticated users are rejected:

```sql
-- Enable RLS on all 7 tables
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE command_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE canonical_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE commands ENABLE ROW LEVEL SECURITY;
ALTER TABLE command_device_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE command_favorites ENABLE ROW LEVEL SECURITY;

-- Read policies: Authenticated users only
CREATE POLICY "Allow authenticated read on vendors" 
    ON vendors FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated read on device_types" 
    ON device_types FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated read on command_categories" 
    ON command_categories FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated read on canonical_actions" 
    ON canonical_actions FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated read on commands" 
    ON commands FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated read on command_device_types" 
    ON command_device_types FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated manage command_favorites" 
    ON command_favorites FOR ALL TO authenticated 
    USING (auth.uid() = user_id) 
    WITH CHECK (auth.uid() = user_id);

-- Write policies: Authenticated users can insert/update/delete commands
CREATE POLICY "Allow authenticated insert on commands" 
    ON commands FOR INSERT TO authenticated 
    WITH CHECK (auth.uid() = created_by OR created_by IS NULL);

CREATE POLICY "Allow authenticated update on commands" 
    ON commands FOR UPDATE TO authenticated 
    USING (true);

CREATE POLICY "Allow authenticated delete on commands" 
    ON commands FOR DELETE TO authenticated 
    USING (true);

CREATE POLICY "Allow authenticated manage command_device_types" 
    ON command_device_types FOR ALL TO authenticated 
    USING (true);

CREATE POLICY "Allow authenticated manage canonical_actions" 
    ON canonical_actions FOR ALL TO authenticated 
    USING (true);

CREATE POLICY "Allow authenticated manage command_categories" 
    ON command_categories FOR ALL TO authenticated 
    USING (true);
```

---

## 3. Codebase Patterns & Integration

### 3.1 Existing App Architecture

- **Supabase Client**: `src/lib/supabaseClient.js` exports the configured client (`supabase`) using `createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY)`.
- **Authentication**: `src/context/AuthContext.jsx` manages `useAuth()` and attaches active Supabase session tokens (`sb-*-auth-token` stored in localStorage) to all client requests automatically.
- **SQL Execution Workflow (Decision D-06)**:
  - Database schema scripts are maintained under `supabase/migrations/` in the repository for version control and review.
  - Deployment is executed directly against the Supabase project SQL Editor or through a verification script.

### 3.2 SQL Migration File Structure

Organized into sequential migration files:
1. `supabase/migrations/001_create_schema.sql`: Extensions, immutable helpers, tables (`vendors`, `device_types`, `command_categories`, `canonical_actions`, `commands`, `command_device_types`, `command_favorites`), indexes, and RLS policies.
2. `supabase/migrations/002_search_rpc.sql`: RPC function `search_network_commands` and batch ingestion stored procedure `import_network_commands_batch`.
3. `supabase/migrations/003_seed_data.sql`:
   - 7 Vendors (Cisco, Fortinet, Juniper, Palo Alto, MikroTik, Aruba/HPE, Huawei)
   - 4 Device Types (Switch, Router, Firewall, AP/WLC)
   - 8 Categories (`interface-port`, `vlan`, `routing`, `switching`, `security-acl`, `system-mgmt`, `aaa-user`, `monitoring-troubleshooting`)
   - ~15-20 Canonical Actions (`vlan.create`, `vlan.port_trunk`, `route.static_add`, `bgp.neighbor_add`, `interface.ip_set`, `system.config_save`, etc.)
   - 50–70 realistic CLI commands across all 7 vendors with complete JSONB parameters, JSONB examples, JSONB warnings, tags, prompt modes, and junction associations in `command_device_types`.

---

## 4. Dependencies & Integration

### 4.1 Internal & External Dependencies

| Component / Layer | Dependency | Notes |
|-------------------|------------|-------|
| Supabase / PostgreSQL | `pg_trgm`, `unaccent` | Built-in extensions in Supabase PostgreSQL 15+ |
| Javascript Runtime | `@supabase/supabase-js` (`^2.90.1`) | Already installed in `package.json` |
| Auth Flow | `src/context/AuthContext.jsx` | Supplies valid JWT for RLS `authenticated` role |
| Downstream: Phase 2 (Search UI) | Table schema & `search_network_commands` RPC | Relies on RPC return structure (`parameters`, `examples`, `warnings`, `vendor`, `device_types`) |
| Downstream: Phase 3 (Import & Matrix) | `canonical_actions`, `command_device_types`, `import_network_commands_batch` | Relies on canonical action foreign keys and batch upsert RPC |

---

## 5. Risks & Mitigations

| Risk | Impact | Mitigation Strategy |
|------|--------|---------------------|
| **1. Unaccent STABLE error in GENERATED column** | Migration fails with `cannot use non-immutable function in index expression` | Create `immutable_unaccent(text)` with `IMMUTABLE PARALLEL SAFE STRICT` specifying schema `public.unaccent('public.unaccent', $1)`. |
| **2. Vietnamese search diacritic mismatch** | Queries without accents ("cau hinh") fail to match accented data ("cấu hình") | `search_vector` stores text stripped via `immutable_unaccent()` with `'simple'` text configuration; search RPC strips query accents before building `tsquery`. |
| **3. Trigram false positives / slow execution** | Non-relevant commands returned or latency >50ms | Combine TSVECTOR FTS rank (`ts_rank_cd`) with Trigram similarity (`similarity()`) and exact prefix boosts; index with GIN trigram ops. |
| **4. RLS blocking table inspection for unauthenticated users** | Developers or public users see empty lists | Ensure UI/tests run with authenticated session token; unauthenticated requests receive clean empty state / login prompt. |
| **5. Junction table cascade failures** | Deleting a command leaves orphan rows in `command_device_types` | Define foreign keys with `ON DELETE CASCADE`. |

---

## 6. Validation Architecture

To rigorously verify all Phase 1 requirements (DB-01 through DB-09) and ensure sub-50ms performance:

### 6.1 Verification Matrix

| Req ID | Target | Verification Method | Pass Criteria |
|--------|--------|---------------------|---------------|
| **DB-01** | `vendors` table | Query `vendors` table via Supabase client | Exactly 7 vendors present with `slug`, `os_flavors`, `badge_color` |
| **DB-02** | `device_types` table | Query `device_types` table | Exactly 4 device types present (`switch`, `router`, `firewall`, `ap_wlc`) |
| **DB-03** | `command_categories` table | Query `command_categories` table | Exactly 8 categories matching Decision D-03 |
| **DB-04** | `canonical_actions` table | Query `canonical_actions` table | >= 15 canonical action slugs linked to categories |
| **DB-05** | `commands` table | Query `commands` schema and contents | Contains all columns, JSONB `parameters`, `examples`, `warnings`, and generated `search_vector` |
| **DB-06** | `command_device_types` table | Query junction table | Junction records connect commands to device types correctly |
| **DB-07** | `search_network_commands` RPC | Call RPC with "cấu hình VLAN", "cau hinh vlan", "sh ip int br", "static route" | Returns relevant ranked records with latency < 50ms |
| **DB-08** | GIN indexes | Query `pg_indexes` on `commands` table | GIN indexes on `search_vector`, `command_syntax`, `title_vi`, `description_vi` exist |
| **DB-09** | Row Level Security (RLS) | Execute SELECT without auth token vs WITH auth token | Unauthenticated query returns 0 rows / denied; Authenticated query returns rows |

### 6.2 Automated Test Script Pattern

A Node.js test script (`scripts/verify_phase1.js`) using `@supabase/supabase-js` will execute automated checks:
1. Connects anonymously: verifies RLS blocks commands read (returns 0 rows).
2. Connects with test user credentials / service key: verifies table counts (7 vendors, 4 device types, 8 categories, >= 50 commands).
3. Executes timed RPC queries for accented Vietnamese ("cấu hình"), unaccented Vietnamese ("cau hinh"), CLI shorthand ("sh ip"), and measures response time (<50ms).

---

## Conclusion & Plan Recommendations

With this technical architecture:
1. The planner should create 2 to 3 plans for Phase 1:
   - **Plan 1 (Schema, Indexes & RLS)**: Create `001_create_schema.sql` and apply extensions, helper functions, 7 tables, GIN indexes, and RLS policies.
   - **Plan 2 (Search RPC & Batch Import)**: Create `002_search_rpc.sql` with `search_network_commands` and `import_network_commands_batch`.
   - **Plan 3 (Seed Data & Verification)**: Create `003_seed_data.sql` (7 vendors, 4 device types, 8 categories, canonical actions, 50-70 commands across all 7 vendors) and run automated verification script to validate DB-01 through DB-09.
