# Decide MVP Health Check findings catalog

Type: grilling
Status: resolved
Blocked by: 01

## Question

What is the exact MVP catalog of Architecture Health Check Findings (id, trigger condition on the diagram, severity, learner-facing explanation, optional suggested fix), scoped to our palette and Believable Teaching Model?

Must be small enough to implement and teach clearly — prefer a sharp short list over exhaustive lint coverage. Use the research note from [Research educational anti-patterns for Health Check](./01-research-health-check-antipatterns.md) as input, not as the decision.

## Answer

MVP Architecture Health Check ships **exactly 7 Findings** (`HC01`–`HC07`), severities **High / Medium** only.

| ID | Finding | Severity | When active | Trigger |
|---|---|---|---|---|
| `HC01` | Missing cache on read path | High | always | Client→…→API→DB without Cache on the lookup path |
| `HC02` | Missing load balancer before API | Medium | always | Client/CDN → API with no Load Balancer |
| `HC03` | Cache without durable Database | High | always | Cache present; no Database (or not connected for persistence) |
| `HC04` | No complete Client → service path | High | always | Client has no outbound path to API or store |
| `HC05` | Missing CDN/DNS at edge | Medium | **URL Shortener starter only** | Starter diagram has no CDN/DNS in front of origin |
| `HC06` | Analytics on hot path (no Queue) | Medium | **URL Shortener starter only** | Starter has path to DB; Queue absent or not linked from API |
| `HC07` | Queue on synchronous user path | Medium | always | Client → Queue → API on the user-facing request path |

- Each Finding includes a short learner explanation + one-line suggested fix (final copy at PRD assemble).
- P2 research candidates (miswired cache, CDN behind origin, Client→DB, empty LB) are **out of MVP**.
- Production HA/security/deep-cache correctness remain out of Health Check MVP (see research note).

Input research: [educational-health-check-antipatterns.md](../research/educational-health-check-antipatterns.md)
