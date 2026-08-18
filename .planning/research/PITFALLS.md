# Pitfalls Research: Network Command Lookup Tool

## Critical Pitfalls
Mistakes that break core functionality, corrupt data, or render the lookup tool unusable in real network operations.

### 1. Stripping CLI Hierarchy & Execution Context
* **The Pitfall**: Storing commands as flat single lines (e.g., `ip address 192.168.1.1 255.255.255.0` or `set ip 10.0.0.1/24`) without the required configuration mode/context hierarchy.
* **Why It Breaks**: Network OS CLI architectures operate in strict modal hierarchies:
  * **Cisco IOS/IOS-XE**: User Exec (`>`) $\rightarrow$ Privileged Exec (`#`) $\rightarrow$ Global Config (`(config)#`) $\rightarrow$ Interface Config (`(config-if)#`).
  * **Juniper Junos**: Operational mode (`user@host>`) $\rightarrow$ Config mode (`[edit]`) $\rightarrow$ Hierarchy level (`[edit interfaces ge-0/0/0 unit 0 family inet]`) or flat `set` commands.
  * **Fortinet FortiOS**: Multi-level blocks (`config system interface` $\rightarrow$ `edit port1` $\rightarrow$ `set ip 192.168.1.1/24` $\rightarrow$ `end`).
  * **MikroTik RouterOS v6/v7**: Menu path hierarchy (`/ip address add address=... interface=...`).
  * **Huawei VRP**: User View (`<Huawei>`) $\rightarrow$ System View (`[Huawei]`) $\rightarrow$ Interface View (`[Huawei-GigabitEthernet0/0/1]`).
* **Consequence**: Engineers pasting commands in the wrong mode trigger syntax errors or, worse, apply global changes instead of interface-level overrides in production.
* **Failure Mode**: Multi-line command blocks lose structural ordering (`config`, `edit`, `set`, `next`, `end`), generating incomplete/invalid syntax.

### 2. Destructive Command Discrepancies Across Vendors
* **The Pitfall**: Failing to highlight behavior discrepancies and execution side-effects across vendors for ostensibly identical tasks.
* **Why It Breaks**:
  * **VLAN Trunking**: In Cisco IOS, `switchport trunk allowed vlan 10,20` **overwrites** existing allowed VLANs (cutting off existing traffic), whereas adding requires `switchport trunk allowed vlan add 10,20`. In contrast, ArubaOS-CX or Junos handle member lists differently.
  * **Commit vs. Immediate Apply**:
    * Cisco IOS / FortiOS / MikroTik apply commands immediately upon pressing `Enter`.
    * Juniper Junos and Palo Alto PAN-OS use candidate configuration databases requiring explicit `commit` (with `commit confirmed <min>` safety rollbacks).
    * Huawei VRP uses immediate execution in classic mode, but system commit in newer CloudEngine VRP8.
  * **Factory Reset / Reboot**: `write erase` (Cisco) vs `execute factoryreset` (FortiOS) vs `request system zeroize` (Junos) vs `system reset-configuration` (MikroTik).
* **Consequence**: Network engineers running commands under false assumptions about rollback safety or overwriting behavior can cause severe production network outages.

### 3. Hardcoded Vendor Columns in Database Schema (Anti-Pattern)
* **The Pitfall**: Designing a monolithic table where each vendor is a column:
  ```sql
  -- ANTI-PATTERN: DO NOT USE
  CREATE TABLE command_lookup (
      id UUID PRIMARY KEY,
      task_name TEXT,
      cisco_ios TEXT,
      juniper_junos TEXT,
      fortinet_fortios TEXT,
      palo_alto TEXT,
      mikrotik TEXT
  );
  ```
* **Why It Breaks**:
  * Cannot support multiple OS variants per vendor (e.g., Cisco IOS vs. IOS-XE vs. NX-OS vs. ASA/FTD).
  * Cannot store multi-line configuration blocks or multi-step execution steps without messy delimiter parsing.
  * Cannot handle asymmetric mappings (e.g., Task A requires 1 command in Cisco, but 4 sequential commands in FortiOS, and 2 distinct commands in Junos).
  * Schema migrations are required every time a new vendor (e.g., Huawei, Aruba, VyOS) is added.

