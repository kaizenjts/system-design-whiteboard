# PRD: System Design Simulator (MVP)

**Status:** Draft for review  
**Product working name:** System Design Simulator (may still ship under System Design Whiteboard branding)  
**Date:** 2026-08-01  
**Next artifact after this PRD:** RFC (technical approach) — see Open questions

---

## 1. Problem & user

System-design learners (interview prep and self-study) usually draw boxes on a generic whiteboard. The diagram does not push back: it will not show a single point of fragility, a database that cannot absorb load, or what breaks when PostgreSQL dies.

Generic diagram tools optimize for *drawing*. Learners need a tool that optimizes for *feedback on architecture instincts*.

**Primary user:** an engineer practicing system design (interview prep + self-learning).  
**Not primary:** production architecture review boards, SREs doing capacity planning, or multiplayer design workshops.

---

## 2. Product promise

**System Design Simulator** is an interactive architecture playground: a manual whiteboard with three educational simulation lenses — Architecture Health Check, Traffic/Bottleneck Simulation, and Failure Simulation — so learners feel trade-offs, not just arrange shapes.

Fidelity bar: **Believable Teaching Model** — deterministic, rule-based, interview-shaped. Explicitly **not** cloud-accurate capacity planning or chaos engineering.

---

## 3. MVP scope

### In scope

| Area | MVP includes |
|---|---|
| Canvas | Manual design first-class: place Nodes, directed Edges, edit, delete |
| Palette | Client, CDN/DNS, Load Balancer, API, Cache, Database, Queue |
| Starter | One **URL Shortener** Starter Template for the ~60s core learning loop |
| Persistence | Local save/reload + Export/Import JSON (no accounts) |
| Health | Rule-based Findings `HC01`–`HC07` |
| Traffic | Global Load (req/s), equal-split attribution, Capacity defaults + override, Warning/Bottleneck indicators |
| Failure | Mark one Node Failed; dependents-only Blast Radius; states Failed / Down / Degraded / Healthy |

### Out of scope (MVP)

- Decision Mode, Cost Estimator, Data Flow Mode (protocol typing), Request Journey animation, Architecture Score
- Multi use-case template library (Chat, E-commerce, Streaming, Payment, Notification, …)
- Accounts, cloud sync, share links, realtime collaboration
- Cloud SKUs, pricing, autoscaling, multi-region / replica HA modeling
- Partial failure %, network partitions, multi-node simultaneous failure
- Cache hit-ratio math, weighted routing, queueing-theory latency

---

## 4. Core loop (~60 seconds)

1. Open **URL Shortener** starter (or draw manually).
2. Switch to **Health** → see Findings (e.g. missing cache / edge / async queue).
3. Switch to **Traffic** → set Load (e.g. 1.5k then 3k) → Database Bottleneck appears.
4. Switch to **Failure** → simulate Database failure → Blast Radius (API Down/Degraded, upstream path impacted).

Success: the learner experiences the product as a **simulator**, not three disconnected gadgets.

---

## 5. Domain model (glossary)

Canonical terms live in [`CONTEXT.md`](./CONTEXT.md). Short set for this PRD:

| Term | Meaning |
|---|---|
| **Node** | Canvas component (palette types above) |
| **Edge** | Directed dependency / traffic link (`A → B` means A depends on B) |
| **Mode** | Design \| Health \| Traffic \| Failure — lenses on one diagram |
| **Finding** | One Health Check result with severity High or Medium |
| **Load** | Single global req/s entering at Client |
| **Capacity** | Educational req/s limit on a Node (defaults + override; Client has none) |
| **Bottleneck** | Attributed Load > 100% Capacity; Warning at ≥ 80% |
| **Node Health State** | Failed, Down, Degraded, or Healthy in Failure Mode |
| **Blast Radius** | All Nodes that are not Healthy |
| **Starter Template** | Pre-built educational diagram (MVP: URL Shortener) |
| **Believable Teaching Model** | Plausible teaching rules, not production accuracy |

---

## 6. Requirements

### 6.1 Design Mode (canvas foundation)

**Behavior**
- Default Mode on launch.
- Palette + canvas editing for all MVP Node types; directed Edges.
- Inspector on selection: label, type, Capacity (except Client).
- Open URL Shortener starter; Export / Import JSON; auto local persistence.

**Acceptance**
- User can build a multi-node diagram from scratch and reload after refresh without an account.
- Starter opens a ready diagram suitable for the core loop.

**URL Shortener starter shape (teaching target)**  
`Client → CDN → LB → API → Cache → Database`, with Queue linked from API for analytics (not on the sync return path).

---

### 6.2 Architecture Health Check (Health Mode)

**Behavior**
- Evaluate catalog `HC01`–`HC07` on Re-run (Re-run on enter + explicit control).
- Findings panel: severity, title, short explanation, one-line suggested fix.
- Click Finding → highlight related Nodes/Edges.

**Catalog**

| ID | Finding | Severity | When active | Trigger |
|---|---|---|---|---|
| `HC01` | Missing cache on read path | High | always | Client→…→API→DB without Cache on lookup path |
| `HC02` | Missing load balancer before API | Medium | always | Client/CDN → API with no Load Balancer |
| `HC03` | Cache without durable Database | High | always | Cache present; no Database (or not connected for persistence) |
| `HC04` | No complete Client → service path | High | always | Client has no outbound path to API or store |
| `HC05` | Missing CDN/DNS at edge | Medium | **starter only** | URL Shortener starter without CDN/DNS in front |
| `HC06` | Analytics on hot path (no Queue) | Medium | **starter only** | Starter has path to DB; Queue absent or not linked from API |
| `HC07` | Queue on synchronous user path | Medium | always | Client → Queue → API on user-facing request path |

