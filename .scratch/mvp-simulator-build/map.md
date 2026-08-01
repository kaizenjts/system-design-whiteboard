# Map: Build MVP System Design Simulator

## Destination

A **working MVP web app** that satisfies [`prd.md`](../../prd.md) and follows [`rfc.md`](../../rfc.md): Design canvas + Health / Traffic / Failure Modes, URL Shortener starter, local persistence — enough to run the ~60s core loop.

## Notes

- Product truth: root `prd.md`. Tech truth: root `rfc.md`. Glossary: `CONTEXT.md`.
- Skills: `/implement`, `/tdd` where fitting; do not reopen MVP feature cut.
- Tracker: local markdown under this folder.
- Stack locked: Vite + React + TypeScript, `@xyflow/react`, Zustand, pure `simulation/`, `sds.diagram.v1` persistence.
- Plan then build: each ticket is an implementation slice, not a product-scope decision.

## Decisions so far

- [Scaffold Vite React TypeScript app](./issues/01-scaffold-vite-react-ts.md) — Vite+React+TS+Zustand shell; Mode switcher; folder skeleton; `pnpm build` OK
- [Domain + starter](./issues/02-domain-and-starter.md) — Vitest TDD; `defaultCapacity` + URL Shortener starter; diagram v1 types; `pnpm test` 3 green
- [React Flow canvas](./issues/03-react-flow-canvas.md) — `@xyflow/react` palette/edit/inspector; domain↔RF adapters; Design Mode usable
- [Persistence](./issues/04-persistence.md) — `sds.diagram.v1` auto-save/restore; Export/Import; Load starter; parse tests green
- [Health Mode](./issues/05-health-mode.md) — `healthCheck` HC01–HC07 + Findings UI/highlight; starter ctx; 18 tests green
- [Traffic Mode](./issues/06-traffic-mode.md) — `simulateTraffic` equal-split + queue side-emit; Load UI; 1.5k/3k starter demo; 22 tests green
- [Failure Mode](./issues/07-failure-mode.md) — `simulateFailure` cascade + UI Simulate/Clear/legend; 28 tests green
- [Polish core-loop](./issues/08-polish-core-loop.md) — smoke Health→Traffic→Failure; meta persist; empty CTA + fitView; 30 tests green

## Not yet specified

- Visual/brand polish beyond usable MVP chrome
- Whether starter ships slightly broken for demo punch (product fog from prior map)
- Deploy/hosting target

## Out of scope

- Everything listed out of scope in `prd.md` / non-goals in `rfc.md`
- Backend, auth, sync, collaboration
