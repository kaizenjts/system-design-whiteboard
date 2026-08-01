# Traffic engine and Traffic Mode UI

Type: task
Status: resolved
Blocked by: 02, 03

## Question

Implement pure `simulation/traffic` (global Load, equal split, 80% warning / >100% bottleneck) and Traffic Mode UI: Load control, overlays, live recompute, Capacity override via inspector.

## Answer

- Pure `simulateTraffic(diagram, loadRps)`: equal-split on sync outbound edges; Queue edges are async side-emits (copy load, don't dilute sync path) so PRD starter demo holds (1.5k clean, 3k → DB bottleneck)
- Traffic Mode UI: Load slider/presets, live overlays + req/s on nodes, capacity override for selection
- Vitest: linear path, equal split, starter 1.5k/3k, ≥80% warning
