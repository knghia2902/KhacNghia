# Architecture Research: Network Command Lookup Tool

## Database Schema

To support fast multi-vendor search, hierarchical categorization, cross-vendor command equivalence, and rich metadata (parameters, examples, rollback, verification), the database is structured into a normalized relational model in Supabase (PostgreSQL) with specialized indexes and generated full-text search vectors.

```
                    ┌─────────────────────────┐
                    │   command_categories    │
                    │ (Hierarchical Taxonomy) │
                    └────────────┬────────────┘
                                 │ 1:N
                    ┌────────────▼────────────┐
                    │    canonical_actions    │
                    │ (Cross-Vendor Concepts) │
                    └────────────┬────────────┘
                                 │ 1:N
┌──────────────┐    ┌────────────▼────────────┐    ┌──────────────────────┐
│   vendors    ├───►│        commands         │◄───┤ command_device_types │
│ (7 Vendors)  │1:N │(CLI Syntaxes & Metadata)│1:N └──────────┬───────────┘
└──────────────┘    └────────────┬────────────┘               │ N:1
                                 │ 1:N             ┌──────────▼───────────┐
                    ┌────────────▼────────────┐    │     device_types     │
                    │    command_favorites    │    │ (Switch, Router,...) │
                    │    (User Bookmarks)     │    └──────────────────────┘
                    └─────────────────────────┘
```

---

### 1. Tables & Columns Definition

