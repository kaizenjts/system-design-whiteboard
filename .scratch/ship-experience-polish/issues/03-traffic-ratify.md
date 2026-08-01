# Traffic Feel: ratify bottleneck packets

Type: task
Status: resolved
Blocked by:

## Question

Verify Traffic Mode matches the hero vocabulary (packets only on bottleneck highlight paths; no non-path dim; Warning/Bottleneck treatments). Trim only if gaps remain vs spec.

## Answer

Already matched: `TrafficEdge` / adapters gate packets on `onBottleneckPath`; adapter tests assert bottleneck-path-only packets. No code change required beyond existing ratification.
