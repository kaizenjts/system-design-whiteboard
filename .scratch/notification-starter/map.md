# Map: Notification Service starter

## Destination

Ship **Starter Template Notification Service** plus UX to **choose** URL Shortener or Notification Service when loading a starter. Notification has a demable Health → Traffic → Failure loop. Chat and other templates are out of scope.

## Notes

- Glossary: root `CONTEXT.md` (**Starter Template**, **Active Starter**). Product baseline: `prd.md` (HC catalog, capacities) — extend carefully; do not reopen MVP non-goals except this second starter.
- Skills: `/tdd`, `/implement`. Decisions below were locked in charting; tickets are **implementation slices** toward the destination (execution in-map).
- Tracker: local markdown under this folder.
- **Locked in charting (do not re-grill unless destination changes):**
  - Topology: `Client → LB → API → Cache → Database` + `API → Queue` (no CDN). Cache on the DB path required for Degraded-on-DB-fail under current cascade rules.
  - Picker UX: replace single Load with a short **menu/dropdown** (two options).
  - Traffic demo: ~2k no bottleneck; ~5k → Database bottleneck (Queue side-emit unchanged).
  - Failure demo: Fail Queue → sync path Healthy; Fail Database → API Degraded (Cache present).
  - Active Starter identity: `url_shortener | notification | null` replaces `isUrlShortenerStarter`.
  - HC05/HC06 remain **URL Shortener–only**; Notification gets no new starter-only Findings in this effort.
  - Node labels: default type labels from catalog.

## Decisions so far

- [Active Starter identity in session meta](./issues/01-active-starter-meta.md) — `activeStarter` replaces boolean; silent legacy map; store wired
- [Notification Service starter diagram](./issues/02-notification-starter-diagram.md) — `createNotificationStarter()`; Cache→DB path; 2k/5k traffic; Queue/DB failure demos
- [Health Check uses Active Starter](./issues/03-health-active-starter.md) — HC05/HC06 only for `url_shortener`; Notification clean under always-on rules
- [Starter picker dropdown UX](./issues/04-starter-picker-ux.md) — Load starter menu; catalog URL Shortener | Notification Service
- [Dual-starter core-loop polish](./issues/05-dual-starter-core-loop-polish.md) — empty CTA both starters; presets 1.5k–5k; Fail Queue; dual smoke green

## Not yet specified

- Whether Notification later gets its own starter-only Findings (beyond HC01–HC07)

## Out of scope

- Chat starter and other multi-use-case templates (E-commerce, Streaming, …)
- New NodeTypes / palette expansion
- Changing Traffic equal-split or Queue side-emit engine semantics
- Redesigning HC05/HC06 copy for non–URL-Shortener semantics