#### `vendors`
Stores the supported network equipment manufacturers and their operating systems.
```sql
CREATE TABLE vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,                -- e.g. 'Cisco', 'Fortinet', 'Juniper', 'Palo Alto', 'MikroTik', 'Aruba / HPE', 'Huawei'
    slug TEXT NOT NULL UNIQUE,                -- e.g. 'cisco', 'fortinet', 'juniper', 'paloalto', 'mikrotik', 'aruba', 'huawei'
    os_flavors TEXT[] DEFAULT '{}',           -- e.g. ['IOS', 'IOS-XE', 'NX-OS'], ['FortiOS 7.x'], ['Junos'], ['PAN-OS'], ['RouterOS v6', 'RouterOS v7'], ['AOS-CX', 'AOS-S', 'Comware'], ['VRP']
    icon_name TEXT,                           -- Material icon or logo identifier
    badge_color TEXT DEFAULT 'blue',          -- UI theme badge color
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `device_types`
Stores the hardware/appliance roles.
```sql
CREATE TABLE device_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,                -- 'Switch', 'Router', 'Firewall', 'Access Point / WLC'
    slug TEXT NOT NULL UNIQUE,                -- 'switch', 'router', 'firewall', 'ap_wlc'
    icon_name TEXT NOT NULL,                  -- 'hub', 'router', 'security', 'wifi'
    description_vi TEXT,                      -- 'Thiết bị chuyển mạch', 'Bộ định tuyến', etc.
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `command_categories`
Two-tier hierarchical categorization for grouping commands by networking domain.
```sql
CREATE TABLE command_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID REFERENCES command_categories(id) ON DELETE SET NULL,
    name_vi TEXT NOT NULL,                    -- 'VLAN & L2 Switching', 'Định tuyến IP', 'Bảo mật & ACL', 'NAT', 'Hệ thống & Quản trị'
    name_en TEXT,                             -- 'VLAN & L2 Switching', 'IP Routing', etc.
    slug TEXT NOT NULL UNIQUE,                -- 'vlan-l2', 'ip-routing', 'security-acl', 'nat', 'system-admin'
    icon_name TEXT DEFAULT 'folder',
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `canonical_actions` (The Cross-Vendor Normalization Anchor)
Acts as the universal standard task/intent identifier that links equivalent commands across different vendors.
```sql
CREATE TABLE canonical_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES command_categories(id) ON DELETE CASCADE,
    action_key TEXT NOT NULL UNIQUE,          -- Standard key e.g. 'vlan.create', 'vlan.port_trunk', 'route.static_add', 'bgp.neighbor_add', 'system.config_save', 'system.reboot', 'diag.ping'
    name_vi TEXT NOT NULL,                    -- 'Tạo VLAN mới', 'Cấu hình cổng Trunk', 'Thêm định tuyến tĩnh (Static Route)', 'Lưu cấu hình'
    name_en TEXT,                             -- 'Create VLAN', 'Configure Trunk Port', etc.
    description_vi TEXT,                      -- Chi tiết mục đích của hành động
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `commands` (Main Command Repository)
Stores CLI commands with full syntax, prompts, examples, verification, rollback, and rich Vietnamese descriptions.
```sql
CREATE TABLE commands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    canonical_action_id UUID REFERENCES canonical_actions(id) ON DELETE SET NULL,
    os_flavor TEXT,                           -- e.g. 'IOS-XE', 'FortiOS 7.2', 'Junos 21.4', 'RouterOS v7'
    command_syntax TEXT NOT NULL,             -- Primary CLI command string e.g. 'vlan <vlan_id>'
    full_syntax TEXT,                         -- Multi-line block or full syntax with options
    prompt_mode TEXT,                         -- CLI context prompt e.g. '(config)#', '[edit]', 'config system interface', '/ip route', '<HUAWEI>'
    title_vi TEXT NOT NULL,                   -- Short descriptive Vietnamese title e.g. 'Tạo VLAN và đặt tên trên Cisco IOS'
    description_vi TEXT NOT NULL,             -- Comprehensive Vietnamese explanation
    parameters JSONB DEFAULT '[]'::jsonb,     -- Structured array of parameters (name, type, required, default, description_vi)
    examples JSONB DEFAULT '[]'::jsonb,       -- Structured array of examples (scenario_vi, cli_input, cli_output, notes_vi)
    verification_command TEXT,                -- Command to verify state e.g. 'show vlan brief' or 'get router info routing-table all'
    rollback_command TEXT,                    -- Inverse/undo command e.g. 'no vlan <vlan_id>' or 'delete vlans <vlan_name>'
    notes_vi TEXT,                            -- Important warnings, firmware caveats, prerequisites
    tags TEXT[] DEFAULT '{}',                 -- ['vlan', 'l2', '802.1q', 'switching']
    is_verified BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `command_device_types` (Junction Table)
Links a command to one or multiple applicable device types (e.g. an IP route command applies to both Switch L3 and Router).
```sql
CREATE TABLE command_device_types (
    command_id UUID NOT NULL REFERENCES commands(id) ON DELETE CASCADE,
    device_type_id UUID NOT NULL REFERENCES device_types(id) ON DELETE CASCADE,
    PRIMARY KEY (command_id, device_type_id)
);
```

#### `command_favorites` (User Bookmarks)
```sql
CREATE TABLE command_favorites (
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    command_id UUID NOT NULL REFERENCES commands(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, command_id)
);
```

---

### 2. Full-Text Search Vector & Performance Indexing

To guarantee sub-50ms search times across large CLI command libraries with mixed Vietnamese natural language queries and exact CLI shorthand abbreviations:

```sql
-- 1. Helper function for immutable array to text conversion
CREATE OR REPLACE FUNCTION immutable_array_to_string(text[], text)
RETURNS text LANGUAGE sql IMMUTABLE AS $$
    SELECT array_to_string($1, $2);
$$;

