# Active Starter identity in session meta

Type: task
Status: resolved
Blocked by:

## Question

Replace `isUrlShortenerStarter: boolean` with **Active Starter** (`url_shortener | notification | null`) in `sds.meta.v1` persistence + store, including a safe read path for the old boolean shape, so Health and Load actions can key off the loaded template.

## Answer

- `SessionMeta.activeStarter: ActiveStarter` in `src/persistence/sessionMeta.ts`; `saveMeta` writes only the new shape.
- `loadMeta` silently maps legacy `{ isUrlShortenerStarter: true }` → `url_shortener`; prefers `activeStarter` when both present.
- Store: `activeStarter` on state / `setDiagram` meta; Health still bridged via `activeStarter === 'url_shortener'` until [Health Check uses Active Starter](./03-health-active-starter.md).
- Vitest: `src/persistence/sessionMeta.test.ts` (5); full suite 35 green.
