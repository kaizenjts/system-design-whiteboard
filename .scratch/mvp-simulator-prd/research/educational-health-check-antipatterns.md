# Educational Architecture Health Check — Candidate Anti-Patterns (MVP)

**Question:** Which architecture anti-patterns and missing pieces are most worth detecting in an **educational** Architecture Health Check for system-design learners (interview prep), given MVP palette **Client, CDN/DNS, Load Balancer, API, Cache, Database, Queue** and **URL Shortener** as the starter template?

**Scope:** Believable Teaching Model — teach interview-shaped topology instincts. Not production compliance, security audit, cloud SKU correctness, or multi-region HA certification.

**Date:** 2026-08-01

---

## Verdict (short)

For MVP, detect a **small, sharp set** of topology findings that map to the canonical URL-shortener lessons: **read-heavy caching**, **edge absorption of viral redirects**, **stateless API behind a load balancer**, **durable store behind cache**, and **async analytics off the redirect hot path**. Prefer “missing / miswired layer” over deep production failure modes the palette cannot express (replicas, AZ, bloom filters, ID generators).

---

## What curricula consistently teach (URL Shortener)

Across widely used interview curricula and operator writeups, the starter shape is:

1. **Read ≫ write** → cache the hot `shortURL → longURL` map on the redirect path.
2. **Redirect latency is sacred** → do not do sync analytics / heavy work on the click path; emit events asynchronously.
3. **Stateless app tier** → scale APIs horizontally behind a load balancer.
4. **Edge / CDN** (when discussing viral or global traffic) → absorb popular redirects before origin.
5. **Durable DB** → cache is not the source of truth.

Primary / high-trust anchors:

