# Roadmap: Network Command Lookup Tool

## v1.0 — Network Command Lookup Tool

### Phase 1: Database Foundation & Auth
**Goal**: Establish the complete PostgreSQL schema on Supabase — tables, relationships, indexes, hybrid search RPC, and Row Level Security — so that every subsequent phase has a solid, performant, and secure data layer to build on.
**Requirements**: DB-01, DB-02, DB-03, DB-04, DB-05, DB-06, DB-07, DB-08, DB-09
**Depends on**: None
**Success criteria**:
1. A developer can connect to Supabase and confirm all 6 tables (`vendors`, `device_types`, `command_categories`, `canonical_actions`, `commands`, `command_device_types`) exist with correct columns and relationships
2. Calling the `search_network_commands` RPC with a Vietnamese query (e.g., "cấu hình VLAN") returns relevant results in <50ms, including unaccented input ("cau hinh VLAN")
3. An unauthenticated request to any command table is rejected by RLS; an authenticated request succeeds
4. Seed data for all 7 vendors and 4 device types is present and queryable

### Phase 2: Search UI & Command Display
**Goal**: Deliver the core user-facing experience — the `/tools` page with omnisearch bar, multi-facet filters, command card grid, and detailed command view — so that engineers can find and read commands instantly.
**Requirements**: SRCH-01, SRCH-02, SRCH-03, SRCH-04, SRCH-05, SRCH-06, SRCH-07, UI-01, UI-02, UI-03, UI-04, UI-05, UI-06
**Depends on**: Phase 1
**Success criteria**:
1. User navigates to `/tools` and sees a search bar with vendor/device-type/category filter chips; typing a query returns real-time debounced results ranked by relevance
2. User searches for "show ip route" or "cấu hình VLAN" (with or without diacritics) and receives matching command cards showing vendor badge, device type, syntax highlight, and short description
3. User clicks a command card and sees a detail panel with full syntax, Vietnamese description, examples, parameter table, warnings/cautions badge, and execution context/mode
4. User clicks the copy button on a command and the clipboard contains clean syntax without prompt characters (e.g., no `Router#` prefix)
5. Destructive commands display a prominent warning badge; execution context (e.g., "Global Config", "Interface Config") is clearly visible

### Phase 3: Data Import & Cross-Vendor Comparison
**Goal**: Enable data population at scale via add-command form and bulk CSV/JSON import, and deliver the cross-vendor comparison matrix so engineers can see equivalent commands side-by-side across all vendors.
**Requirements**: IMP-01, IMP-02, IMP-03, IMP-04, CMP-01, CMP-02
**Depends on**: Phase 2
**Success criteria**:
1. User opens the add-command form, fills in all required fields (name, syntax, description, example, vendor, device type, category), and the new command appears in search results immediately after submit
2. User uploads a CSV file and sees a preview table with valid rows highlighted green and invalid rows highlighted red; user can correct errors before final import
3. User uploads a JSON file and receives Zod schema validation feedback; valid entries are imported in bulk
4. User selects a canonical action (e.g., "Create VLAN") and sees a cross-vendor comparison matrix showing the equivalent command syntax for each vendor side-by-side
5. The comparison matrix correctly reflects data from `canonical_actions` mapping and displays all vendors that have an equivalent command

## Progress

| Phase | Plans | Status | Completed |
|-------|-------|--------|-----------|
| 1. Database Foundation & Auth | 3/3 | Complete    | 2026-08-18 |
| 2. Search UI & Command Display | 0/0 | Not started | - |
| 3. Data Import & Cross-Vendor Comparison | 0/0 | Not started | - |

---
*Created: 2026-08-18 · Granularity: coarse (3 phases) · 28 requirements mapped*
