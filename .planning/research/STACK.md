# Stack Research: Network Command Lookup Tool

## Recommended Stack

| Technology | Version | Rationale | Confidence Level |
|------------|---------|-----------|------------------|
| **React** | `^19.2.0` | Core UI library already established in the application. React 19 concurrent features (`useTransition`, `useDeferredValue`) allow non-blocking UI updates while filtering and searching large command sets. | High (100%) |
| **Vite** | `^7.2.4` | Existing lightning-fast build tool and dev server. Instant HMR, native ES modules, and optimized Rollup production builds. | High (100%) |
| **Tailwind CSS** | `^4.1.18` | Existing CSS engine using the modern CSS-first `@tailwindcss/postcss` setup. Seamlessly integrates with the app's existing theme tokens, dark mode classes, and glassmorphism styling. | High (100%) |
| **React Router DOM** | `^7.12.0` | Standard routing framework in the project. Enables clean sub-routing under `/tools` (e.g., `/tools/network-commands`, `/tools/network-commands/compare`), deep-linking via query parameters (`?q=vlan&vendor=cisco`), and protection via existing `AuthContext`. | High (100%) |
| **Supabase Client (`@supabase/supabase-js`)** | `^2.90.1` | Native integration with existing Supabase backend. Handles authenticated queries, PostgreSQL RPC function invocations for complex searches, and bulk batch insertions. | High (100%) |
| **PostgreSQL Database** | `15+` (Supabase) | Robust relational database with native extensions (`pg_trgm`, `unaccent`, GIN indexing) capable of sub-10ms full-text and fuzzy searches across tens of thousands of CLI commands. | High (100%) |
| **PapaParse** | `^5.5.4` | Industry-standard browser/Node CSV parser. Handles delimiter detection, multi-line quoted fields, escaped characters, and streaming for smooth bulk imports without blocking the main UI thread. | High (95%) |
| **Zod** | `^3.24.2` / `^4.4.3` | Schema declaration and validation library. Validates CSV/JSON import payloads, command structures, and vendor/device enums before database transmission with detailed line-by-line error feedback. | High (95%) |
| **Custom CLI Tokenizer + PrismJS** | `prismjs ^1.30.0` | Lightweight syntax highlighting tailored specifically for network device CLI commands (Cisco IOS, Junos, RouterOS, FortiOS) with interactive parameter placeholders (`<vlan-id>`, `[interface]`). | High (90%) |
| **Material Symbols Outlined** | Web Font | Already embedded in `index.html`. Provides all required glyphs for hardware types (router, switch, firewall, wifi), copy actions, filters, and vendor badges with zero JavaScript bundle overhead. | High (100%) |

---

## Search Implementation

Network CLI command lookups present unique technical search challenges:
1. **Punctuation & CLI Syntax Tokens**: Network commands are heavily tokenized with symbols (`/`, `-`, `|`, `.`, `:`, `_`, `[ ]`, `< >`), such as `show ip int br`, `ge-0/0/0`, `/ip firewall nat`, or `switchport trunk allowed vlan add 10,20`.
2. **Vietnamese Intent Descriptions**: Users search by natural language intentions in Vietnamese (e.g., *"cấu hình cổng trunk"*, *"đặt địa chỉ ip"*, *"xem bảng định tuyến"*), often typing **without accents** (*"cau hinh cong trunk"*, *"xem bang dinh tuyen"*).
3. **Fuzzy Typos & Partial Commands**: Engineers frequently use standard abbreviations (`conf t`, `sh run`, `dis ip int br`) or make small typographical errors (`ospff`, `interfce`).

### Comparison of PostgreSQL Search Strategies

| Feature / Criteria | Standard `ILIKE` | PostgreSQL FTS (`tsvector` / `tsquery`) | PostgreSQL Trigram (`pg_trgm`) | **Recommended Hybrid RPC** |
|--------------------|------------------|------------------------------------------|--------------------------------|-----------------------------|
| **Substring / Prefix Matching** | Partial match anywhere (`%text%`) | Word prefix only (`word:*`), no mid-word | Excellent (3-character n-grams) | **Best** (Combined exact + trigram) |
| **CLI Symbol / Path Handling (`/`, `-`, `.`)** | Literal character match | Splits/drops symbols based on dictionary | Retains symbols in trigrams | **Best** (Preserves exact syntax) |
| **Vietnamese Accent-Insensitivity** | Requires `unaccent(col) ILIKE unaccent('%q%')` (slow without index) | Requires custom dictionary or `simple` | Fast with immutable `unaccent` trigram index | **Best** (`unaccent` + trigram indexing) |
| **Typo Tolerance / Fuzzy Match** | None | None (requires exact stem match) | High (via similarity operator `%`) | **High** (Similarity score threshold) |
| **Relevance Ranking & Scoring** | None (binary match) | High (`ts_rank`, `ts_rank_cd`, weights) | Similarity score (`0.0` to `1.0`) | **Highest** (Multi-tier weighted score) |
| **Performance on Large Datasets** | Slow (Sequential table scan) | Fast with GIN Index | Fast with GIN/GiST Trigram Index | **Sub-10ms** (Dual GIN indexed) |

