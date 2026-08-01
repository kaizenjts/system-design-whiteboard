# Starter picker dropdown UX

Type: task
Status: resolved
Blocked by: 01, 02

## Question

Replace the single “Load starter” control with a short menu/dropdown: **URL Shortener** | **Notification Service**. Choosing one loads that diagram, sets Active Starter, and fits the view (same load semantics as today’s Load starter).

## Answer

- `STARTERS` / `starterById` catalog in `src/starters/catalog.ts` (labels + factories).
- Header **Load starter** is a `<details>` menu with both options; choice calls `setDiagram(..., { activeStarter })` (fitView via existing `diagramRevision`).
- Vitest catalog tests; suite 41 green; `pnpm build` OK.
- Empty-canvas CTA still URL-Shortener-only — deferred to dual-starter polish.
