# Decide Traffic and Bottleneck model

Type: grilling
Status: resolved

## Question

How does Traffic Simulation work in the MVP Believable Teaching Model?

Decide: how the learner sets load (e.g. total req/s), how load is attributed along Edges/paths, default Capacity per Node type, when a Bottleneck Finding/indicator appears, and what the URL Shortener starter should demonstrate. Keep it educational and deterministic — not queueing theory or cloud capacity planning.

## Answer

### Load control
Single global **Load** in req/s (slider or input). Enters at Client. No per-edge rates, traffic classes, or separate read/write controls in MVP.

### Path attribution
Follow outbound Edges. **Equal Split** when a node has N outbound Edges — Load divided evenly. No custom weights. No cache hit-ratio math; on a linear path every node sees the same Load.

### Default Capacity (manual override allowed)

| Node | Default |
|---|---|
| Client | none (Load source) |
| CDN/DNS | 50k req/s |
| Load Balancer | 20k req/s |
| API | 5k req/s |
| Cache | 20k req/s |
| Database | 2k req/s |
| Queue | 10k req/s |

Missing-cache lessons stay in Health Check; Traffic teaches per-layer limits.

### Indicators (Traffic mode, not Health Check Findings)
- Load ≥ **80%** Capacity → **Warning**
- Load **> 100%** Capacity → **Bottleneck** + highlight paths through that node
- No queueing/latency formulas — compare attributed Load vs Capacity only

### URL Shortener starter demo
Path: `Client → CDN → LB → API → Cache → Database`, with Queue linked from API for analytics (not on sync return path).

1. Load **1.5k** → OK  
2. Load **3k** → Database Bottleneck (2k default); API still under 5k  
3. Optional: lower API Capacity manually to show override

### Out of model
Hit-ratio math, weighted routing, multi-class traffic, queueing theory, cloud SKU capacity.