### Recommended Search Architecture: Supabase Database Function (RPC)

Implement a dedicated PostgreSQL RPC function `search_network_commands` in Supabase combining `pg_trgm`, `unaccent`, and weighted Full-Text Search.

```sql
-- 1. Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;

-- 2. Create immutable unaccent helper for indexing
CREATE OR REPLACE FUNCTION immutable_unaccent(text)
RETURNS text AS $$
  SELECT unaccent($1);
$$ LANGUAGE sql IMMUTABLE STRICT;

-- 3. Add generated tsvector column on the commands table
ALTER TABLE network_commands 
ADD COLUMN search_vector tsvector 
GENERATED ALWAYS AS (
  setweight(to_tsvector('simple', coalesce(title, '')), 'A') ||
  setweight(to_tsvector('simple', coalesce(command_syntax, '')), 'A') ||
  setweight(to_tsvector('simple', immutable_unaccent(coalesce(description, ''))), 'B') ||
  setweight(to_tsvector('simple', coalesce(vendor, '')), 'C') ||
  setweight(to_tsvector('simple', coalesce(device_type, '')), 'C') ||
  setweight(to_tsvector('simple', coalesce(category, '')), 'D')
) STORED;

-- 4. Create GIN Indexes for both FTS and Trigram acceleration
CREATE INDEX idx_network_commands_fts ON network_commands USING GIN(search_vector);
CREATE INDEX idx_network_commands_cmd_trgm ON network_commands USING GIN(command_syntax gin_trgm_ops);
CREATE INDEX idx_network_commands_title_trgm ON network_commands USING GIN(title gin_trgm_ops);
CREATE INDEX idx_network_commands_desc_unaccent_trgm ON network_commands USING GIN(immutable_unaccent(description) gin_trgm_ops);

-- 5. Comprehensive Search RPC Function
CREATE OR REPLACE FUNCTION search_network_commands(
  search_term TEXT DEFAULT '',
  filter_vendors TEXT[] DEFAULT NULL,
  filter_device_types TEXT[] DEFAULT NULL,
  filter_category TEXT DEFAULT NULL,
  limit_count INT DEFAULT 50,
  offset_count INT DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  vendor TEXT,
  device_type TEXT,
  category TEXT,
  title TEXT,
  command_syntax TEXT,
  description TEXT,
  parameters JSONB,
  examples TEXT[],
  warnings TEXT,
  relevance_score FLOAT
) LANGUAGE plpgsql AS $$
DECLARE
  clean_query TEXT := trim(search_term);
  unaccented_query TEXT := immutable_unaccent(clean_query);
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.vendor,
    c.device_type,
    c.category,
    c.title,
    c.command_syntax,
    c.description,
    c.parameters,
    c.examples,
    c.warnings,
    (
      -- Scoring priority:
      -- 1. Exact command syntax / title match (highest boost)
      CASE WHEN c.command_syntax ILIKE clean_query || '%' THEN 5.0 ELSE 0.0 END +
      CASE WHEN c.title ILIKE clean_query || '%' THEN 3.0 ELSE 0.0 END +
      -- 2. Trigram similarity score on command & unaccented description
      (similarity(c.command_syntax, clean_query) * 2.5) +
      (similarity(immutable_unaccent(c.description), unaccented_query) * 2.0) +
      -- 3. Full-Text Search ts_rank on search_vector
      CASE WHEN clean_query <> '' AND c.search_vector @@ plainto_tsquery('simple', unaccented_query) 
           THEN ts_rank(c.search_vector, plainto_tsquery('simple', unaccented_query)) * 1.5 
           ELSE 0.0 END
    )::FLOAT AS relevance_score
  FROM network_commands c
  WHERE
    (filter_vendors IS NULL OR c.vendor = ANY(filter_vendors))
    AND (filter_device_types IS NULL OR c.device_type = ANY(filter_device_types))
    AND (filter_category IS NULL OR c.category = filter_category)
    AND (
      clean_query = ''
      OR c.command_syntax ILIKE '%' || clean_query || '%'
      OR immutable_unaccent(c.description) ILIKE '%' || unaccented_query || '%'
      OR immutable_unaccent(c.title) ILIKE '%' || unaccented_query || '%'
      OR c.command_syntax % clean_query
      OR (c.search_vector @@ plainto_tsquery('simple', unaccented_query))
    )
  ORDER BY 
    CASE WHEN clean_query = '' THEN 0 ELSE relevance_score END DESC,
    c.vendor ASC,
    c.title ASC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$;
```