**Suggested-fix copy (learner-facing, MVP)**

| ID | Suggested fix (1 line) |
|---|---|
| `HC01` | Put a Cache on the read/lookup path before the Database. |
| `HC02` | Place a Load Balancer in front of the API tier. |
| `HC03` | Add a durable Database behind the Cache as source of truth. |
| `HC04` | Connect Client to the services that handle the request end-to-end. |
| `HC05` | Add CDN/DNS at the edge in front of origin for redirect-heavy traffic. |
| `HC06` | Emit click/analytics asynchronously via a Queue off the hot path. |
| `HC07` | Keep shorten/redirect synchronous; use Queue for async side work only. |

**Acceptance**
- On a broken shortener-like diagram, Health Mode surfaces the expected High findings.
- On the official starter in good shape, HC05/HC06 do not false-positive; removing CDN or Queue link surfaces them.
- Blank canvas never runs HC05/HC06.

---

### 6.3 Traffic / Bottleneck Simulation (Traffic Mode)

**Behavior**
- Global Load control (req/s) from Client; **Equal Split** across multiple outbound Edges; no weights; no hit-ratio math.
- Default Capacities (override in inspector):

| Node | Default Capacity |
|---|---|
| Client | — (Load source) |
| CDN/DNS | 50k req/s |
| Load Balancer | 20k req/s |
| API | 5k req/s |
| Cache | 20k req/s |
| Database | 2k req/s |
| Queue | 10k req/s |

- Indicators: ≥80% Capacity → Warning; >100% → Bottleneck + highlight paths through that Node.
- Live recompute when Load, topology, or Capacity changes.

**Starter traffic script**
1. Load **1.5k** → no Bottleneck.  
2. Load **3k** → Database Bottleneck; API still under default.  
3. Optional: lower API Capacity → API Warning/Bottleneck (teaches override).

**Acceptance**
- Linear path attributes the same Load to each Node on that path.
- At 3k on starter defaults, Database is Bottleneck and API is not.
- Changing Capacity updates indicators without reload.

---

### 6.4 Failure Simulation (Failure Mode)

**Behavior**
- One Failed Node at a time via **Simulate failure**; **Clear failure** resets.
- Cascade to **Dependents only** (`A → B` ⇒ A depends on B).
- States: Failed, Down, Degraded, Healthy; Blast Radius = non-Healthy; legend + one-line reason on select.

**Per-type rules when a Node is Failed**

| Failed | Effect on Dependents |
|---|---|
| Database | API without Cache on path → Down; API with Cache → Degraded |
| Cache | API using Cache → Degraded (not Down) |
| API | LB / CDN / Client on path → Down |
| Load Balancer | Client/CDN that only reach origin via that LB → Down |
| CDN/DNS | Client that only reaches via that CDN → Down |
| Queue | Sync API path stays Healthy; async/analytics path via Queue unavailable |
| Client | No infra cascade |

**Out of model:** partial % failure, replicas/AZ/failover, partitions, retry storms, latency numbers while Degraded, multi-failure.

**Acceptance**
- Failing Database on starter with Cache yields Degraded API (not necessarily full Down).
- Failing API marks upstream path Down.
- Failing Queue does not take down sync shorten/redirect path.
- Second Simulate failure replaces the first Failed target.

---

### 6.5 Mode UX shell

- Top Mode switcher: Design \| Health \| Traffic \| Failure.
- Modes are lenses over one diagram; leaving a Mode clears its overlays; graph data persists.
- Manual editing remains available; Health uses explicit Re-run; Traffic/Failure recompute on relevant changes.

**Acceptance**
- User can complete the core loop without leaving the app or creating an account.
- Switching Modes never destroys the diagram.

---

## 7. Fidelity disclaimer

All Capacities, splits, Findings, and failure cascades are **educational approximations** for learning system-design instincts. They are not measurements of real cloud systems, SLAs, or production incident behavior. Do not use this MVP for capacity planning or compliance.

---

## 8. Open questions / Next

**Decided:** after this PRD, the next artifact is an **RFC** (how to build the MVP) — not a prototype-first detour and not immediate implementation tickets without an RFC.

**For the RFC to decide (not decided here):**
- Tech stack and project structure
- Canvas library / renderer
- Shape of the simulation engine (graph model, rule runners)
- Local persistence implementation details
- Exact UI kit / visual brand (keep “Whiteboard” name vs rename)

**Still soft product fog (can stay PRD-adjacent or RFC):**
- Visual/brand treatment beyond Mode behavior
- Whether starter ships “slightly broken” for teaching punch vs clean + user breaks it

---

## 9. Decision log (wayfinder)

Detailed answers live under `.scratch/mvp-simulator-prd/`:

- [Research educational anti-patterns for Health Check](.scratch/mvp-simulator-prd/issues/01-research-health-check-antipatterns.md)
- [Decide MVP Health Check findings catalog](.scratch/mvp-simulator-prd/issues/02-health-check-findings-catalog.md)
- [Decide Failure Simulation cascade rules](.scratch/mvp-simulator-prd/issues/03-failure-cascade-rules.md)
- [Decide Traffic and Bottleneck model](.scratch/mvp-simulator-prd/issues/04-traffic-bottleneck-model.md)
- [Decide simulator mode UX shell](.scratch/mvp-simulator-prd/issues/05-simulator-mode-ux.md)
- Map: [.scratch/mvp-simulator-prd/map.md](.scratch/mvp-simulator-prd/map.md)
