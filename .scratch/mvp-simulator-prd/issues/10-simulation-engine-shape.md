# Decide simulation engine shape

Type: grilling
Status: resolved

## Question

How should Health Check, Traffic attribution, and Failure cascade be structured in code (pure functions over a diagram graph model vs store-coupled logic; where rules live; how Modes subscribe to results) so the RFC can guide implementation without prescribing every file?

## Answer

- **`domain/`** holds the canonical diagram model (nodes, edges, capacity, active Mode, Load, failedNodeId, etc.), independent of React Flow’s view model.
- **`canvas/`** adapters map domain ↔ React Flow nodes/edges (including Mode overlay props).
- **`simulation/`** is pure (no React, no React Flow):
  - `healthCheck(diagram, ctx) → Finding[]` — HC01–HC07 as predicates + catalog metadata under `simulation/health/`
  - `traffic(diagram, load) → attributions + warning/bottleneck flags`
  - `failure(diagram, failedNodeId) → Node Health States / Blast Radius`
- App/UI store invokes engines when Mode, diagram, Load, or failed node changes; engines never subscribe to UI.
- Prefer unit-testing `simulation/` directly against fixture diagrams (including URL Shortener starter).