-- 2. Generated TSVECTOR column with weighted search fields
ALTER TABLE commands ADD COLUMN search_vector tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('simple', coalesce(command_syntax, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(title_vi, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(description_vi, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(prompt_mode, '')), 'C') ||
    setweight(to_tsvector('simple', coalesce(verification_command, '')), 'C') ||
    setweight(to_tsvector('simple', coalesce(notes_vi, '')), 'D') ||
    setweight(to_tsvector('simple', immutable_array_to_string(tags, ' ')), 'B')
) STORED;

-- 3. GIN index for full-text search
CREATE INDEX idx_commands_search_vector ON commands USING gin (search_vector);

-- 4. Trigram extension and indexes for CLI shorthand / fuzzy prefix matching (e.g. 'sh ip int br', 'conf t')
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX idx_commands_syntax_trgm ON commands USING gin (command_syntax gin_trgm_ops);
CREATE INDEX idx_commands_title_trgm ON commands USING gin (title_vi gin_trgm_ops);

-- 5. Foreign key and filtering B-Tree / GIN indexes
CREATE INDEX idx_commands_vendor_id ON commands (vendor_id);
CREATE INDEX idx_commands_canonical_id ON commands (canonical_action_id);
CREATE INDEX idx_commands_tags ON commands USING gin (tags);
CREATE INDEX idx_command_device_types_device ON command_device_types (device_type_id);
CREATE INDEX idx_canonical_actions_category ON canonical_actions (category_id);
```

---

### 3. Row Level Security (RLS) Policies

```sql
-- Enable RLS
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE command_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE canonical_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE commands ENABLE ROW LEVEL SECURITY;
ALTER TABLE command_device_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE command_favorites ENABLE ROW LEVEL SECURITY;

-- Read policies (accessible to authenticated users per PROJECT.md requirement)
CREATE POLICY "Allow authenticated read on vendors" ON vendors FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read on device_types" ON device_types FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read on command_categories" ON command_categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read on canonical_actions" ON canonical_actions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read on commands" ON commands FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read on command_device_types" ON command_device_types FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow users to read/manage own favorites" ON command_favorites FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Write policies (Authenticated users can create / edit commands and bulk import)
CREATE POLICY "Allow authenticated insert on commands" ON commands FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by OR created_by IS NULL);
CREATE POLICY "Allow authenticated update on commands" ON commands FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated delete on commands" ON commands FOR DELETE TO authenticated USING (true);
CREATE POLICY "Allow authenticated manage command_device_types" ON command_device_types FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated manage canonical_actions" ON canonical_actions FOR ALL TO authenticated USING (true);
```

---

## Component Architecture

The Network Command Lookup tool is integrated into the existing React application at the `/tools` route. It maintains a decoupled, modular component hierarchy with single-source-of-truth URL query state management.

```
src/pages/Tools.jsx (or src/components/commands/CommandLookupContainer.jsx)
│
├── HeaderBar & Hero
│   ├── CommandHeader (Title, stats: total commands, vendor badges, Action Buttons)
│   └── SearchBarWithHotkeys (Debounced input, '/' focus hotkey, clear action, suggestions)
│
├── FilterToolbar
│   ├── VendorFilterChips (All | Cisco | Fortinet | Juniper | Palo Alto | MikroTik | Aruba | Huawei)
│   ├── DeviceTypeFilter (Switch | Router | Firewall | AP/WLC)
│   ├── CategoryDropdown (Hierarchical networking domain filter)
│   ├── TagCloudBar (Quick clickable tag filters)
│   └── ViewModeSwitcher (Cards View | Table View | Cross-Vendor Matrix View)
│
├── MainContentView
│   ├── [ViewMode === 'cards'] ────────► CommandGrid
│   │                                       ├── CommandCard (Syntax box, Copy button, Negate toggle, Badges)
│   │                                       └── CommandEmptyState (No results fallback & suggestion hints)
│   │
│   ├── [ViewMode === 'table'] ────────► CommandDataTable (Dense table for rapid scanning)
│   │
│   └── [ViewMode === 'matrix'] ───────► CrossVendorMatrixView (Side-by-side vendor comparison by Canonical Action)
│
├── Drawers & Modals
│   ├── CommandDetailDrawer (Full parameter table, interactive examples, verification, rollback, caveats)
│   ├── AddEditCommandModal (Form with parameter builder, examples editor, live CLI syntax preview)
│   ├── BulkImportModal (4-Step CSV/JSON import wizard with pre-validation table)
│   └── ConfirmDeleteModal (Safe deletion confirm dialog)
│
└── Services & Hooks
    ├── useCommandSearch (Debounce, URL sync, Supabase query execution, caching)
    ├── useCommandMutations (Add, Edit, Delete, Bulk Insert with optimistic UI)
    └── useFavorites (User bookmarking state)
