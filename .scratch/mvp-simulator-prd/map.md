# Map: MVP System Design Simulator PRD → RFC

## Destination

1. A written **MVP PRD** for the System Design Simulator (product what/why — no tech stack).
2. Then a written **RFC** for how we will build that MVP (technical approach), enough that implementation work can start after.

Artifacts:
- PRD: `prd.md` at the repo root ✅
- RFC: `rfc.md` at the repo root (mirrors PRD location)

## Notes

- Domain: educational system-design learning / interview prep (not production architecture review).
- Skills each session should consult: `/grilling`, `/domain-modeling`; read `CONTEXT.md` and root `prd.md`.
- Tracker: local markdown (`.scratch/`).
- Sequence locked: **PRD first (done), then RFC** — assemble `rfc.md` only after RFC decision tickets resolve.
- Product scope is fixed by `prd.md`; RFC decides *how* to build, not *what* to build. Do not reopen MVP feature cut here.
- RFC done bar (standing): Context + link to PRD; goals/non-goals; proposed architecture; stack & structure; canvas choice; simulation engine shape; persistence; high-level module boundaries; open risks; implementation sequencing outline. Still not product code.
- Plan, don't build: RFC tickets produce technical decisions + `rfc.md`, not the app.

## Decisions so far

- Post-PRD next artifact is an **RFC** (not prototype-first and not straight to implementation tickets) — locked in charting follow-up.
- [Research educational anti-patterns for Health Check](./issues/01-research-health-check-antipatterns.md) — Prefer ~6–8 topology Findings (cache/LB/DB/CDN/async Queue wiring) over production HA/security lint for Believable Teaching Model
- PRD artifact path: repo-root `prd.md` (not `.scratch/.../spec.md`) — locked while resolving Health Check catalog
- [Decide MVP Health Check findings catalog](./issues/02-health-check-findings-catalog.md) — 7 Findings HC01–HC07; High/Medium; HC05+HC06 starter-only; P2 deferred
- [Decide Failure Simulation cascade rules](./issues/03-failure-cascade-rules.md) — 4 states; dependents-only cascade; per-type Failed effects; single Failed node; no replicas/partitions/partial %
- [Decide Traffic and Bottleneck model](./issues/04-traffic-bottleneck-model.md) — global Load; equal split; defaults CDN50k/LB20k/API5k/Cache20k/DB2k/Queue10k; 80% warning/>100% bottleneck; shortener demo 1.5k→3k
- [Decide simulator mode UX shell](./issues/05-simulator-mode-ux.md) — Modes Design/Health/Traffic/Failure; Findings panel; Load panel; one Failed + legend; local save + JSON import/export; edit stays first-class
- [Assemble MVP System Design Simulator PRD](./issues/06-assemble-prd.md) — wrote repo-root [`prd.md`](../../prd.md)
- RFC artifact path: repo-root `rfc.md` — charted with RFC tickets 07–12
- [Research canvas libraries for diagram MVP](./issues/07-research-canvas-libraries.md) — Prefer React Flow (`@xyflow/react`); shortlist JointJS for React as alternate; tldraw only if whiteboard-feel is mandatory; deprioritize Cytoscape/Konva/custom SVG/GoJS
- [Decide app stack and project structure](./issues/08-app-stack-structure.md) — Vite + React + TypeScript; single app; src/{app,canvas,domain,simulation,persistence,starters,ui}; simulation pure
- [Decide canvas library](./issues/09-canvas-library.md) — React Flow (`@xyflow/react`); Mode overlays via props + panels
- [Decide simulation engine shape](./issues/10-simulation-engine-shape.md) — domain model + RF adapter; pure health/traffic/failure; UI calls engines
- [Decide local persistence approach](./issues/11-local-persistence.md) — localStorage `sds.diagram.v1`; debounce ~300ms; export/import same schema; Design on load; single diagram
- [Assemble MVP System Design Simulator RFC](./issues/12-assemble-rfc.md) — wrote repo-root [`rfc.md`](../../rfc.md)

## Not yet specified

- Visual/brand treatment of the simulator (still “Whiteboard” vs rename)
- Whether starter ships slightly broken for demo punch vs clean topology the user breaks
- Detailed implementation ticket breakdown — **charted** in [.scratch/mvp-simulator-build/map.md](../mvp-simulator-build/map.md)
## Out of scope

- Decision Mode (DB technology chooser)
- Cost Estimator
- Data Flow Mode (HTTP/gRPC/Kafka/… typing)
- Request Journey animation (“play request”)
- Architecture Score dashboards
- Multi use-case template library (Chat, E-commerce, Streaming, …) — only URL Shortener starter in MVP
- Accounts, cloud sync, share links, realtime collaboration
- Cloud-accurate pricing, SKUs, autoscaling, multi-region realism
