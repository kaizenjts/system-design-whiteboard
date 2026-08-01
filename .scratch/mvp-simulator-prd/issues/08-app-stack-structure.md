# Decide app stack and project structure

Type: grilling
Status: resolved

## Question

What application stack and repo structure should the MVP use (language/framework, bundler, folder layout), sufficient for a solo-friendly web app that implements [[prd]] Modes and local-only persistence — without over-building for multiplayer or a backend?

## Answer

- **Stack:** Vite + React + TypeScript
- **Shape:** single web app at repo root — no monorepo, no backend for MVP
- **Folders:**

```text
src/
  app/           # shell, Mode switcher, layout
  canvas/        # React Flow wiring, custom nodes/edges
  domain/        # diagram graph types (Node, Edge, Capacity, …)
  simulation/    # pure Health / Traffic / Failure engines
  persistence/   # localStorage + import/export JSON
  starters/      # URL Shortener template data
  ui/            # inspector, findings panel, load panel, shared controls
```

- UI state may use a light store (Zustand or context+reducer); **`simulation/` stays pure** over the domain graph. Exact store library can be named in the simulation-engine / RFC assemble step if needed — default lean toward Zustand when writing the RFC unless contradicted later.