### Client-side Integration Pattern
In the React application, invoke the RPC directly via the Supabase client:
```javascript
const { data, error } = await supabase.rpc('search_network_commands', {
  search_term: debouncedQuery,
  filter_vendors: selectedVendors.length > 0 ? selectedVendors : null,
  filter_device_types: selectedDeviceTypes.length > 0 ? selectedDeviceTypes : null,
  limit_count: 50,
  offset_count: 0
});
```

---

## Key Libraries

### 1. `papaparse` (`^5.5.4`)
* **Purpose**: Robust CSV parsing and exporting for bulk network command data.
* **Why this library**:
  * Auto-detects delimiters (comma, semicolon, tab, pipe).
  * Safely handles multi-line fields (e.g. multi-line configuration blocks or complex examples containing commas and quotes).
  * Fast streaming parsing without UI freezing.
* **Install command**: `npm install papaparse`

### 2. `zod` (`^3.24.2`)
* **Purpose**: Runtime data validation for individual forms and bulk CSV/JSON imports.
* **Why this library**:
  * Validates imported rows against strict schemas (allowed vendors: `cisco`, `juniper`, `fortinet`, `palo_alto`, `mikrotik`, `aruba`, `huawei`; device types: `switch`, `router`, `firewall`, `ap_wlc`).
  * Returns user-friendly field-level error messages (e.g., *"Row 14: Invalid vendor 'Ciscoo'. Did you mean 'Cisco'?"*).
* **Install command**: `npm install zod`

### 3. `cmdk` (`^1.0.4`)
* **Purpose**: Fast headless command palette component with keyboard navigation (`Ctrl+K` / `Cmd+K`, arrow keys, escape, enter).
* **Why this library**:
  * Unstyled, fully accessible, and composable with existing Tailwind CSS styling.
  * Instant client-side filtering on cached command titles with zero lag.
* **Install command**: `npm install cmdk`

### 4. `prismjs` (`^1.30.0`)
* **Purpose**: Syntax highlighting engine for network CLI commands.
* **Why this library**:
  * Includes built-in grammar support for `cisco` / Cisco IOS syntax and shell/bash.
  * Very lightweight compared to Shiki or Monaco (~15KB gzipped vs 2MB+).
  * Easily extensible with custom regex rules for vendor-specific tokens (`set ...`, `display ...`, `config ...`, `<placeholder>`, `[optional]`).
* **Install command**: `npm install prismjs`

---

## What NOT to Use

| Tool / Technology | Why NOT to Use | Recommended Alternative |
|-------------------|----------------|-------------------------|
| **ElasticSearch / Algolia / Meilisearch** | Heavy external dependencies requiring dedicated infrastructure, additional monthly hosting costs, and real-time synchronization pipelines from Supabase. Network command datasets (< 50,000 items) are handled effortlessly by PostgreSQL within single-digit milliseconds. | Supabase PostgreSQL with `pg_trgm`, `unaccent`, and GIN indexing via RPC functions. |
| **Monaco Editor / Ace Editor** | Weighs 2MB–5MB+ in JavaScript bundle size and requires complex worker configurations. Network command lookup only requires read-only code display and copying, not an IDE text editing environment. | Custom Tailwind-styled code cards with `prismjs` or micro-regex token highlighting and a 1-click clipboard button. |
| **`react-syntax-highlighter` (Default bundle)** | Pulls in hundreds of language grammars causing bundle bloat (>800KB), and has ongoing peer-dependency issues with React 19 types. | Modular `prismjs` imports or custom lightweight token renderer. |
| **Pure Client-Side In-Memory Search (for entire dataset)** | Fetching the entire database on initial page load degrades mobile performance, burns Supabase bandwidth, and fails when the command library grows to thousands of multi-vendor entries. | Debounced Supabase RPC queries with pagination (`LIMIT` / `OFFSET`) and React `useDeferredValue`. |
| **Naive CSV Parsing with `string.split('\n')`** | Breaks immediately on multiline descriptions, commas within quotation marks (`"VLAN 10,20,30"`), and varied operating system line endings (`\r\n` vs `\n`). | `papaparse` with streaming and header mapping. |
| **Heavy State Management Libraries (Redux, MobX, Zustand)** | Unnecessary boilerplate and bundle overhead for a modular lookup tool. The existing app operates cleanly with React Context and standard hooks. | React 19 native hooks (`useState`, `useReducer`, `useMemo`, `useTransition`) combined with URL search params (`useSearchParams`). |
