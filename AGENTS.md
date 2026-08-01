# AGENTS.md — System Design Simulator

Guidance for AI agents working in this repo. Prefer these docs over inventing product or tech decisions.

## Sources of truth (read first)

| Doc | Role |
|---|---|
| [`CONTEXT.md`](./CONTEXT.md) | Glossary — use these terms; avoid listed synonyms |
| [`prd.md`](./prd.md) | Product: what/why, MVP scope, HC01–HC07, Traffic/Failure rules |
| [`rfc.md`](./rfc.md) | Tech: stack, `src/` layout, domain↔React Flow boundary, persistence |
| [`docs/agents/domain.md`](./docs/agents/domain.md) | How to consume domain docs / ADRs |
| [`docs/agents/issue-tracker.md`](./docs/agents/issue-tracker.md) | Local markdown issues under `.scratch/` |

**Product wins over code comments when they conflict with `prd.md`.**  
**RFC wins over ad-hoc structure when they conflict with `rfc.md`.**  
Do not reopen MVP feature cut (Decision Mode, Cost, Score, multi-region, accounts, etc.).

## What this product is

Educational architecture playground: learners draw a diagram and get feedback via **Health**, **Traffic**, and **Failure** Modes. Fidelity bar is a **Believable Teaching Model** — not cloud capacity planning or chaos engineering.

Primary user: engineers practicing system design (interview prep / self-study).

## Stack (locked)

Vite · React 19 · TypeScript · `@xyflow/react` · Zustand · pnpm · Vitest  
No backend for MVP.

```bash
pnpm install
pnpm dev      # local app
pnpm test     # vitest run
pnpm build    # typecheck + vite build
```

## Layout

```text
src/
  app/           # Mode shell, Zustand store, layout
  canvas/        # React Flow view + domain ↔ RF adapters
  domain/        # Canonical diagram types, capacity defaults, catalog
  simulation/    # Pure health / traffic / failure engines (+ tests)
  starters/      # URL Shortener + Notification Service templates
  persistence/   # localStorage + JSON import/export
  ui/            # Inspector, Findings, Load, Failure, palette, actions
```

Canonical graph lives in **`domain/`**. React Flow objects are a **view model** — map in `canvas/adapters.ts`. Do not put Health/Traffic/Failure business rules inside RF callbacks beyond updating domain / re-running engines.

Simulation under `src/simulation/` must stay **pure**: no React, no React Flow, no `localStorage`.

## Domain cheat sheet

- **Edge direction:** `A → B` means A depends on B (A is the Dependent).
- **Modes:** `design` | `health` | `traffic` | `failure` — lenses over one diagram.
- **Active Starter:** `url_shortener` | `notification` | `null` (not a Mode). HC05/HC06 run only when `activeStarter === 'url_shortener'`.
- **Finding severity:** High | Medium only.
- **Traffic:** global Load (req/s) from Client; Equal Split on outbound Edges; Warning ≥80% Capacity; Bottleneck >100%. Client has no Capacity.
- **Failure:** one Failed node; cascade to Dependents only; states Failed / Down / Degraded / Healthy.
- **Persistence:** diagram → `sds.diagram.v1`; session meta (incl. `activeStarter`) separate. Do not persist Mode overlays / traffic / failure state. Restore starts in Design.

Default Capacities (req/s): CDN 50k · LB 20k · API 5k · Cache 20k · DB 2k · Queue 10k.

## Working rules

1. Read `CONTEXT.md` terms before naming concepts in code or UI copy.
2. Prefer extending existing modules over new top-level folders.
3. Add/adjust Vitest coverage next to simulation and domain changes (fixtures for starter, broken path, 1.5k vs 3k / 2k vs 5k, DB fail with/without Cache).
4. Issues and wayfinder maps live in `.scratch/<effort>/` — see `docs/agents/issue-tracker.md`.
5. Build maps: `.scratch/mvp-simulator-build/`, `.scratch/notification-starter/` — check status before inventing new scope.
6. Keep learner-facing Finding copy aligned with the PRD suggested-fix table unless the ticket explicitly changes it.

## Out of scope (do not implement unless ticket expands PRD)

Accounts, cloud sync, share links, collaboration, Decision/Cost/Data-Flow/Score Modes, weighted routing, cache hit-ratio math, multi-failure, replicas/AZ/partitions, cloud SKUs/pricing.