### 4. Accent & Tone Insensitivity in Vietnamese PostgreSQL Full-Text Search
* **The Pitfall**: Relying on standard PostgreSQL `to_tsvector('english', ...)` or naive `ILIKE '%query%'` for Vietnamese search.
* **Why It Breaks**:
  * Vietnamese users search interchangeably with accents (`cấu hình vlan`, `định tuyến tĩnh`, `mở port firewall`) and without accents (`cau hinh vlan`, `dinh tuyen tinh`, `mo port firewall`).
  * Standard PostgreSQL `english` or `simple` text search configurations do not strip Vietnamese combining diacritics (dấu sắc, huyền, hỏi, ngã, nặng, đ, ư, ơ, â, ê, ô).
  * `tsvector` tokenizes `cấu` and `cau` as completely distinct words, returning 0 results if the user types unaccented input.
* **Consequence**: Over 70% of search queries in real-world Vietnamese developer workflows fail to return relevant commands.

---

## Performance Pitfalls
Architectural and query issues causing interface lag, high database utilization, and slow lookups.

### 1. Inefficient `ILIKE '%...%'` Sequential Scans Across Large Datasets
* **The Pitfall**: Running queries like `WHERE command ILIKE '%term%' OR description ILIKE '%term%'` without proper index support.
* **Why It Causes Slowness**:
  * Leading wildcard searches (`%term%`) cannot utilize standard B-Tree indexes, forcing PostgreSQL to perform sequential table scans (`Seq Scan`) reading every row from disk.
  * As the command library grows to 5,000+ commands with rich metadata, descriptions, syntax notes, and parameters, query response times climb from 15ms to 800ms+, causing noticeable UI typing debounce delays and consuming Supabase connection pool bandwidth.

### 2. Over-Fetching Dataset to Client for In-Memory Filtering
* **The Pitfall**: Fetching all commands (`SELECT * FROM commands`) into React state on initial mount and filtering with JavaScript `Array.prototype.filter()`.
* **Why It Causes Slowness**:
  * Generates large network payloads (megabytes of JSON containing multi-line examples, syntax explanations, and parameter tables).
  * Blocks main thread on lower-powered devices / mobile screens during filtering, sorting, and state synchronization.
  * Breaks pagination and real-time subscription performance.

### 3. Rendering Massive Lists of Syntax-Highlighted DOM Nodes
* **The Pitfall**: Rendering hundreds of commands simultaneously, each containing code blocks, copy buttons, syntax badges, and nested parameter accordions without windowing/virtualization.
* **Why It Causes Slowness**:
  * DOM nodes multiply rapidly (100 commands $\times$ 35 DOM nodes each = 3,500+ active elements).
  * Markdown parsing (e.g., `react-markdown`, `rehype-highlight`) running synchronously inside card components triggers severe frame drops during search input and filter toggling.

### 4. Lack of Normalized Search Index Columns (On-The-Fly Vector Computation)
* **The Pitfall**: Computing text normalization and vector transformation on the fly during every search query:
  ```sql
  -- SLOW: Computes unaccent and tsvector for every row dynamically
  SELECT * FROM commands 
  WHERE to_tsvector('simple', unaccent(title || ' ' || description)) @@ to_tsquery('simple', unaccent('vlan'));
  ```
* **Why It Causes Slowness**: Dynamic expression evaluation bypasses precomputed indexes unless an exact functional index is created, causing high CPU consumption on Supabase.

---

## UX Pitfalls
User experience flaws that frustrate network engineers during time-sensitive troubleshooting or configuration tasks.

### 1. Copying CLI Prompt Characters into Clipboard
* **The Pitfall**: Including terminal prompts (`Router#`, `Switch(config)#`, `admin@fortigate#`, `[edit]`, `admin@PA-500>`) directly inside the copyable code snippet.
* **Why It Confuses Users**:
  * When engineers click "Copy" and paste into a live terminal/SSH session, the prompt string causes immediate syntax errors (`Switch(config)# Switch(config)# vlan 10` $\rightarrow$ `% Invalid input detected`).
  * In scripting or automated deployment (Ansible, Netmiko, Python), stray prompts break automated command execution.

