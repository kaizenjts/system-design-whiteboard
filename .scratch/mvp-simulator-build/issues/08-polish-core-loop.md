# Polish core-loop demo

Type: task
Status: resolved
Blocked by: 04, 05, 06, 07

## Question

Wire starter open action end-to-end and polish so the PRD ~60s loop works cleanly: Health → Traffic (1.5k then 3k → DB bottleneck) → Failure (DB blast radius). Fix HC05/HC06 false positives on the good starter; smoke-check persistence round-trip.

## Answer

- Smoke tests: good starter has zero Health findings; Traffic 1.5k clean / 3k DB bottleneck; Failure DB → API degraded; persistence round-trip + `sds.meta.v1` starter flag
- UX: empty-canvas CTA, fitView on Load starter/import, Fail Database shortcut, core-loop hint in header
- Starter meta persists across refresh so HC05/HC06 stay gated correctly