| Claim | Source |
| --- | --- |
| Redirect path: LB → cache hit → else DB; more reads than writes ⇒ cache | Alex Xu / ByteByteGo, *Design a URL Shortener* ([bytebytego.com course](https://bytebytego.com/courses/system-design-interview/design-a-url-shortener)) |
| Cache hot URLs (80/20), check cache before DB on redirect | Educative *Grokking the System Design Interview* — TinyURL ([educative.io](https://www.educative.io/courses/grokking-the-system-design-interview/system-design-tinyurl)); Design Gurus TinyURL notes ([designgurus.io](https://www.designgurus.io/course-play/grokking-the-system-design-interview/doc/designing-a-url-shortening-service-like-tinyurl)) |
| Metrics/analytics async via queue; shorten/redirect stay sync; metrics failure must not break redirects | Bitly engineering talk summary — Sean O'Connor via High Scalability ([highscalability.com](https://highscalability.com/bitly-lessons-learned-building-a-distributed-system-that-han/)); Bitly data-store evolution (Google Cloud Blog) ([cloud.google.com](https://cloud.google.com/blog/products/databases/bitly-migrates-link-data-from-mysql-to-bigtable-for-scalability)) |
| CDN / edge improves reachability & shifts load off origin | AWS Well-Architected REL02-BP01 ([docs.aws.amazon.com](https://docs.aws.amazon.com/wellarchitected/latest/framework/rel_planning_network_topology_ha_conn_users.html)); Cloudflare Tiered Cache / origin load reduction ([blog.cloudflare.com](https://blog.cloudflare.com/orpheus/)) |
| Single LB (or any critical layer) as SPOF is a common interview miss | Design Gurus — load balancer interview mistakes ([designgurus.io](https://www.designgurus.io/blog/load-balancer-mistakes-in-system-design-interviews)); HA bounded by weakest layer ([rahulsuryawanshi.com](https://rahulsuryawanshi.com/distributed-systems/fault-tolerance-high-availability/high-availability-patterns/)) |

---

## Prioritized candidate Findings (MVP)

Confidence: **High** = multi-source curriculum + operator consensus; **Medium** = strong teaching value but trigger/UX needs care; **Low** = optional / easy to over-lint.

### P0 — Detect in first session (core interview instincts)

| # | Finding name | Trigger idea (diagram pattern) | Why it teaches something | Confidence | Citations |
| --- | --- | --- | --- | --- | --- |
| 1 | **Missing cache on the read/redirect path** | Path from Client → … → API → Database with **no Cache** on the lookup path (Cache absent, or present but not reachable from the redirect/API→DB edge) | URL shortener is taught as a **read-heavy KV lookup**; cache is the main lever for latency and DB protection under 10:1–100:1 read:write | High | ByteByteGo URL shortener (cache on redirect); Educative/Design Gurus TinyURL (cache before DB, 80/20) |
| 2 | **Missing load balancer before API** | Client (or CDN) connects **directly to a single API** with no Load Balancer when the diagram implies scale-out / multiple backends; or API fan-in with no LB | Teaches **stateless horizontal scaling** of the web/API tier — the first scale-out move in classic “scale from zero” narratives | High | ByteByteGo redirect flow (LB → web servers → cache/DB); Design Gurus LB mistakes (LB role + HA framing) |
| 3 | **Cache without durable Database** | Cache present; **no Database** (or no edge from API/Cache to Database for persistence) | Cache is volatile / incomplete; short→long mappings must live in durable storage. Prevents “Redis-only architecture” cargo cult | High | ByteByteGo data model (DB table for mappings + cache for performance); Educative TinyURL (DB + cache layers) |
| 4 | **No complete Client → service data path** | Client has **no outbound edge**, or path never reaches API/Database for create or redirect | Teaches that a whiteboard must show an end-to-end request path, not floating boxes | High | Interview framing: propose flows for shorten + redirect (ByteByteGo steps 2–3) |

### P1 — High value for URL Shortener starter (still Believable Teaching Model)

| # | Finding name | Trigger idea (diagram pattern) | Why it teaches something | Confidence | Citations |
| --- | --- | --- | --- | --- | --- |
| 5 | **Missing CDN/DNS at the edge for redirect-heavy design** | Client → Load Balancer/API **with no CDN/DNS** in front, on a URL-shortener (or explicitly “viral / global redirect”) template | Edge caching/DNS is how real shorteners and WA guidance absorb geographic + viral load **before** origin; teaches edge vs origin roles | High (for this starter) | AWS REL02-BP01 (CDN/DNS for public endpoints); Cloudflare origin shielding/tiered cache; interview designs that put CDN in front of redirects |
| 6 | **Analytics / side work on the hot path (missing async Queue)** | Redirect/create path writes click/metrics **only** via API → Database (or API does “everything”), **Queue unused**; especially when starter mentions analytics | Bitly’s lesson: decode/redirect returns immediately; metrics go async so analytics failure ≠ redirect outage | High | High Scalability Bitly talk (async metrics queue; “metric system going down should never impact URL shortening”) |
| 7 | **Queue on the synchronous user path** | Client → Queue → API for **shorten or redirect** (Queue as mandatory hop for the user-facing request) | Teaches sync vs async: Bitly keeps shorten/redirect **synchronous** for speed/consistency; queues shine for events, not as the redirect RPC | High | High Scalability Bitly (shorten is sync; metrics async) |

### P2 — Useful if cheap; easy to make noisy

| # | Finding name | Trigger idea (diagram pattern) | Why it teaches something | Confidence | Citations |
| --- | --- | --- | --- | --- | --- |
| 8 | **Cache present but miswired** | Cache node exists but **not** on API↔Database read path (e.g. only on write path, or dangling) | Placement matters — “I added Redis” ≠ “lookups hit Redis” | Medium | Same cache-before-DB curricula as #1 |
| 9 | **CDN behind the origin LB / API** | Client → LB/API → CDN (CDN not at edge) | Teaches **edge first**: CDN sits near users and shields origin, not behind your app | Medium | AWS REL02-BP01 / CloudFront mental model; Cloudflare edge vs origin |
| 10 | **Database exposed directly to Client** | Client → Database (bypassing API) | Soft layering lesson (API owns protocol/redirect logic); keep wording educational, not “security finding” | Medium | Canonical flows always put app/API between client and store (ByteByteGo, Grokking) |
| 11 | **Load balancer with nothing to balance** | LB present but **no API** (or no backends) behind it | Teaches LB purpose: distribute to a pool of services | Medium | Design Gurus / interview LB role |

---

## Explicitly deprioritize for educational MVP Health Check

Do **not** burn MVP budget on these as automated Findings (better as tips, later pillars, or out of scope):

| Topic | Why defer |
| --- | --- |
| Multi-AZ / active-passive LB pairs / replica count | Palette cannot express HA topology honestly; Failure Simulation covers “what if X dies” better |
| Cache stampede, TTL, write-through vs aside correctness | Valuable, but not diagram-topology; Traffic/Bottleneck pillar is a better home |
| 301 vs 302 browser caching trade-off | Core interview *discussion*, weak as a binary Health Check “error” |
| Sharding, Bloom filters, ID generators (Snowflake/KGS) | Deep-dive topics; no palette nodes |
| Rate limiting, auth, TLS, WAF, DDoS | Security/compliance — outside Believable Teaching Model for this ticket |
| “Add a cache” without a measured problem (anti-overengineering) | Philosophically good ([CodeKerdos-style advice](https://blog.codekerdos.in/15-system-design-mistakes-every-junior-engineer-makes/)), but conflicts with URL-shortener starter where cache *is* the lesson — prefer template-aware rules |
| Queue technology choice (Kafka vs SQS vs NSQ) | Implementation detail; Health Check only needs “async off hot path” |

---

## Suggested MVP catalog size

**Ship ~6–8 Findings** drawn from P0 + P1 (#1–#7), with #8–#9 only if wiring detection is cheap.

Rationale: map.md already flags “How many Findings are enough vs noisy”; curricula agree on a handful of topology moves for TinyURL/Bitly — not a linter farm.

Template-aware hint for the later grilling ticket: on **URL Shortener starter**, weight **#1, #5, #6** higher; treat **#5** softer on a blank canvas until the learner claims global/viral scale.

---

## Diagram pattern cheat-sheet (for Findings catalog authors)

Believable “good enough” URL Shortener teaching topology (palette-only):

```text
Client → CDN/DNS → Load Balancer → API → Cache → Database
                              └────────→ Queue   (click/analytics events; not on return path)
```

Anti-patterns that should light up Health Check:

```text
Client → API → Database                    # no cache, no LB, no edge
Client → API → Cache                       # no durable DB
Client → Queue → API → …                   # queue on sync UX path
Client → LB → API → Database  (+ Queue unused while “analytics” claimed)
Client → API → CDN                         # CDN not at edge
```

---

## Source list (followed to owners where possible)

1. Alex Xu / ByteByteGo — *System Design Interview* Ch. 8 / course: [Design a URL Shortener](https://bytebytego.com/courses/system-design-interview/design-a-url-shortener)
2. Educative — *Grokking the System Design Interview*: [TinyURL System Design](https://www.educative.io/courses/grokking-the-system-design-interview/system-design-tinyurl)
3. Design Gurus — TinyURL lesson materials / [Load balancer interview mistakes](https://www.designgurus.io/blog/load-balancer-mistakes-in-system-design-interviews)
4. Bitly (operator) — Sean O'Connor talk writeup: [High Scalability](https://highscalability.com/bitly-lessons-learned-building-a-distributed-system-that-han/); Bitly + Bigtable: [Google Cloud Blog](https://cloud.google.com/blog/products/databases/bitly-migrates-link-data-from-mysql-to-bigtable-for-scalability)
5. AWS — Well-Architected Framework [REL02-BP01](https://docs.aws.amazon.com/wellarchitected/latest/framework/rel_planning_network_topology_ha_conn_users.html) (DNS, CDN, LB for public endpoints)
6. Cloudflare — [Tiered Cache / origin load](https://blog.cloudflare.com/orpheus/) (edge absorbs origin traffic)

Secondary corroboration (used for consensus, not sole claims): Vetora / Semicolony / Intervu-style URL shortener walkthroughs emphasizing CDN → cache → DB and Kafka off the redirect path.
