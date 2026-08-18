---
task_id: 20260818-unify-badge-colors
type: quick
status: complete
completed_at: "2026-08-18T16:58:40+07:00"
description: "Unified vendor and card badge colors into a clean, monochromatic system to eliminate visual noise"
---

# Quick Task Summary: Unify Badge Colors & Eliminate Visual Noise

## Outcome
- Removed multi-colored hardcoded vendor badge styles (blue, red, green, orange, etc.) across `CommandCard.jsx` and `CommandDrawer.jsx`.
- Converted all vendor badges to a unified monochromatic high-contrast badge (`bg-[#1d2624] dark:bg-white text-white dark:text-[#1d2624]`) with standardized height (`h-6`) and border-radius (`rounded-lg`).
- Preserved clean soft badges for OS flavors and destructive warnings without visual clutter.
- Successfully verified with `npx eslint` and `npm run build`.
