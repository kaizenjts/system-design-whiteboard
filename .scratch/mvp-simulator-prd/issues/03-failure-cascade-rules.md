# Decide Failure Simulation cascade rules

Type: grilling
Status: resolved

## Question

When a learner marks a Node as failed, what educational cascade rules define the Blast Radius and node states (e.g. down vs degraded vs unaffected)?

Decide for MVP only: deterministic, explainable rules over the MVP palette (including how Cache, Queue, Load Balancer, and Database failures differ). Explicitly list what we will not model yet (partial failure, replicas, network partitions).

## Answer

### Node Health States
- **Failed** — learner-marked node
- **Down** — cannot serve; required dependency Failed/Down
- **Degraded** — partial serve via fallback
- **Healthy** — unaffected  
Blast Radius = every node that is not Healthy.

### Cascade direction
Dependents only. Edge `A → B` means A depends on B; failure propagates to nodes that depend on the failed node, not to its dependencies.

### Per-type rules when a node is Failed

| Failed node | Effect on Dependents |
|---|---|
| Database | API without Cache on path → **Down**; API with Cache → **Degraded** |
| Cache | API using Cache → **Degraded** (fallback to DB), not Down |
| API | LB / CDN / Client on that path → **Down** |
| Load Balancer | Client/CDN that only reach origin via that LB → **Down** |
| CDN/DNS | Client that only reaches origin via that CDN → **Down** |
| Queue | Sync user path (API) stays **Healthy**; analytics/async path via Queue is Down/unavailable |
| Client | No infra cascade; user endpoint is Failed |

### Out of model (MVP)
- Partial failure / error-rate %
- Replicas, multi-AZ, automatic failover
- Network partitions
- Retry storms / cascading overload (Traffic pillar may cover load effects later)
- Numeric latency while Degraded (state + short explanation only)
- Multiple simultaneous Failed nodes — **one Failed node per simulation**
