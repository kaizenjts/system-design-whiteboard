# Health Check uses Active Starter

Type: task
Status: resolved
Blocked by: 01, 02

## Question

Wire Health so HC05/HC06 run only when Active Starter is `url_shortener`; Notification in good shape yields no Findings under always-on rules; blank / non-starter still skips starter-only rules.

## Answer

- `HealthContext.activeStarter` (type lives in `domain/types`); starter-only rules run iff `activeStarter === 'url_shortener'`.
- Notification starter: zero Findings; HC05 not applied under `notification` / `null`.
- Store passes `activeStarter` directly (bridge removed).
- Vitest health suite updated (+ Notification clean case); 39 tests green.