```

---

### Component Responsibilities & State Flow

| Component | Responsibility | Props / State |
|-----------|----------------|---------------|
| `CommandLookupContainer` | Root coordinator. Synchronizes active filters (`q`, `vendor`, `device`, `category`, `tag`, `view`) with URL search params. | `searchParams`, `setSearchParams`, data fetching state |
| `SearchBarWithHotkeys` | Instant search input with 250ms debouncing, keyboard focus (`/` or `Ctrl+K`), and clear button. | `value`, `onChange`, `onClear` |
| `VendorFilterChips` | Horizontal scrollable chip list with vendor icons and command counts. | `selectedVendor`, `onSelectVendor`, `vendorsList` |
| `DeviceTypeFilter` | Multi-select or single-toggle pill buttons for device hardware roles. | `selectedDeviceType`, `onSelectDeviceType` |
| `CommandCard` | Compact card displaying prompt mode, syntax with variable highlighting (`<vlan_id>`), 1-click copy button, tags, and expand trigger. | `command`, `onOpenDetails`, `onToggleFavorite`, `onEdit`, `onDelete` |
| `CommandDetailDrawer` | Slide-over drawer detailing parameters table, realistic CLI scenarios, rollback command, and equivalent commands on other vendors. | `commandId`, `isOpen`, `onClose` |
| `CrossVendorMatrixView` | Side-by-side comparison table showing equivalent CLI commands across 7 vendors for a selected canonical task. | `canonicalActions`, `selectedActionId`, `matrixData` |
| `BulkImportModal` | Multi-step modal accepting CSV/JSON file drop, parsing, schema validation with error highlighting, and chunked DB commit. | `isOpen`, `onClose`, `onImportSuccess` |
| `AddEditCommandModal` | Full creation/editing form with dynamic parameter rows, example blocks, and syntax validation. | `isOpen`, `onClose`, `initialData`, `onSave` |

---

### Data Flow Pattern

1. **URL as Single Source of Truth**:
   Filter state (`?q=vlan&vendor=cisco&device=switch&view=cards`) is stored directly in browser query parameters via `useSearchParams` from `react-router-dom`. This allows engineers to share direct links to specific command lookups.
2. **Debounced Query Execution**:
   Typing in the search bar triggers a debounced (250ms) state update, executing an optimized Supabase RPC call.
3. **Optimistic Mutation Updates**:
   Adding, editing, or deleting commands immediately updates local state, followed by asynchronous Supabase synchronization and toast notification feedback.

---

## Data Import Pipeline

The import pipeline is designed to support both bulk initialization (hundreds of commands across all 7 vendors) and ongoing team contributions via CSV and JSON files.

```
┌────────────────────────────────┐
│   Upload CSV or Paste JSON     │
└───────────────┬────────────────┘
                │
┌───────────────▼────────────────┐
│      1. Parse & Tokenize       │ (PapaParse for CSV / native JSON.parse)
└───────────────┬────────────────┘
                │
┌───────────────▼────────────────┐
│      2. Schema Validation      │ (Zod validator: required fields, types, JSON structures)
└───────────────┬────────────────┘
                │
┌───────────────▼────────────────┐
│ 3. Normalization & FK Mapping  │ (Lookup/map vendor slugs, device type slugs, canonical keys)
└───────────────┬────────────────┘
                │
┌───────────────▼────────────────┐
│   4. Live Validation Preview   │ (Display valid rows [green] & invalid rows [red with errors])
└───────────────┬────────────────┘
                │ User clicks "Proceed Import"
┌───────────────▼────────────────┐
│ 5. Chunked Supabase Batch RPC  │ (Batches of 50 records with UPSERT ON CONFLICT)
└───────────────┬────────────────┘
                │
