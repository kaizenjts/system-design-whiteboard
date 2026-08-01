# Notification Service starter diagram

Type: task
Status: resolved
Blocked by:

## Question

Add `createNotificationStarter()` (topology locked on the map) under `starters/`, with Vitest covering shape plus Traffic (~2k clean / ~5k Database bottleneck) and Failure (Queue fail → sync Healthy; Database fail → API Degraded).

## Answer

- `createNotificationStarter()` in `src/starters/notification.ts`
- Topology realized as `Client → LB → API → Cache → Database` + `API → Queue` (no CDN). Cache stays on the Database path so Failure yields **Degraded** API — pure API⇉Cache|Database fan-out would mark API **Down** under current cascade rules.
- Traffic: no bottleneck at 2k; Database bottleneck at 5k (full sync load through Cache→DB; Queue side-emit unchanged).
- Vitest: `src/starters/notification.test.ts` (shape + traffic + failure); suite 38 green.