### 2. Disregarding Common Network CLI Abbreviations
* **The Pitfall**: Requiring canonical full command names in search queries without alias or abbreviation resolution.
* **Why It Confuses Users**:
  * Network engineers rarely type full syntax (`show ip interface brief`, `configure terminal`, `write memory`).
  * Instead, they search with standard abbreviations: `sh ip int br`, `sh run`, `conf t`, `wr`, `no shut`, `int gi0/1`, `sh ip ro`.
  * If search index strictly matches `show ip interface brief`, queries for `sh ip int br` return zero results.

### 3. Visual Clutter & Wall-of-Text Command Cards
* **The Pitfall**: Displaying syntax definitions, extensive parameter options, full config examples, and vendor caveats all expanded at once in a dense card grid.
* **Why It Confuses Users**:
  * High cognitive load when scanning for the exact syntax in an urgent network maintenance window.
  * Primary command syntax gets buried under long Vietnamese descriptions or exhaustive argument lists.

### 4. Poor Side-by-Side Vendor Comparison Layout
* **The Pitfall**: Displaying comparative commands (e.g., Cisco vs. Juniper vs. Fortinet) in a wide horizontal table with 6+ rigid columns.
* **Why It Confuses Users**:
  * Unusable on laptop screens or mobile devices due to extreme horizontal scrolling or severe text truncation.
  * Asymmetric steps (e.g., 1 line in Cisco vs. 4 lines in Fortinet) cause irregular row heights and misaligned comparison blocks.

### 5. Missing Direct Search Feedback & Empty State Guidance
* **The Pitfall**: Showing a blank screen or generic "No commands found" when a combined filter (e.g., Vendor: `MikroTik` + Device: `Firewall` + Query: `BGP EVPN`) yields zero matches.
* **Why It Confuses Users**:
  * Users do not know whether the command does not exist in the database, whether the vendor does not support the feature, or whether their query was too restrictive.
  * Fails to suggest alternative vendors or broader search terms.

---

## Data Quality Pitfalls
Data modeling, inconsistency, and validation issues when importing or storing commands across diverse vendors.

### 1. Inconsistent Placeholder & Variable Syntax Across Datasets
* **The Pitfall**: Mixing arbitrary parameter formatting without a defined token standard:
  * Cisco entry: `interface GigabitEthernet <slot/port>`
  * Juniper entry: `set interfaces [interface-name] unit {unit-number}`
  * Fortinet entry: `set ip $IP_ADDRESS $SUBNET_MASK`
  * MikroTik entry: `add address=IP_ADDR/NETMASK interface=NAME`
* **Why It Causes Data Issues**:
  * Prevents UI components from performing consistent syntax highlighting for user variables vs. reserved CLI keywords.
  * Breaks interactive parameter substitution tools (e.g., filling in IP/VLAN values before copying).

