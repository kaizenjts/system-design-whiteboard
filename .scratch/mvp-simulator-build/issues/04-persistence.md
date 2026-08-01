# Local persistence and JSON import/export

Type: task
Status: resolved
Blocked by: 02, 03

## Question

Implement `persistence/`: debounced auto-save to `localStorage` key `sds.diagram.v1`, restore on load into Design Mode, Export/Import JSON with the same v1 schema (nodes, edges, capacities, optional viewport — no sim transients).

## Answer

- `src/persistence/diagramStorage.ts`: serialize/parse v1, `saveDiagram`/`loadDiagram` on injectable storage; key `sds.diagram.v1`
- Hydrate store from localStorage on boot (Design Mode); debounced ~300ms auto-save via `useDiagramAutoSave`
- Header actions: Load starter, Export, Import (same JSON schema)
- Vitest covers round-trip, version reject, storage seam
