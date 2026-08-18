---
task_id: 20260819-interactive-network-topology
type: quick
status: in_progress
created_at: "2026-08-19T00:36:10+07:00"
description: "Implement interactive SVG network topology mode allowing engineers to visually click devices (Router, Switch, Firewall, AP/WLC) and filter commands"
---

# Quick Plan: Interactive Network Topology Viewer

## Objective
Add a lightweight, interactive SVG topology viewer mode (Option 2) that visually diagrams an enterprise network architecture (WAN/Router -> Firewall -> Core Switch -> Access Switch -> AP/WLC). Clicking any device filters commands and highlights relevant configuration directives.

## Key Changes
1. Create `src/components/network-commands/TopologyViewer.jsx` with pure SVG/Tailwind interactive diagram.
2. Add View Mode Toggle (`grid` vs `topology`) in `FilterBar.jsx` or `NetworkCommands.jsx`.
3. Integrate into `NetworkCommands.jsx` with synchronized device type filter states.
4. Verify with ESLint and Vite build.
