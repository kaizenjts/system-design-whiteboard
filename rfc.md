# RFC: System Design Simulator (MVP) — Technical Approach

**Status:** Proposed  
**Date:** 2026-08-01  
**Product:** System Design Simulator (working name; may ship under System Design Whiteboard branding)  
**Depends on:** [`prd.md`](./prd.md) — product requirements are authoritative; this RFC only decides *how* to build  
**Glossary:** [`CONTEXT.md`](./CONTEXT.md)

---

## 1. Context

We will build the MVP described in `prd.md`: a local-only educational architecture playground with Design / Health / Traffic / Failure Modes on one diagram.

This RFC locks the technical approach so implementation can start without re-litigating stack, canvas, engine boundaries, or persistence.

---

## 2. Goals

- Ship a Vite + React + TypeScript SPA that implements the PRD core loop (~60s).
- Keep simulation logic **pure and testable**, independent of the canvas library.
- Prefer a boring, solo-friendly architecture over premature multiplayer/backend.

## 3. Non-goals

- Backend, auth, sync, share links, collaboration
- Replacing or reopening PRD feature cut (no Decision Mode, Cost, Score, etc. in this RFC)
- Pixel-perfect brand system (visual brand may iterate after first vertical slice)
- Production-grade capacity/chaos accuracy (Believable Teaching Model only)

---

## 4. Proposed architecture (overview)

```text
┌─────────────────────────────────────────────────────────┐
│ app/          Mode shell, layout, wiring                    │
│ ui/           Inspector, Findings, Load, legends            │
├─────────────────────────────────────────────────────────┤
│ canvas/       React Flow view + domain ↔ RF adapters        │
├─────────────────────────────────────────────────────────┤
│ domain/       Canonical diagram model                       │
│ simulation/   Pure health / traffic / failure engines       │
│ starters/     URL Shortener template data                   │
│ persistence/  localStorage + JSON import/export             │
└─────────────────────────────────────────────────────────┘
```

