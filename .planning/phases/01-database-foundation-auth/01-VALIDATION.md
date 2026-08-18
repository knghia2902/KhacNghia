---
phase: 1
slug: database-foundation-auth
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-08-18
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Node.js script with @supabase/supabase-js |
| **Config file** | `scripts/verify_phase1.js` (Wave 0 creates) |
| **Quick run command** | `node scripts/verify_phase1.js` |
| **Full suite command** | `node scripts/verify_phase1.js --full` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `node scripts/verify_phase1.js`
- **After every plan wave:** Run `node scripts/verify_phase1.js --full`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 1 | DB-01 | schema check | `SELECT count(*) FROM vendors` | ❌ W0 | ⬜ pending |
| 01-01-02 | 01 | 1 | DB-02 | schema check | `SELECT count(*) FROM device_types` | ❌ W0 | ⬜ pending |
| 01-01-03 | 01 | 1 | DB-03 | schema check | `SELECT count(*) FROM command_categories` | ❌ W0 | ⬜ pending |
| 01-01-04 | 01 | 1 | DB-04 | schema check | `SELECT count(*) FROM canonical_actions` | ❌ W0 | ⬜ pending |
| 01-01-05 | 01 | 1 | DB-05 | schema check | `SELECT column_name FROM information_schema.columns WHERE table_name='commands'` | ❌ W0 | ⬜ pending |
| 01-01-06 | 01 | 1 | DB-06 | schema check | `SELECT count(*) FROM command_device_types` | ❌ W0 | ⬜ pending |
| 01-02-01 | 02 | 1 | DB-07 | RPC test | `SELECT * FROM search_network_commands('cấu hình VLAN')` | ❌ W0 | ⬜ pending |
| 01-02-02 | 02 | 1 | DB-07 | RPC test | `SELECT * FROM search_network_commands('cau hinh VLAN')` | ❌ W0 | ⬜ pending |
| 01-01-07 | 01 | 1 | DB-08 | index check | `SELECT indexname FROM pg_indexes WHERE tablename='commands'` | ❌ W0 | ⬜ pending |
| 01-01-08 | 01 | 1 | DB-09 | RLS test | Anon SELECT returns 0 rows; Auth SELECT returns rows | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `scripts/verify_phase1.js` — automated verification script for DB-01 through DB-09
- [ ] Supabase project accessible with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY

*Existing infrastructure covers Supabase client (`src/lib/supabaseClient.js`).*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| RLS unauthenticated rejection | DB-09 | Requires testing with anon key vs auth session | 1. Open browser in incognito 2. Navigate to app 3. Verify no command data loads without login |
| Search performance <50ms | DB-07 | Network latency varies | Run RPC via SQL Editor, check `EXPLAIN ANALYZE` timing |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
