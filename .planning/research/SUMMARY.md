# Research Summary: Network Command Lookup Tool

## Recommended Stack
- **Core Framework & Styling**: React `^19.2.0` (with `useTransition` / `useDeferredValue` for non-blocking search), Vite `^7.2.4`, Tailwind CSS `^4.1.18`, React Router DOM `^7.12.0` (URL query param state sync via `useSearchParams`).
- **Database & Backend**: PostgreSQL 15+ hosted on Supabase (`@supabase/supabase-js ^2.90.1`) with `pg_trgm`, `unaccent`, and GIN-indexed generated `tsvector` columns.
- **Search Engine**: PostgreSQL Hybrid RPC function (`search_network_commands`) combining weighted Full-Text Search, unaccented Vietnamese intent matching, and Trigram similarity for CLI abbreviations (`sh ip int br`).
- **Data Import & Validation**: `papaparse ^5.5.4` for RFC 4180 multi-line CSV streaming and `zod ^3.24.2` for strict runtime schema validation.
- **UI & Syntax Highlighting**: Lightweight `prismjs ^1.30.0` with custom tokenizers (supporting `{{variable}}` templates and vendor syntax) and `cmdk ^1.0.4` for `Ctrl+K` / `/` search palettes.
- **Icons**: Material Symbols Outlined (zero-bundle web font).

---

## Table Stakes Features
- **Instant Hybrid Omnisearch**: Sub-50ms search supporting full CLI commands, standard abbreviations (`conf t`, `sh run`, `dis ip int br`), protocol keywords (BGP, OSPF, VLAN), and unaccented/accented Vietnamese natural language queries (*"cấu hình cổng trunk"*, *"định tuyến tĩnh"*).
- **Prompt-Free 1-Click Copy**: Visual terminal prompts (`Router(config)#`, `[edit]`, `config system interface`) separated from the copyable syntax to avoid pasting prompt artifacts into live terminals.
- **Explicit Execution Context**: Prominent badges indicating CLI execution mode (User EXEC, Config Mode, Interface View, Menu Hierarchy) for all 7 vendors (Cisco, Fortinet, Juniper, Palo Alto, MikroTik, Aruba/HPE, Huawei).
- **Multi-Facet Filtering**: Filter by Vendor (7 brands), Device Type (Switch, Router, Firewall, AP/WLC), and Hierarchical Category (L2 Switching, L3 Routing, Security/ACL, VPN, System Admin).
- **Comprehensive Command Details**: Standardized syntax, parameter descriptions, realistic multi-line examples, verification commands (`show` / `get`), rollback commands (`no` / `delete`), and high-visibility safety warnings for destructive actions.

---

## Architecture Highlights
- **Normalized Concept-Command Relational Model**: Decoupled `canonical_actions` (universal intent anchor, e.g., `vlan.create`) from `commands` (vendor-specific CLI implementations). Eliminates the anti-pattern of rigid vendor columns and seamlessly accommodates multi-line blocks, asymmetric step counts, and new OS flavors.
- **URL-First State Synchronization**: All search terms, active vendor chips, device toggles, and view modes are mirrored in URL search parameters (`?q=vlan&vendor=cisco&view=matrix`), enabling instant deep-linking and browser history navigation.
- **Dual-Engine Search RPC**: Single database procedure combining `ts_rank_cd` on weighted precomputed vectors, Trigram similarity on command syntax/titles, and relational filters, completely bypassing slow unindexed table scans.
- **Transactional Bulk Import Pipeline**: 4-step wizard (Upload $\rightarrow$ PapaParse/JSON parsing $\rightarrow$ Zod schema pre-validation $\rightarrow$ Chunked Supabase batch RPC upsert) with live error reporting.
- **Modular View Layouts**: Grid cards with 1-click vendor tab switches, compact data table for rapid scanning, and a dedicated Cross-Vendor Comparison Matrix.

---

## Top Pitfalls to Avoid
1. **Stripping CLI Context Hierarchy**: Never store flat commands without the required configuration mode. Misplaced commands trigger syntax errors or apply accidental global overrides in production.
2. **Ignoring Destructive Execution & Commit Differences**: Explicitly flag commands that overwrite configuration (e.g., Cisco `switchport trunk allowed vlan` without `add`) and highlight commit models (Junos/PAN-OS candidate configs vs. Cisco/FortiOS immediate apply).
3. **Hardcoded Vendor Columns in Schema**: Avoid monolithic tables (`cisco_cmd`, `juniper_cmd`). Use relational `canonical_actions` $\rightarrow$ `commands` mapping.
4. **Accent-Sensitive Vietnamese Search Failures**: Standard PostgreSQL `to_tsvector` fails on unaccented input. Precompute `immutable_unaccent()` stored vectors and use `pg_trgm` GIN indexes.
5. **Over-Fetching Entire Datasets into Client State**: Do not run `SELECT *` on mount and filter via client JS. Use debounced (250ms) server-side RPC pagination (`LIMIT`/`OFFSET`).
6. **Corrupting Imports with Naive String Splitting**: Never parse multi-line CLI scripts or quoted fields with `split('\n')`. Enforce UTF-8 encoding and use PapaParse.

---

## Key Recommendations
- **Standardize Variable Templates**: Use a strict `{{variable_name}}` format (e.g., `vlan {{vlan_id}}`) across all vendor entries to enable dynamic syntax highlighting and interactive value injection.
- **Safety Warnings on High-Risk Commands**: Implement distinct color-coded callouts (`destructive: true`) for disruptive actions (`reload`, `write erase`, `clear session`, `debug all`).
- **Prioritize Vietnamese + Standard CLI English**: Focus descriptive content and parameter explanations on clear Vietnamese while keeping CLI keywords in standard vendor syntax.
- **Lightweight Syntax Rendering**: Avoid heavy code editors (Monaco/Ace) or bloated highlighters; use modular PrismJS grammars inside Tailwind-styled code cards.

---

## Build Order
```
Phase 1: Database Foundation & Migrations (Tables, GIN/Trigram Indexes, RLS, Search RPC, Reference Seeds)
   └── Phase 2: Data Import Engine & Seed Dataset (Zod Schemas, BulkImportModal, Baseline 7-Vendor Ingestion)
         └── Phase 3: Core Search & Browsing UI (SearchBar with / hotkey, Filter Chips, CommandCard Grid)
               └── Phase 4: Command Details & Cross-Vendor Matrix (Detail Drawer, Side-by-Side Equivalence View)
                     └── Phase 5: CRUD Operations & Customization (Add/Edit Form, Parameter Builder, CSV Export)
                           └── Phase 6: Performance Benchmarking & Polish (Sub-50ms query tuning, Mobile/Dock verification)
```
