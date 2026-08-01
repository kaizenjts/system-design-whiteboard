# React Flow canvas: palette, edit, inspector

Type: task
Status: resolved
Blocked by: 01, 02

## Question

Implement `canvas/` with `@xyflow/react`: custom nodes for all palette types, directed edges, place/connect/delete, selection → inspector (label, type, Capacity). Domain ↔ RF adapters; Design Mode fully usable for manual diagramming.

## Answer

- Added `@xyflow/react`; domain is source of truth via `toFlowNodes` / `toFlowEdges` (`src/canvas/adapters.ts`, Vitest covered)
- Palette place, drag, connect directed edges, delete (key + inspector), selection → inspector (label / type / capacity override)
- Custom node component registered for all MVP `NodeType`s; Zustand holds `diagram` + `selectedNodeId`
