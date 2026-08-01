# System Design Simulator

Educational interactive architecture playground: learners draw a system diagram and get feedback via health checks, traffic/bottleneck simulation, and failure simulation. Working product name for this effort; may still be branded under System Design Whiteboard.

## Language

**System Design Simulator**:
The product concept — a whiteboard that behaves as an educational architecture simulator, not a generic diagram tool.
_Avoid_: draw.io clone, architecture docs tool, production capacity planner

**Architecture Health Check**:
A rule-based review of the current diagram that surfaces educational Findings (anti-patterns and missing pieces).
_Avoid_: lint, audit, compliance scan

**Finding**:
One concrete Health Check result with severity and a short explanation of why it matters for learning.
_Avoid_: error, warning (alone), issue ticket

**Finding Severity**:
MVP uses two levels only — **High** (core path / interview-blocking gap) and **Medium** (important gap, still a plausible early design).
_Avoid_: Critical, Info, blocker, warning-as-severity-name

**Failure Simulation**:
A mode where the learner marks a Node as failed and the diagram shows the blast radius of impacted Nodes.
_Avoid_: chaos engineering, fault injection (production sense)

**Blast Radius**:
The set of Nodes considered impacted when another Node fails, per the educational cascade rules.
_Avoid_: outage map, incident

**Node Health State**:
In Failure Simulation, a Node is **Failed** (learner-marked), **Down** (cannot serve because a required dependency Failed/Down), **Degraded** (can partially serve via a fallback), or **Healthy**.
_Avoid_: red/yellow/green alone, unhealthy, impacted (when a precise state is needed)

**Dependent**:
A Node that has a directed Edge toward another Node and therefore relies on it; Failure Simulation cascades to Dependents only.
_Avoid_: child, upstream (ambiguous), caller (when meaning the canvas relationship)

**Traffic Simulation**:
A mode where the learner sets a request rate and the diagram shows how load flows across Edges and where Bottlenecks appear.
_Avoid_: load test, APM, real traffic replay

**Load**:
The single global request rate (req/s) the learner sets for Traffic Simulation; it enters at Client and is attributed along paths.
_Avoid_: RPS mix, traffic class, QPS as the user-facing control name

**Equal Split**:
When a Node has multiple outbound Edges, Traffic Simulation divides its Load evenly across those Edges. No custom weights in MVP.
_Avoid_: weighted routing, traffic shaping

**Bottleneck**:
A Node whose attributed Load exceeds its Capacity (>100%). At ≥80% Capacity the node shows a Warning indicator instead.
_Avoid_: hot spot (alone), saturation alert

**Capacity**:
A simple educational throughput limit on a Node in req/s, with type defaults and manual override. Client is the Load source and has no Capacity check in MVP.
_Avoid_: cloud quota, autoscaling target, SLA, qps as a separate user-facing unit

**Believable Teaching Model**:
The fidelity bar for MVP simulation: deterministic, rule-based numbers and cascades that feel plausible for learning, explicitly not cloud-accurate capacity planning.

**Starter Template**:
A pre-built educational diagram for a named use case that makes the core simulator loop demable in about a minute. Current set: URL Shortener and Notification Service; the learner picks which to load.
_Avoid_: visual-only template, clipart pack, single hard-coded demo diagram

**Active Starter**:
Which Starter Template is currently loaded on the canvas (`url_shortener`, `notification`, or none). Drives starter-only Health Findings and persistence meta — not a Mode.
_Avoid_: isUrlShortenerStarter (legacy boolean), template flag as a free-form string

**Node**:
A component on the canvas (Client, CDN/DNS, Load Balancer, API, Cache, Database, Queue in MVP).
_Avoid_: box, shape, service (when meaning the canvas element)

**Edge**:
A directed link between Nodes representing dependency or traffic flow. Protocol typing is out of MVP scope.
_Avoid_: arrow, connection (when a precise term is needed)

**Mode**:
One of Design, Health, Traffic, or Failure — mutually exclusive lenses over the same diagram.
_Avoid_: tool, tab (when meaning the simulator lens), workspace
