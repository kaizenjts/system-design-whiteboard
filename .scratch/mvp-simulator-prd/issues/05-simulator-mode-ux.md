# Decide simulator mode UX shell

Type: grilling
Status: resolved
Blocked by: 02, 03, 04

## Question

How does the learner enter and exit Architecture Health Check, Traffic Simulation, and Failure Simulation on the canvas, and what do they see?

Decide the MVP interaction shell only: entry points, what overlays/panels appear, how Findings/Bottlenecks/Blast Radius are shown, and how this coexists with manual editing. No visual design system work — just product behavior clear enough for the PRD acceptance criteria.

## Answer

(Pre-agreed to agent recommendations for this ticket.)

### Mode switcher
Four mutually exclusive **Modes** in a top-level control:

| Mode | Purpose |
|---|---|
| **Design** (default) | Full manual edit: palette, place Nodes, draw Edges, select/inspector |
| **Health** | Architecture Health Check |
| **Traffic** | Traffic / Bottleneck Simulation |
| **Failure** | Failure Simulation |

Leaving a mode clears that mode’s overlays; diagram data (nodes/edges/capacity) persists.

### Design mode
- Left **palette**: Client, CDN/DNS, Load Balancer, API, Cache, Database, Queue
- Canvas: drag, connect directed Edges, delete, select
- **Inspector** (selection): label, type, Capacity (hidden for Client; shows default + override for others)
- Actions: Open URL Shortener **Starter Template**, Export JSON, Import JSON
- Auto-save to local persistence on change; restore on reload

### Health mode
- On enter (and on “Re-run”): evaluate HC01–HC07; show **Findings panel** (severity, title, explanation, suggested fix)
- Click a Finding → highlight involved Nodes/Edges
- Canvas editing remains allowed; changes require Re-run (or auto re-run after short debounce — PRD accepts either; prefer **Re-run button** for clarity)
- Empty state: “No findings — nice topology” when catalog clean

### Traffic mode
- Side panel: global **Load** control (req/s)
- Nodes show attributed Load vs Capacity; **Warning** (≥80%) and **Bottleneck** (>100%) overlays; paths through Bottleneck nodes highlighted
- Select node → edit Capacity override in inspector
- Editing graph allowed; Load attribution recomputes live when Load or topology/capacity changes

### Failure mode
- Select a Node → **Simulate failure** (sets that node Failed; clears any previous Failed — one at a time)
- **Clear failure** control
- Canvas overlays Node Health States (Failed / Down / Degraded / Healthy) + short legend
- Clicking a non-Healthy node shows one-line why (e.g. “Down: depends on Failed Database”)
- Graph edit allowed; cascade recomputes when Failed target or topology changes

### Coexistence rule
Manual design is never removed. Simulator modes are lenses over the same diagram, not separate documents.

### Out of UX MVP
Mode-specific undo stacks, split-view multi-mode, realtime collab cursors, animated request journeys, dense design-system polish (color tokens etc. → later / brand fog).
