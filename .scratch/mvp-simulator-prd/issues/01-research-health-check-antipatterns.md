# Research educational anti-patterns for Health Check

Type: research
Status: resolved

## Question

Which architecture anti-patterns and missing pieces are most worth detecting in an **educational** Architecture Health Check for system-design learners (interview prep), given our MVP Node palette (Client, CDN/DNS, Load Balancer, API, Cache, Database, Queue) and URL Shortener as the starter?

Produce a short, cited research note listing candidate Findings (name + why it teaches something), prioritized for MVP. Prefer primary/high-trust sources: reputable system-design curricula, engineering blogs from companies that own the practice, or widely used interview guides — and mark confidence.

Save findings to: `.scratch/mvp-simulator-prd/research/educational-health-check-antipatterns.md`

## Answer

Prioritize ~6–8 topology Findings that teach URL-shortener interview instincts: missing cache on the read path, missing LB before API, cache without durable DB, incomplete Client path, missing edge CDN for redirects, analytics missing async Queue, and Queue wrongly on the sync user path. Deprioritize production HA/security/deep-cache correctness for Believable Teaching Model MVP.

Full note: [educational-health-check-antipatterns.md](../research/educational-health-check-antipatterns.md)
