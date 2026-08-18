---
phase: 2
slug: search-ui-command-display
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-08-18
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | React Component Verification + Node.js Verification Script |
| **Config file** | `scripts/verify_phase2.js` (Wave 0 creates) |
| **Quick run command** | `npm run build` |
| **Full suite command** | `node scripts/verify_phase2.js && npm run build` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run build`
- **After every plan wave:** Run `node scripts/verify_phase2.js && npm run build`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 1 | UI-05, UI-06 | build & route check | `grep -q '/tools/network-commands' src/App.jsx` | ❌ W0 | ⬜ pending |
| 02-01-02 | 01 | 1 | SRCH-01, SRCH-02, SRCH-07 | logic check | `grep -q 'useDebounce' src/hooks/useCommandSearch.js` | ❌ W0 | ⬜ pending |
| 02-01-03 | 01 | 1 | SRCH-03, SRCH-04, SRCH-05, SRCH-06 | component check | `grep -q 'FilterBar' src/pages/NetworkCommands.jsx` | ❌ W0 | ⬜ pending |
| 02-02-01 | 02 | 2 | UI-01, UI-03, UI-04 | component check | `grep -q 'CommandCard' src/components/network-commands/CommandCard.jsx` | ❌ W0 | ⬜ pending |
| 02-02-02 | 02 | 2 | UI-02, UI-04 | component check | `grep -q 'CommandDrawer' src/components/network-commands/CommandDrawer.jsx` | ❌ W0 | ⬜ pending |
| 02-02-03 | 02 | 2 | UI-03 | utility check | `grep -q 'copyCleanCommand' src/utils/commandUtils.js` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/hooks/useCommandSearch.js` — search and filter data fetching hook
- [ ] `src/utils/commandUtils.js` — clean syntax copy & prompt stripping utility

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Ctrl+K keyboard shortcut focus | SRCH-07 | Browser keyboard event interaction | Press `Ctrl+K` on `/tools/network-commands` and check if search input is focused |
| Right drawer animation smoothness | UI-02 | Visual transition | Click command card, ensure drawer slides smoothly from right |
| 1-Click Copy prompt stripping | UI-03 | OS clipboard verification | Click Copy on `vlan 10`, paste into text editor, verify prompt `Switch(config)#` is not copied |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
