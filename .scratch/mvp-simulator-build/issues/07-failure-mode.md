# Failure engine and Failure Mode UI

Type: task
Status: resolved
Blocked by: 02, 03

## Question

Implement pure `simulation/failure` (one Failed node, dependents-only cascade, PRD per-type rules, states Failed/Down/Degraded/Healthy) and Failure Mode UI: Simulate/Clear, legend, reason on select, overlays.

## Answer

- Pure `simulateFailure(diagram, failedNodeId)` with PRD per-type rules; one failed target at a time; blast radius = non-Healthy
- Acceptance covered in Vitest: starter DB→API degraded; API fail upstream down; Queue fail sync healthy; replace failed target; clear
- Failure Mode UI: Simulate/Clear, legend, reason on select, canvas state overlays