┌───────────────▼────────────────┐
│   6. Ingestion Report Modal    │ (Inserted: X, Updated: Y, Skipped: Z)
└────────────────────────────────┘
```

---

### 1. File Formats & Schemas

#### A. JSON Import Schema (Recommended for Rich Metadata)
```json
[
  {
    "vendor_slug": "cisco",
    "os_flavor": "IOS-XE",
    "canonical_action_key": "vlan.create",
    "device_types": ["switch", "router"],
    "command_syntax": "vlan <vlan_id>",
    "prompt_mode": "Switch(config)#",
    "title_vi": "Tạo mới VLAN trên Cisco IOS",
    "description_vi": "Khởi tạo một VLAN mới trong cơ sở dữ liệu VLAN của Switch.",
    "parameters": [
      {
        "name": "vlan_id",
        "type": "integer",
        "required": true,
        "description_vi": "Số hiệu VLAN hợp lệ từ 1 đến 4094"
      }
    ],
    "examples": [
      {
        "scenario_vi": "Tạo VLAN 10 đặt tên là DATA",
        "cli_input": "Switch(config)# vlan 10\nSwitch(config-vlan)# name DATA\nSwitch(config-vlan)# exit",
        "notes_vi": "Cần gõ exit để lưu thay đổi tên VLAN"
      }
    ],
    "verification_command": "show vlan id <vlan_id>",
    "rollback_command": "no vlan <vlan_id>",
    "notes_vi": "Trên switch chạy VTP Client, không thể tạo VLAN trực tiếp nếu không chuyển sang Transparent mode.",
    "tags": ["vlan", "l2", "switching", "cisco"]
  }
]
```

#### B. CSV Import Schema (Flat Format)
Header format:
```csv
vendor_slug,device_types,canonical_action_key,os_flavor,prompt_mode,command_syntax,title_vi,description_vi,verification_command,rollback_command,notes_vi,tags
cisco,"switch,router",vlan.create,IOS-XE,Switch(config)#,vlan <vlan_id>,Tạo VLAN trên Cisco IOS,Khởi tạo VLAN mới trong database,show vlan id <vlan_id>,no vlan <vlan_id>,Yêu cầu quyền enable,vlan;l2;switching
fortinet,firewall,vlan.create,FortiOS 7.x,FortiGate (vlan) #,config system interface -> edit <name> -> set vdom root -> set type vlan -> set vlanid <id>,Tạo VLAN trên FortiGate,Tạo VLAN interface con thuộc physical port,get system interface,delete <name>,Cần gán interface vật lý cha,vlan;firewall;fortios
```

---

### 2. Validation Engine (Client-Side Pre-Check)

Using a lightweight validator (e.g. Zod or custom pure-JS schema validator) before sending payloads to Supabase:
- **Required Fields**: `vendor_slug`, `command_syntax`, `title_vi`, `description_vi`, `device_types`.
- **Enum / Slug Verification**: `vendor_slug` must exist in pre-fetched vendor map (`cisco`, `fortinet`, `juniper`, `paloalto`, `mikrotik`, `aruba`, `huawei`).
- **Device Type Array Verification**: Each item in `device_types` must match `['switch', 'router', 'firewall', 'ap_wlc']`.
- **JSON Field Integrity**: `parameters` and `examples` must parse into valid JSON arrays.
- **Tag Normalization**: Strips special characters, converts to lowercase, splits semicolons/commas into a clean array.

---

### 3. Batch Database Ingestion Stored Procedure

To handle atomic upserts and auto-populate junction tables in a single transaction:

```sql
CREATE OR REPLACE FUNCTION import_network_commands_batch(payload JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    item JSONB;
    v_vendor_id UUID;
    v_canonical_id UUID;
    v_command_id UUID;
    v_device_slug TEXT;
    v_device_id UUID;
    inserted_count INT := 0;
    updated_count INT := 0;
BEGIN
    FOR item IN SELECT * FROM jsonb_array_elements(payload)
    LOOP
        -- 1. Resolve vendor_id from vendor_slug
        SELECT id INTO v_vendor_id FROM vendors WHERE slug = item->>'vendor_slug';
        IF v_vendor_id IS NULL THEN
            CONTINUE; -- Skip if vendor invalid
        END IF;

        -- 2. Resolve or create canonical_action_id if provided
        IF item->>'canonical_action_key' IS NOT NULL THEN
            SELECT id INTO v_canonical_id FROM canonical_actions WHERE action_key = item->>'canonical_action_key';
        ELSE
            v_canonical_id := NULL;
        END IF;

        -- 3. Upsert into commands table (conflict on vendor + command_syntax + os_flavor)
        INSERT INTO commands (
            vendor_id,
            canonical_action_id,
            os_flavor,
            command_syntax,
            full_syntax,
            prompt_mode,
            title_vi,
            description_vi,
            parameters,
            examples,
            verification_command,
            rollback_command,
            notes_vi,
            tags
        ) VALUES (
            v_vendor_id,
            v_canonical_id,
            item->>'os_flavor',
            item->>'command_syntax',
            COALESCE(item->>'full_syntax', item->>'command_syntax'),
            item->>'prompt_mode',
            item->>'title_vi',
            item->>'description_vi',
            COALESCE(item->'parameters', '[]'::jsonb),
            COALESCE(item->'examples', '[]'::jsonb),
            item->>'verification_command',
            item->>'rollback_command',
            item->>'notes_vi',
            ARRAY(SELECT jsonb_array_elements_text(COALESCE(item->'tags', '[]'::jsonb)))
        )
        ON CONFLICT (id) DO UPDATE SET
            title_vi = EXCLUDED.title_vi,
            description_vi = EXCLUDED.description_vi,
            parameters = EXCLUDED.parameters,
            examples = EXCLUDED.examples,
            updated_at = NOW()
        RETURNING id INTO v_command_id;

        -- 4. Associate device types in junction table
        IF item->'device_types' IS NOT NULL THEN
            DELETE FROM command_device_types WHERE command_id = v_command_id;
            FOR v_device_slug IN SELECT * FROM jsonb_array_elements_text(item->'device_types')
            LOOP
                SELECT id INTO v_device_id FROM device_types WHERE slug = v_device_slug;
                IF v_device_id IS NOT NULL THEN
                    INSERT INTO command_device_types (command_id, device_type_id)
                    VALUES (v_command_id, v_device_id)
                    ON CONFLICT DO NOTHING;
                END IF;
            END LOOP;
        END IF;

        inserted_count := inserted_count + 1;
    END LOOP;

    RETURN jsonb_build_object(
        'success', true,
        'processed_count', inserted_count
    );
END;
$$;
```

---

## Search Architecture

Network engineers search for commands in three distinct ways:
1. **By CLI Shorthand / Syntax**: e.g., `sh ip bgp sum`, `conf t`, `set int ge-0/0/0`, `wr mem`, `no shut`.
2. **By Vietnamese Intent / Functional Goal**: e.g., `cấu hình trunking vlan`, `tạo static route`, `xem bảng mac`, `chặn ip nguồn`, `lưu cấu hình`.
3. **By Cross-Vendor Equivalence**: e.g., finding the Fortinet or MikroTik equivalent of Cisco's `show ip route`.

The search architecture combines PostgreSQL Full-Text Search (`tsvector`) with Trigram fuzzy similarity (`pg_trgm`) and structured relational filters inside a single Supabase RPC function.

```
┌──────────────────────────────────────────────────────────┐
│                    User Search Input                     │
│  "cấu hình vlan"  OR  "sh ip ro"  OR  "fortinet static"  │
└────────────────────────────┬─────────────────────────────┘
                             │ Debounce 250ms
┌────────────────────────────▼─────────────────────────────┐
│                 React `useCommandSearch`                 │
│      Builds RPC parameters & handles active filters      │
└────────────────────────────┬─────────────────────────────┘
                             │ Supabase RPC call
┌────────────────────────────▼─────────────────────────────┐
│           PostgreSQL `search_network_commands`           │
│                                                          │
│  ┌──────────────────────┐      ┌──────────────────────┐  │
│  │   Full-Text Search   │      │   Trigram Matching   │  │
│  │  (ts_rank_cd weight) │  +   │ (similarity on CLI)  │  │
│  └──────────────────────┘      └──────────────────────┘  │
│                           │                              │
│              Structured Relational Filters               │
│          (vendor_id, device_type_id, category_id)        │
└────────────────────────────┬─────────────────────────────┘
                             │ Ranked JSON array results
┌────────────────────────────▼─────────────────────────────┐
│                   UI Render Pipeline                     │
│  - Highlight matched keywords                            │
│  - Display syntax snippet with 1-click copy              │
│  - Show cross-vendor comparison pill                     │
└──────────────────────────────────────────────────────────┘
```

---

### Supabase Search RPC Implementation

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
    prompt_mode TEXT,
    title_vi TEXT,
    description_vi TEXT,
    os_flavor TEXT,
    verification_command TEXT,
    rollback_command TEXT,
    notes_vi TEXT,
    tags TEXT[],
    parameters JSONB,
    examples JSONB,
    vendor JSONB,
    device_types JSONB,
    canonical_action JSONB,
    relevance_score FLOAT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_clean_query TEXT := trim(coalesce(p_query, ''));
    v_tsquery tsquery;
BEGIN
    IF v_clean_query <> '' THEN
        -- Generate tsquery with prefix matching for natural language
        v_tsquery := websearch_to_tsquery('simple', v_clean_query);
    END IF;

    RETURN QUERY
    SELECT 
        c.id,
        c.command_syntax,
        c.prompt_mode,
        c.title_vi,
        c.description_vi,
        c.os_flavor,
        c.verification_command,
        c.rollback_command,
        c.notes_vi,
        c.tags,
        c.parameters,
        c.examples,
        jsonb_build_object(
            'id', v.id,
            'name', v.name,
            'slug', v.slug,
            'badge_color', v.badge_color
        ) AS vendor,
        COALESCE(
            (
                SELECT jsonb_agg(jsonb_build_object('id', dt.id, 'name', dt.name, 'slug', dt.slug, 'icon_name', dt.icon_name))
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
                    'name_vi', ca.name_vi
                )
            ELSE NULL
        END AS canonical_action,
        (
            CASE 
                WHEN v_clean_query = '' THEN 1.0
                ELSE (
                    -- FTS rank weight
                    coalesce(ts_rank_cd(c.search_vector, v_tsquery), 0.0) * 3.0 +
                    -- Trigram CLI syntax similarity weight
                    similarity(c.command_syntax, v_clean_query) * 4.0 +
                    -- Exact prefix match boost
                    CASE WHEN c.command_syntax ILIKE v_clean_query || '%' THEN 5.0 ELSE 0.0 END +
                    -- Tag exact match boost
                    CASE WHEN c.tags @> ARRAY[lower(v_clean_query)] THEN 4.0 ELSE 0.0 END
                )
            END
        )::FLOAT AS relevance_score
    FROM commands c
    JOIN vendors v ON v.id = c.vendor_id
    LEFT JOIN canonical_actions ca ON ca.id = c.canonical_action_id
    LEFT JOIN command_categories cat ON cat.id = ca.category_id
    WHERE
        -- Filter by Vendor
        (p_vendor_id IS NULL OR c.vendor_id = p_vendor_id)
        -- Filter by Device Type
        AND (
            p_device_type_slug IS NULL OR EXISTS (
                SELECT 1 FROM command_device_types cdt
                JOIN device_types dt ON dt.id = cdt.device_type_id
                WHERE cdt.command_id = c.id AND dt.slug = p_device_type_slug
            )
        )
        -- Filter by Category
        AND (p_category_slug IS NULL OR cat.slug = p_category_slug)
        -- Search matching
        AND (
            v_clean_query = '' OR
            c.search_vector @@ v_tsquery OR
            c.command_syntax ILIKE '%' || v_clean_query || '%' OR
            c.title_vi ILIKE '%' || v_clean_query || '%' OR
            c.tags @> ARRAY[lower(v_clean_query)]
        )
    ORDER BY relevance_score DESC, c.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$;
```

---

## Build Order

To deliver maximum value early while mitigating technical risks, implementation is phased across six discrete milestones:

```
┌────────────────────────────────────────────────────────────────────────┐
│ Phase 1: Database Foundation & Migrations                              │
│ - Create tables, indexes (GIN + Trigram), RLS policies, Search RPC    │
│ - Seed 7 vendors & 4 device types                                      │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
┌──────────────────────────────────▼─────────────────────────────────────┐
│ Phase 2: Data Import Engine & Initial Seed Dataset                     │
│ - Build BulkImportModal (CSV & JSON parser with live validation preview)│
│ - Ingest baseline commands across all 7 vendors                        │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
┌──────────────────────────────────▼─────────────────────────────────────┐
│ Phase 3: Core Search & Browsing UI                                     │
│ - Build SearchBar (hotkeys, debounced queries, URL sync)               │
│ - Build VendorFilterChips, DeviceTypeFilter, CategoryDropdown          │
│ - Build CommandCard & CommandGrid with 1-click copy & syntax highlight │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
┌──────────────────────────────────▼─────────────────────────────────────┐
│ Phase 4: Command Details & Cross-Vendor Matrix View                    │
│ - Build CommandDetailDrawer (parameters, examples, rollback, verification)│
│ - Build CrossVendorMatrixView (side-by-side comparison for canonicals) │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
┌──────────────────────────────────▼─────────────────────────────────────┐
│ Phase 5: Single Command CRUD & Management                              │
│ - Build AddEditCommandModal with parameter builder & example blocks    │
│ - Delete confirmation modal & optimistic UI updates                    │
│ - Export filtered commands to CSV/JSON                                 │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
┌──────────────────────────────────▼─────────────────────────────────────┐
│ Phase 6: Polish, Performance Tuning & Verification                     │
│ - Sub-50ms query benchmarking, mobile responsiveness & dock alignment  │
│ - Dark/Light mode theme verification & end-to-end user testing         │
└────────────────────────────────────────────────────────────────────────┘
```

### Detailed Phase Breakdown

1. **Phase 1: Database Foundation & Migrations**
   - Apply SQL migrations in Supabase: tables (`vendors`, `device_types`, `command_categories`, `canonical_actions`, `commands`, `command_device_types`, `command_favorites`).
   - Enable `pg_trgm` extension and create weighted `search_vector` GIN indexes.
   - Configure RLS policies for authenticated access.
   - Deploy `search_network_commands` and `import_network_commands_batch` stored procedures.
   - Seed core vendor reference data (Cisco, Fortinet, Juniper, Palo Alto, MikroTik, Aruba/HPE, Huawei) and device types.

2. **Phase 2: Data Import Pipeline & Baseline Dataset**
   - Develop client-side validation schema for CSV and JSON file structures.
   - Implement `BulkImportModal` with drag-and-drop file upload, live error validation table, and chunked batch submission.
   - Seed baseline dataset (VLANs, Static Routing, BGP, OSPF, ACLs, NAT, Interface Config, System Save/Reboot) across all 7 vendors.

3. **Phase 3: Core Search & Browsing UI (`/tools`)**
   - Implement `CommandLookupContainer` within `/tools` route.
   - Build `SearchBarWithHotkeys` (250ms debounced input, `/` hotkey focus, clear button, URL query sync).
   - Build `VendorFilterChips` (horizontal scrollable pills with badge icons) and `DeviceTypeFilter` chips.
   - Build `CommandCard` featuring prompt mode badge, syntax block with copy-to-clipboard button, Vietnamese description, and tags.

4. **Phase 4: Detailed Views & Cross-Vendor Comparison Matrix**
   - Build `CommandDetailDrawer` showing structured parameter tables, copyable CLI input/output examples, verification command, rollback command, and version caveats.
   - Implement `CrossVendorMatrixView` enabling network engineers to pick a canonical task (e.g. "Configure Trunk Port") and view equivalent commands side-by-side across Cisco, Fortinet, Juniper, Palo Alto, MikroTik, Aruba, and Huawei.

5. **Phase 5: Single Command CRUD & Management**
   - Build `AddEditCommandModal` allowing authenticated users to add or modify commands with dynamic parameter/example form builders and live syntax preview.
   - Implement safe deletion modal with optimistic cache updates.
   - Add export feature (download filtered results as JSON/CSV cheat sheet).

6. **Phase 6: Polish, Performance Tuning & Verification**
   - Benchmark search execution times on Supabase to ensure <50ms response latency.
   - Verify layout responsiveness across desktop, tablet, and mobile (proper padding, scrollable tables, floating Dock compatibility).
   - Test dark and light mode contrast across code syntax blocks and badges.
