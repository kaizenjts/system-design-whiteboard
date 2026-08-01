# Research canvas libraries for diagram MVP

Type: research
Status: resolved

## Question

Which client-side canvas / node-edge libraries best fit an MVP System Design Simulator that needs: custom node types, directed edges, selection/inspector, overlays for Health/Traffic/Failure Modes, and a React-friendly (or clearly justified alternative) app shell — given Believable Teaching Model complexity (not a full Figma clone)?

Compare leading options (e.g. React Flow / xyflow, tldraw, JointJS, Konva-based, Cytoscape, custom SVG). Recommend a short shortlist with trade-offs for our PRD scope.

Save findings to: `.scratch/mvp-simulator-prd/research/canvas-libraries.md`

## Answer

**Default: React Flow (`@xyflow/react`)** — MIT, React-native custom nodes/edges, selection hooks, and mode overlays via node/edge props; matches Believable Teaching Model scope without commercial licensing.

**Shortlist:** (1) React Flow — primary; (2) JointJS for React (`@joint/react`, MPL) — if ports/routing depth wins; (3) tldraw — only if infinite-whiteboard feel is a hard requirement (production license key + wrong primary abstraction). Deprioritize Cytoscape, Konva, custom SVG, GoJS/JointJS+.

Full write-up: [research/canvas-libraries.md](../research/canvas-libraries.md)
