# Scaffold Vite React TypeScript app

Type: task
Status: resolved

## Question

Scaffold the MVP app per RFC: Vite + React + TypeScript at repo root, folder skeleton (`app`, `canvas`, `domain`, `simulation`, `persistence`, `starters`, `ui`), Zustand store stub, and a blank runnable shell with Mode switcher placeholders (Design/Health/Traffic/Failure).

## Answer

Scaffolded at repo root:

- Vite + React 19 + TypeScript + Zustand
- Folders: `src/{app,canvas,domain,simulation,persistence,starters,ui}`
- Mode switcher (Design/Health/Traffic/Failure) + layout shell placeholders
- `pnpm install` + `pnpm run build` succeed

Run: `pnpm dev`