### 2. CSV/JSON Bulk Import Corruption from Multi-line Code & Special Characters
* **The Pitfall**: Using naive CSV parsers or line-by-line splitters for importing network commands.
* **Why It Causes Data Issues**:
  * Network CLI snippets frequently contain characters that break CSV formatting:
    * Newlines (`\n`) inside multi-line configuration blocks.
    * Double quotes (`"`), single quotes (`'`), backslashes (`\`).
    * Pipes (`|` used in `include`, `section`, `match`).
    * Brackets, braces, dollar signs (`$`), semicolons (`;` in Junos/Cisco scripts).
  * Naive CSV parsing splits rows on internal newlines or commas, causing database import errors, truncated commands, and mismatched column shifts.

### 3. Encoding Garbling of Vietnamese Diacritics (Mojibake)
* **The Pitfall**: Exporting/importing data using Windows ANSI / Windows-1258 / CP1252 instead of strict UTF-8 without BOM.
* **Why It Causes Data Issues**:
  * Vietnamese diacritics become corrupt strings: `Cáº¥u hÃ¬nh` instead of `Cấu hình`, `Ä‘á»‹nh tuyáº¿n` instead of `định tuyến`.
  * Corrupted text permanently ruins full-text search indexing and database readability.

### 4. Version Drift & Firmware Incompatibilities
* **The Pitfall**: Storing commands without specifying OS version / firmware lineage.
* **Why It Causes Data Issues**:
  * **MikroTik RouterOS**: v6 vs. v7 underwent radical syntax shifts (e.g., `/routing bgp` configuration in v6 vs. `/routing/bgp/connection` template model in v7).
  * **Fortinet FortiOS**: Major changes between 6.4, 7.0, and 7.4 (e.g., SD-WAN rule syntax, zero-trust network access configurations).
  * **Cisco**: Classic IOS vs. IOS-XE 17.x vs. NX-OS (e.g., interface range syntax, EVPN/VXLAN configurations).
  * Commands entered without an OS version tag mislead users configuring newer or older firmware releases.

---

## Prevention Strategies
Concrete architectural, database, and UI patterns to eliminate every pitfall identified above.

### 1. Robust Multi-Vendor Database Schema (Concept-Command Relational Model)
To avoid the hardcoded-column anti-pattern and handle multi-step, multi-vendor commands cleanly, separate high-level **Networking Tasks (Concepts)** from **Vendor-Specific Command Implementations**.

```sql
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- 1. Concepts / Tasks Table (Vendor-agnostic)
CREATE TABLE command_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_name_vi TEXT NOT NULL,          -- e.g. "Cấu hình cổng Access và gán VLAN"
    task_name_en TEXT NOT NULL,          -- e.g. "Configure Access Port and Assign VLAN"
    category TEXT NOT NULL,              -- e.g. "VLAN & Trunking", "Routing", "Security", "NAT"
    device_types TEXT[] NOT NULL,        -- e.g. ARRAY['Switch', 'Router']
    description_vi TEXT,                 -- Detailed Vietnamese explanation
    keywords TEXT[],                     -- Synonyms: ['access', 'vlan', 'port', 'untagged', 'pvid']
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Vendor Implementations Table (1 Task -> Many Vendor Commands)
CREATE TABLE vendor_commands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES command_tasks(id) ON DELETE CASCADE,
    vendor TEXT NOT NULL,                -- 'Cisco', 'Juniper', 'Fortinet', 'Palo Alto', 'MikroTik', 'Aruba', 'Huawei'
    os_name TEXT NOT NULL,               -- 'IOS-XE', 'NX-OS', 'Junos', 'FortiOS', 'RouterOS', 'PAN-OS', 'VRP'
    os_version TEXT,                     -- '7.x+', 'v7', '17.x', etc.
    device_type TEXT NOT NULL,           -- 'Switch', 'Router', 'Firewall', 'AP'
    
    -- Execution Details
    prompt_mode TEXT,                    -- e.g. 'config-if', '[edit interfaces]', 'config system interface', '/interface'
    command_syntax TEXT NOT NULL,        -- Standardized template: "switchport mode access\nswitchport access vlan {{vlan_id}}"
    command_example TEXT NOT NULL,       -- Concrete example: "switchport mode access\nswitchport access vlan 10"
    verification_command TEXT,           -- e.g. "show interface {{interface}} switchport"
    rollback_command TEXT,               -- e.g. "no switchport access vlan" or "rollback 1"
    
    -- Safety & Metadata
    is_destructive BOOLEAN DEFAULT FALSE,
    requires_commit BOOLEAN DEFAULT FALSE,
    warning_notes_vi TEXT,               -- e.g. "Lưu ý: Lệnh này sẽ ngắt kết nối tạm thời trên port"
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for lightning-fast relational joins & filters
CREATE INDEX idx_vendor_commands_task_id ON vendor_commands(task_id);
CREATE INDEX idx_vendor_commands_vendor ON vendor_commands(vendor);
CREATE INDEX idx_vendor_commands_device_type ON vendor_commands(device_type);
```

---

### 2. Vietnamese Unaccented Full-Text & Trigram Hybrid Search in Supabase
Implement a dual-tier search strategy combining:
1. **Normalized Search Document (tsvector + unaccent)** for fast keyword/phrase matching.
2. **Trigram Similarity (`pg_trgm`)** for typo tolerance and partial abbreviation matching (`sh ip int br`).

```sql
-- 1. Create an immutable unaccent function for use in generated columns/indexes
CREATE OR REPLACE FUNCTION immutable_unaccent(text)
  RETURNS text AS
$func$
  SELECT public.unaccent('public.unaccent', $1)
$func$ LANGUAGE sql IMMUTABLE PARALLEL SAFE STRICT;

-- 2. Add precomputed search vector column to command_tasks
ALTER TABLE command_tasks ADD COLUMN search_vector tsvector
GENERATED ALWAYS AS (
    setweight(to_tsvector('simple', immutable_unaccent(coalesce(task_name_vi, ''))), 'A') ||
    setweight(to_tsvector('simple', immutable_unaccent(coalesce(task_name_en, ''))), 'A') ||
    setweight(to_tsvector('simple', immutable_unaccent(coalesce(array_to_string(keywords, ' '), ''))), 'B') ||
    setweight(to_tsvector('simple', immutable_unaccent(coalesce(description_vi, ''))), 'C')
) STORED;

-- 3. GIN Indexes for high-speed search
CREATE INDEX idx_command_tasks_search_vector ON command_tasks USING GIN(search_vector);
CREATE INDEX idx_command_tasks_trgm_name_vi ON command_tasks USING GIN(immutable_unaccent(task_name_vi) gin_trgm_ops);
CREATE INDEX idx_command_tasks_trgm_name_en ON command_tasks USING GIN(immutable_unaccent(task_name_en) gin_trgm_ops);

-- 4. Database RPC function for Hybrid Search & Filter in Supabase
CREATE OR REPLACE FUNCTION search_network_commands(
    search_query TEXT DEFAULT '',
    filter_vendor TEXT DEFAULT NULL,
    filter_device_type TEXT DEFAULT NULL,
    filter_category TEXT DEFAULT NULL,
    limit_count INT DEFAULT 50,
    offset_count INT DEFAULT 0
)
RETURNS TABLE (
    task_id UUID,
    task_name_vi TEXT,
    task_name_en TEXT,
    category TEXT,
    device_types TEXT[],
    description_vi TEXT,
    keywords TEXT[],
    vendor_commands JSONB,
    search_rank REAL
) AS $$
DECLARE
    normalized_query TEXT := immutable_unaccent(trim(search_query));
    query_tsquery tsquery := plainto_tsquery('simple', normalized_query);
BEGIN
    RETURN QUERY
    SELECT 
        ct.id AS task_id,
        ct.task_name_vi,
        ct.task_name_en,
        ct.category,
        ct.device_types,
        ct.description_vi,
        ct.keywords,
        COALESCE(
            jsonb_agg(
                jsonb_build_object(
                    'id', vc.id,
                    'vendor', vc.vendor,
                    'os_name', vc.os_name,
                    'os_version', vc.os_version,
                    'device_type', vc.device_type,
                    'prompt_mode', vc.prompt_mode,
                    'command_syntax', vc.command_syntax,
                    'command_example', vc.command_example,
                    'verification_command', vc.verification_command,
                    'is_destructive', vc.is_destructive,
                    'requires_commit', vc.requires_commit,
                    'warning_notes_vi', vc.warning_notes_vi
                )
            ) FILTER (WHERE vc.id IS NOT NULL),
            '[]'::jsonb
        ) AS vendor_commands,
        CASE 
            WHEN search_query = '' THEN 1.0::REAL
            ELSE (
                ts_rank(ct.search_vector, query_tsquery) * 2.0 +
                similarity(immutable_unaccent(ct.task_name_vi), normalized_query) * 1.5 +
                similarity(immutable_unaccent(ct.task_name_en), normalized_query) * 1.0
            )::REAL
        END AS search_rank
    FROM command_tasks ct
    LEFT JOIN vendor_commands vc ON ct.id = vc.task_id
        AND (filter_vendor IS NULL OR vc.vendor = filter_vendor)
        AND (filter_device_type IS NULL OR vc.device_type = filter_device_type)
    WHERE 
        (filter_category IS NULL OR ct.category = filter_category)
        AND (filter_device_type IS NULL OR filter_device_type = ANY(ct.device_types))
        AND (
            search_query = ''
            OR ct.search_vector @@ query_tsquery
            OR immutable_unaccent(ct.task_name_vi) % normalized_query
            OR immutable_unaccent(ct.task_name_en) % normalized_query
            OR EXISTS (
                SELECT 1 FROM vendor_commands vsub 
                WHERE vsub.task_id = ct.id 
                AND (
                    immutable_unaccent(vsub.command_syntax) ILIKE '%' || normalized_query || '%'
                    OR immutable_unaccent(vsub.command_example) ILIKE '%' || normalized_query || '%'
                )
            )
        )
    GROUP BY ct.id
    ORDER BY search_rank DESC, ct.task_name_vi ASC
    LIMIT limit_count OFFSET offset_count;
END;
$$ LANGUAGE plpgsql STABLE;
```

---

### 3. CLI Command Standardization & Variable Template Standard
Adopt a strict double curly brace `{{variable_name}}` parameter template standard across all vendors to enable automatic token highlighting and interactive parameter input.

| Vendor | Prompt Mode | Standardized Syntax Template | Clean Copy Output (Example) |
| :--- | :--- | :--- | :--- |
| **Cisco IOS-XE** | `(config-if)#` | `switchport mode access`<br>`switchport access vlan {{vlan_id}}` | `switchport mode access`<br>`switchport access vlan 10` |
| **Juniper Junos** | `[edit]` | `set interfaces {{interface}} unit 0 family ethernet-switching vlan members {{vlan_id}}` | `set interfaces ge-0/0/1 unit 0 family ethernet-switching vlan members 10` |
| **Fortinet FortiOS**| `config system interface` | `edit {{interface}}`<br>&nbsp;&nbsp;`set ip {{ip_address}} {{subnet_mask}}`<br>`end` | `edit port1`<br>&nbsp;&nbsp;`set ip 192.168.1.1 255.255.255.0`<br>`end` |
| **MikroTik RouterOS**| `/interface vlan` | `add name={{vlan_name}} vlan-id={{vlan_id}} interface={{interface}}` | `add name=VLAN10_USERS vlan-id=10 interface=ether1` |
| **Palo Alto PAN-OS** | `[edit]` | `set network interface ethernet {{interface}} layer3 ip {{ip_address}}/{{mask}}` | `set network interface ethernet ethernet1/1 layer3 ip 192.168.1.1/24` |
| **Huawei VRP** | `[Huawei-GigabitEthernet0/0/1]` | `port link-type access`<br>`port default vlan {{vlan_id}}` | `port link-type access`<br>`port default vlan 10` |

#### Prompt Handling Rule in UI:
* **Display Visual Only**: The prompt mode (e.g., `Switch(config-if)#`) is rendered as a distinct muted badge on top of the code box.
* **Clipboard Copy**: Clicking the Copy button copies **strictly the command lines**, never the prompt label.

---

### 4. Robust Import & Validation Pipeline (JSON/CSV with Zod Schema)
To prevent encoding corruption and invalid foreign keys during bulk data import, define strict schemas using Zod and perform atomic transactional inserts.

```javascript
// Validation Schema for Command Tasks & Vendor Implementations
import { z } from 'zod';

export const VendorCommandSchema = z.object({
  vendor: z.enum(['Cisco', 'Fortinet', 'Juniper', 'Palo Alto', 'MikroTik', 'Aruba', 'Huawei']),
  os_name: z.string().min(1),
  os_version: z.string().optional().default('All'),
  device_type: z.enum(['Switch', 'Router', 'Firewall', 'AP']),
  prompt_mode: z.string().min(1),
  command_syntax: z.string().min(1),
  command_example: z.string().min(1),
  verification_command: z.string().optional(),
  rollback_command: z.string().optional(),
  is_destructive: z.boolean().default(false),
  requires_commit: z.boolean().default(false),
  warning_notes_vi: z.string().optional()
});

export const CommandTaskImportSchema = z.object({
  task_name_vi: z.string().min(3, "Tên lệnh tiếng Việt tối thiểu 3 ký tự"),
  task_name_en: z.string().min(3, "Task name English min 3 chars"),
  category: z.enum(['VLAN & Trunking', 'Routing', 'Security & ACL', 'NAT & Port Forward', 'Interface & IP', 'System & Maintenance', 'VPN & Tunnel', 'QoS', 'Wireless']),
  device_types: z.array(z.enum(['Switch', 'Router', 'Firewall', 'AP'])).min(1),
  description_vi: z.string().min(5),
  keywords: z.array(z.string()).default([]),
  implementations: z.array(VendorCommandSchema).min(1, "Phải có ít nhất 1 hãng hỗ trợ")
});

export const BulkImportPayloadSchema = z.array(CommandTaskImportSchema);
```

#### CSV Import Safety Rules:
1. **Mandatory UTF-8 Encoding**: Reject non-UTF-8 files or decode via `TextDecoder('utf-8')` to protect Vietnamese characters.
2. **Proper Quoted Multi-line Parser**: Use RFC 4180 compliant CSV parsers (e.g. `PapaParse` with `quotes: true`, `skipEmptyLines: true`) instead of raw regex string splitting.
3. **Atomic Transactions**: In Supabase, wrap multi-row imports in an RPC transaction so that if row 45 fails validation, rows 1–44 roll back cleanly rather than leaving orphan records.

---

### 5. UI/UX Best Practices for Network Engineers

```
+----------------------------------------------------------------------------------------------------+
| [ Search: "chia vlan" or "sh ip int br"                  ] [ Vendor: All v ] [ Device: Switch v ]   |
+----------------------------------------------------------------------------------------------------+
| Categories: ( All ) ( VLAN & Trunking ) ( Routing ) ( Security ) ( Interface ) ( NAT )             |
+----------------------------------------------------------------------------------------------------+
|                                                                                                    |
| +------------------------------------------------------------------------------------------------+ |
| | Cấu hình cổng Access và gán VLAN                                          [ Switch ] [ VLAN ]  | |
| | Configure Access Port and Assign VLAN                                                          | |
| |                                                                                                | |
| | > Vendor Select: [ Cisco (IOS-XE) * ] [ Fortinet ] [ Juniper ] [ MikroTik ] [ Huawei ]         | |
| |                                                                                                | |
| | Context Mode: Switch(config-if)#                                        [ Copy ] [ Compare ]   | |
| | +--------------------------------------------------------------------------------------------+ | |
| | | switchport mode access                                                                     | | |
| | | switchport access vlan 10                                                                  | | |
| | +--------------------------------------------------------------------------------------------+ | |
| |                                                                                                | |
| | Verification: show interface gigabitethernet0/1 switchport                                     | |
| | ! Warning: Cổng sẽ reset STP state trong giây lát khi chuyển đổi mode                         | |
| +------------------------------------------------------------------------------------------------+ |
|                                                                                                    |
+----------------------------------------------------------------------------------------------------+
```

* **Interactive Vendor Tabs on Each Card**: Default to primary vendor (e.g. Cisco), with 1-click tabs to switch instantly between Fortinet, Juniper, MikroTik, etc., avoiding multi-column grid overload.
* **Side-by-Side Compare Modal**: Dedicated comparison modal allowing users to select 2 or 3 vendors to view side-by-side with clear aligned diff blocks.
* **Destructive Command Badge**: Highlight dangerous commands with high-visibility alert styling (`bg-red-500/10 text-red-500 border-red-500/30`) and prompt a safety reminder.
* **One-Click Quick Copy with Feedback**: Click-to-copy button with checkmark animation, tooltip, and auto-dismiss after 2 seconds.
* **Keyboard Shortcut Support**: Press `/` or `Ctrl+K` (`Cmd+K`) to focus search input instantly.
