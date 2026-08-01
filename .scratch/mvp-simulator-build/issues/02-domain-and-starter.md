# Domain model, capacities, and URL Shortener starter

Type: task
Status: resolved
Blocked by: 01

## Question

Implement `domain/` types (diagram document v1, nodes, edges, Mode, capacities) with PRD default Capacity table, plus `starters/` URL Shortener diagram data (`Client → CDN → LB → API → Cache → Database`, Queue from API for analytics).

## Answer

TDD (Vitest) on two seams:

- `defaultCapacity(type)` in `src/domain/capacity.ts` — PRD literals; Client → `undefined`
- `createUrlShortenerStarter()` in `src/starters/urlShortener.ts` — `DiagramDocument` v1 with teaching topology + API→Queue

Also: `DiagramNode` / `DiagramEdge` / `DiagramDocument` / `NodeType` in `src/domain/types.ts`. Run: `pnpm test` (3 passing).