**Data flow**
1. User edits diagram in Design (or while in other Modes) → updates **domain** state.
2. Active Mode selects which **simulation** function(s) to run.
3. Results feed **ui/** panels and **canvas/** overlay props.
4. **persistence/** auto-saves domain diagram (not transient sim overlays).

---

## 5. Stack & project structure

| Choice | Decision |
|---|---|
| Bundler / app | **Vite** |
| UI | **React 19** (or current stable) + **TypeScript** |
| Canvas | **React Flow (`@xyflow/react`)** — MIT |
| App state | Light client store — **Zustand** recommended default |
| Backend | **None** for MVP |
| Repo shape | **Single app** at repository root (no monorepo) |

```text
src/
  app/           # shell, Mode switcher, layout
  canvas/        # React Flow wiring, custom nodes/edges, adapters
  domain/        # diagram graph types & defaults (Capacity table)
  simulation/    # pure Health / Traffic / Failure engines
  persistence/   # localStorage + import/export JSON
  starters/      # URL Shortener template
  ui/            # inspector, findings panel, load panel, shared controls
```

Package manager: whatever the implementer standardizes at scaffold time (pnpm recommended).

---

## 6. Canvas: React Flow

**Library:** `@xyflow/react`

**Responsibilities**
- Render custom Node components for palette types: Client, CDN/DNS, Load Balancer, API, Cache, Database, Queue
- Directed Edges with clear dependency/traffic direction (`A → B` = A depends on B)
- Selection → inspector
- Pan/zoom viewport
- Apply Mode overlay styles via node/edge `data` / `className` / `style`

**Adapter rule**  
React Flow’s node/edge objects are a **view model**. Canonical truth lives in `domain/`. `canvas/` maps domain → RF on render and RF events → domain updates. Do not put Health/Traffic/Failure business rules inside React Flow callbacks beyond “update domain / re-run engine.”

**Rejected for MVP:** JointJS, tldraw, Cytoscape, Konva, custom SVG, GoJS  
(See research: `.scratch/mvp-simulator-prd/research/canvas-libraries.md`)

---

## 7. Domain model (canonical)

Minimum fields (illustrative — refine in code, keep names aligned with `CONTEXT.md`):

```ts
type NodeType =
  | 'client' | 'cdn_dns' | 'load_balancer' | 'api'
  | 'cache' | 'database' | 'queue'

type DiagramNode = {
  id: string
  type: NodeType
  label: string
  position: { x: number; y: number }
  capacity?: number // override; Client has none
}

type DiagramEdge = {
  id: string
  source: string // dependent
  target: string // dependency
}

type DiagramDocument = {
  version: 1
  nodes: DiagramNode[]
  edges: DiagramEdge[]
  viewport?: { x: number; y: number; zoom: number }
}

type Mode = 'design' | 'health' | 'traffic' | 'failure'

type AppSimState = {
  diagram: DiagramDocument
  mode: Mode
  loadRps: number
  failedNodeId: string | null
}
```

**Default Capacities** (from PRD): CDN 50k, LB 20k, API 5k, Cache 20k, DB 2k, Queue 10k req/s.

---

## 8. Simulation engine

All under `src/simulation/`. **Pure functions.** No React, no React Flow, no `localStorage`.

| Module | Signature (conceptual) | Output |
|---|---|---|
| `healthCheck` | `(diagram, ctx) → Finding[]` | HC01–HC07 with severity + copy |
| `traffic` | `(diagram, loadRps) → TrafficResult` | per-node load, warning (≥80%), bottleneck (>100%) |
| `failure` | `(diagram, failedNodeId) → FailureResult` | per-node health state + reasons |

**`ctx` for health** includes at least `{ isUrlShortenerStarter: boolean }` so HC05/HC06 stay starter-only.

**Rules location:** `simulation/health/` catalog metadata + predicates; traffic equal-split + capacity compare; failure dependents-only cascade per PRD tables.

**UI contract:** store/selectors call engines when `diagram`, `mode`, `loadRps`, or `failedNodeId` change. Health Mode uses explicit **Re-run** (and run on enter). Traffic/Failure recompute live.

**Testing:** unit tests with fixture diagrams (broken path, good starter, DB failed with/without cache, load 1.5k vs 3k).

---

## 9. Persistence

| Concern | Decision |
|---|---|
| Auto-save | Debounced ~300ms → `localStorage` key **`sds.diagram.v1`** |
| Schema | JSON `version: 1` only for MVP |
| Serialized | nodes, edges, capacity overrides, optional viewport |
| Not serialized | Mode overlays, traffic attributions, failure state |
| On load | Restore diagram; start in **Design** Mode; clear sim transients |
| Export / Import | Same JSON schema as `.json` file download/upload |
| Scope | Single active diagram (no multi-doc library) |

Module: `src/persistence/`.

---

## 10. UI shell (implementation notes)

Matches PRD Mode UX; technical mapping:

| UI | Location |
|---|---|
| Mode switcher | `app/` |
| Palette + canvas | `canvas/` + `ui/` |
| Inspector (label, type, capacity) | `ui/` |
| Findings panel | `ui/` + `healthCheck` results |
| Load slider | `ui/` + `traffic` results |
| Failure controls + legend | `ui/` + `failure` results |
| Starter / Export / Import | `app/` or `ui/` actions → `starters/` + `persistence/` |

Starter path (teaching target):  
`Client → CDN → LB → API → Cache → Database`, Queue linked from API for analytics (not on sync return path).

---

## 11. Implementation sequencing (suggested)

Not tickets yet — order for post-RFC build:

1. Scaffold Vite React TS; folder skeleton; Zustand store stub  
2. Domain types + Capacity defaults + URL Shortener starter data  
3. React Flow canvas: palette, place nodes, edges, select, inspector  
4. Persistence auto-save + export/import  
5. `simulation/health` + Health Mode UI  
6. `simulation/traffic` + Traffic Mode UI  
7. `simulation/failure` + Failure Mode UI  
8. Polish core learning loop; fix starter false positives (HC05/HC06)

---

## 12. Risks & mitigations

| Risk | Mitigation |
|---|---|
| Domain ↔ RF drift (duplicate truth) | Strict adapter boundary; domain is source of truth |
| Health rules become ad-hoc UI checks | Keep predicates in `simulation/health` with tests |
| Equal-split + no hit-ratio feels “wrong” for cache | Accept per PRD; teach cache via Health, limits via Traffic |
| Scope creep into brand/templates | Defer brand rename and multi-starters post-MVP |

---

## 13. Open items (after RFC)

- Visual/brand treatment (keep Whiteboard name vs rename)
- Whether starter ships slightly broken for teaching punch vs clean
- Concrete implementation tickets / project board breakdown
- Exact React / Vite major versions at scaffold time

---

## 14. Decision log (wayfinder)

- [Research canvas libraries](.scratch/mvp-simulator-prd/issues/07-research-canvas-libraries.md)
- [Decide app stack and project structure](.scratch/mvp-simulator-prd/issues/08-app-stack-structure.md)
- [Decide canvas library](.scratch/mvp-simulator-prd/issues/09-canvas-library.md)
- [Decide simulation engine shape](.scratch/mvp-simulator-prd/issues/10-simulation-engine-shape.md)
- [Decide local persistence approach](.scratch/mvp-simulator-prd/issues/11-local-persistence.md)
- Map: [.scratch/mvp-simulator-prd/map.md](.scratch/mvp-simulator-prd/map.md)
- Product: [`prd.md`](./prd.md)
