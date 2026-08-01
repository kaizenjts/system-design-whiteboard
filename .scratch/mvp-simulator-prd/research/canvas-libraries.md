# Canvas / Node-Edge Libraries for MVP System Design Simulator

**Question:** Which client-side canvas / node-edge libraries best fit an MVP System Design Simulator that needs custom node types, directed edges, selection/inspector, overlays for Health/Traffic/Failure Modes, and a React-friendly (or clearly justified alternative) app shell — given Believable Teaching Model complexity (not a full Figma clone)?

**Scope:** Educational architecture playground; Nodes + directed Edges; Modes Design / Health / Traffic / Failure; local-only web app. Product bar from repo-root [`prd.md`](../../../prd.md): ~7 palette types, starter template, rule-based overlays — not production capacity planning or a generic whiteboard clone.

**Date:** 2026-08-01

---

## Verdict (short)

**Primary pick: React Flow (`@xyflow/react`).** It is purpose-built for React node–edge UIs: custom nodes as ordinary React components, directed edges with arrow markers, selection hooks for an inspector, and mode overlays via node/edge `data` + `className`/`style` (or sibling React panels). MIT, production-ready without a commercial license.

**Shortlist for RFC decision:**

| Rank | Library | Role for this PRD |
| --- | --- | --- |
| 1 | **React Flow / xyflow** | Default recommendation — best fit vs MVP scope and React shell |
| 2 | **JointJS for React (`@joint/react`)** | Strong alternative if ports/routing/graph model depth matter more than React-native node JSX |
| 3 | **tldraw** | Only if infinite-canvas *whiteboard feel* is a hard product requirement (license + wrong abstraction for dependency graphs) |

**Deprioritize for MVP:** Cytoscape.js (analysis/layout-first), Konva/`react-konva` (primitives only), custom SVG (max DIY), GoJS / JointJS+ (commercial cost without MVP need).

---

## Evaluation criteria (from PRD)

| Need | Why it matters for MVP |
| --- | --- |
| Custom node types | Palette: Client, CDN/DNS, LB, API, Cache, Database, Queue |
| Directed edges | `A → B` = depends-on / traffic link |
| Selection → inspector | Label, type, Capacity override |
| Mode overlays | Health highlight Findings; Traffic Warning/Bottleneck; Failure states + Blast Radius |
| React-friendly shell | Modes, Findings/Load panels, local JSON persistence around the canvas |
| Complexity bar | Believable Teaching Model — not Figma, not SCADA |

---

## Comparison (primary sources)

### 1. React Flow / xyflow (`@xyflow/react`) — **recommended**

| Dimension | Finding | Source |
| --- | --- | --- |
| Model | First-class `nodes` + `edges` arrays; controlled React state with `onNodesChange` / `onEdgesChange` / `onConnect` | [Quick Start](https://reactflow.dev/learn) |
| Custom nodes | Any React component via `nodeTypes`; “render anything” (forms, charts, etc.) | [Custom Nodes](https://reactflow.dev/learn/customization/custom-nodes) |
| Directed edges | `source` / `target`; `markerEnd` / `markerStart` (e.g. `MarkerType.ArrowClosed`); custom edges as React + SVG path helpers | [Edge type](https://reactflow.dev/api-reference/types/edge); [Custom Edges](https://reactflow.dev/learn/customization/custom-edges) |
| Selection / inspector | `useOnSelectionChange({ onChange })` → selected nodes/edges; `.selected` CSS classes | [useOnSelectionChange](https://reactflow.dev/api-reference/hooks/use-on-selection-change); [Theming](https://reactflow.dev/learn/customization/theming) |
| Overlays | Drive Health/Traffic/Failure visuals through node/edge `data`, `style`, `className`, `animated`; UI chrome as sibling React (panels outside or children of `<ReactFlow>`) | Same customization + edge/node APIs |
| License | **MIT**; Pro is optional (examples/support), not required for commercial use | [xyflow open-source](https://xyflow.com/open-source); [LICENSE](https://github.com/xyflow/xyflow/blob/main/LICENSE); [maintainer clarification](https://github.com/xyflow/xyflow/discussions/3397) |
| Fit to PRD | **Excellent** — node-edge editor + React app shell is the intended product shape | — |

**Trade-offs**

- Pros: Lowest integration cost for this PRD; idiomatic React; enough for custom types, arrows, selection, and mode styling; free MIT.
- Cons: Not a full diagramming suite (no JointJS+-style stencil/inspector plugins out of the box) — acceptable because MVP builds palette/inspector/mode panels itself. Very large graphs / exotic routing are not the teaching-model problem.

---

### 2. JointJS for React (`@joint/react`) — **strong #2**

| Dimension | Finding | Source |
| --- | --- | --- |
| Model | Serializable graph; elements + links; ports, routers, connectors | [JointJS for React intro](https://www.jointjs.com/react-diagrams); [Links](https://docs.jointjs.com/learn/features/diagram-basics/links/) |
| Custom shapes | `dia.Element` / `define()` or React render paths; mature SVG diagramming | [Creating a shape from scratch](https://docs.jointjs.com/learn/features/customizing-shapes/creating-a-shape-from-scratch/) |
| Directed links | First-class `source`/`target`, markers, routers | Links docs above |
| Selection / UX | Community edition claims built-in highlighters, connection snapping, link tools; richer plugins (stencils, inspectors, undo) are **JointJS+** | [React diagrams page](https://www.jointjs.com/react-diagrams); [License](https://www.jointjs.com/license) |
| React | Official OSS `@joint/react`; commercial `@joint/react-plus` | [Getting started blog](https://www.jointjs.com/blog/how-to-get-started-with-jointjs-for-react) |
| License | Core / React: **MPL 2.0**; JointJS+: commercial (~$3k/dev perpetual class pricing on site) | [jointjs.com/license](https://www.jointjs.com/license); [pricing](https://www.jointjs.com/pricing); [GitHub](https://github.com/clientIO/joint) |
| Fit to PRD | **Good** — especially if RFC wants a stronger graph/link engine; MVP does not require JointJS+ | — |

**Trade-offs**

- Pros: Battle-tested diagram semantics (ports, routing, tools); OSS React path exists; scales if product grows beyond teaching MVP.
- Cons: Heavier mental model than React Flow; MPL copyleft considerations for modified library files; polished stencil/inspector UX pushes toward paid JointJS+; React package is newer relative to xyflow’s ecosystem maturity for “nodes as React components.”

---

### 3. tldraw — **only if whiteboard UX is the product**

| Dimension | Finding | Source |
| --- | --- | --- |
| Model | Infinite canvas of **shapes** + **bindings**; Editor API (create/select/history) | [Editor](https://tldraw.dev/docs/editor); [Installation](https://tldraw.dev/docs/installation) |
| Custom nodes | `ShapeUtil` classes + `shapeUtils` prop; HTML in shapes via `HTMLContainer` | [Custom shape example](https://tldraw.dev/examples/custom-shape) |
| Directed edges | Arrows/bindings exist as whiteboard constructs — not a default dependency-graph edge model (`source`/`target` flow) | Shape/Editor docs; product is a drawing SDK |
| Selection / inspector | Strong selection + Editor APIs; UI is a full editor chrome (customizable via `components`) | Installation / Editor docs |
| Overlays | Possible via custom shapes/styles and UI components; fighting default freehand/geo tools | License + customization docs |
| License | **Not permissive OSS for production**: default = development only; production needs trial / hobby (watermark) / commercial license key | [License](https://tldraw.dev/community/license); [License key](https://tldraw.dev/sdk-features/license-key) |
| Fit to PRD | **Weak for node-edge simulator** — excellent for generic whiteboard; wrong primary abstraction + license friction for local educational MVP | — |

**Trade-offs**

- Pros: Best-in-class canvas UX, undo, tools, export; React-native.
- Cons: You implement “architecture graph” semantics on top of a drawing tool; production license/key required; overbuilt vs Believable Teaching Model.

---

### 4. Cytoscape.js (+ `react-cytoscapejs`) — **deprioritize**

| Dimension | Finding | Source |
| --- | --- | --- |
| Model | Graph theory library: nodes/edges JSON, stylesheets, layouts, analysis | [js.cytoscape.org](https://js.cytoscape.org/) |
| Custom nodes | Style-driven shapes/colors/labels; **not** arbitrary React node trees as first-class | Official style/elements model |
| Directed edges | Supported (`target-arrow-shape`, etc.) | Cytoscape docs + stylesheet API |
| Interaction | Drag, pan, zoom, box select built in | [Introduction / gestures](https://js.cytoscape.org/) |
| React | Community wrapper `react-cytoscapejs` (props ≈ Cytoscape JSON) | [npm react-cytoscapejs](https://www.npmjs.com/package/react-cytoscapejs) |
| License | **MIT** (core + first-party extensions per project claims) | Cytoscape.js site |
| Fit to PRD | **Poor for editor UX** — strong for network viz/analysis; weak for rich typed architecture cards + React inspector shell | — |

**Trade-offs:** Great algorithms/layouts; painful path to “palette of educational component cards + mode overlays as product UI.”

---

### 5. Konva / `react-konva` — **deprioritize (primitives)**

| Dimension | Finding | Source |
| --- | --- | --- |
| Model | Scene graph: Stage / Layer / shapes; **no** built-in node–edge diagram model | [react-konva docs](https://konvajs.org/docs/react/index.html) |
| Edges | DIY (e.g. `Arrow` + manual point updates on drag) — shown as sandbox pattern | [Connected Objects sandbox](https://konvajs.org/docs/sandbox/Connected_Objects.html) |
| License | Konva / react-konva are open-source (MIT in package ecosystem) | Konva / npm docs |
| Fit to PRD | **Too low-level** — you rebuild selection, connect, hit-testing, serialization, edge routing | — |

**Trade-offs:** Full visual control; MVP would spend budget on infrastructure instead of Health/Traffic/Failure rules.

---

### 6. Custom SVG (or Canvas) — **last resort**

| Dimension | Finding | Source |
| --- | --- | --- |
| Model | Own graph + SVG `<g>` / paths | N/A (application code) |
| Fit to PRD | Maximum control; **highest build cost** for selection, connect UX, zoom/pan, a11y, edge routing | — |

Justified only if no library meets constraints — not the case here given React Flow / JointJS.

---

### 7. GoJS (commercial) — **relevant but overkill**

| Dimension | Finding | Source |
| --- | --- | --- |
| Model | Mature node/link templates, tools, undo, palettes | [gojs.net](https://gojs.net/latest/) |
| React | Official `gojs-react` | [React intro](https://gojs.net/latest/intro/react.html) |
| License | **Commercial** (watermark until key); individual license listed ~$3,995 class | [Pricing](https://gojs.net/latest/pricing); [Deployment](https://gojs.net/latest/intro/deployment.html) |
| Fit to PRD | Capable; cost and proprietary stack not justified for local teaching MVP | — |

---

## Fit matrix (MVP needs)

| Need | React Flow | JointJS React | tldraw | Cytoscape | Konva | Custom SVG | GoJS |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Custom node types | Excellent (React) | Excellent (SVG/React) | Good (ShapeUtil) | Weak (styles) | DIY | DIY | Excellent |
| Directed edges | Excellent | Excellent | Awkward | Good | DIY | DIY | Excellent |
| Selection → inspector | Excellent | Good–Excellent | Good | OK | DIY | DIY | Excellent |
| Mode overlays | Excellent | Excellent | Possible | Style-driven | DIY | DIY | Excellent |
| React app shell | Native | Official OSS | Native | Wrapper | Native | Native | Wrapper |
| License for local MVP | MIT | MPL 2.0 | License key for prod | MIT | MIT | N/A | Paid |
| Complexity vs teaching MVP | Sweet spot | Slightly heavy | Overbuilt whiteboard | Wrong focus | Too bare | Too bare | Overkill $ |

---

## Recommended shortlist (for RFC)

### A. **React Flow (`@xyflow/react`)** — default

Use for: custom palette nodes as React components; `markerEnd` directed edges; `useOnSelectionChange` → Inspector; Mode-specific classes/styles on nodes/edges; Findings/Load panels as ordinary React layout around the canvas; `toObject`-style JSON for local save/import (library supports serializable node/edge state in the controlled model).

**Accept:** Build palette + inspector + mode chrome yourselves (aligned with PRD UX decision ticket).

### B. **JointJS for React (`@joint/react`)** — alternate if RFC prefers graph engine depth

Choose if early prototypes show React Flow struggling with ports, obstacle-aware routing, or link tools you actually need for the teaching diagram. Stay on **OSS** JointJS for React; do **not** assume JointJS+ for MVP.

### C. **tldraw** — only with explicit product decision

Choose only if stakeholders insist the product *feels* like an infinite whiteboard first, and accept license-key production terms plus custom shape/binding work to fake a dependency graph.

---

## Explicit non-recommendations for this PRD

- **Cytoscape.js** — visualization/analysis library, not an architecture-editor kit.
- **Konva / custom SVG** — rebuild diagram infrastructure; wrong spend for Believable Teaching Model.
- **GoJS / JointJS+** — capable commercial suites; unnecessary cost for local educational MVP.

---

## Open risks / RFC follow-ups

1. Confirm React Flow attribution/logo policy for shipped UI (MIT allows use; Pro removes branding pressure — optional).
2. If JointJS path: confirm MPL 2.0 compliance plan for any patched `@joint/*` files.
3. Persistence schema should own domain fields (node type, capacity, failure state) in `data`, independent of canvas library internals — so engine rules stay library-agnostic.
4. Mode overlays should be pure functions of graph + mode state → visual props (keeps simulation engine testable without the canvas).

---

## Sources (primary)

- React Flow / xyflow: [reactflow.dev/learn](https://reactflow.dev/learn), [Custom Nodes](https://reactflow.dev/learn/customization/custom-nodes), [Custom Edges](https://reactflow.dev/learn/customization/custom-edges), [Edge API](https://reactflow.dev/api-reference/types/edge), [useOnSelectionChange](https://reactflow.dev/api-reference/hooks/use-on-selection-change), [Theming](https://reactflow.dev/learn/customization/theming), [xyflow.com/open-source](https://xyflow.com/open-source), [MIT LICENSE](https://github.com/xyflow/xyflow/blob/main/LICENSE)
- tldraw: [Installation](https://tldraw.dev/docs/installation), [License](https://tldraw.dev/community/license), [License key](https://tldraw.dev/sdk-features/license-key), [Editor](https://tldraw.dev/docs/editor), [Custom shape](https://tldraw.dev/examples/custom-shape)
- JointJS: [License](https://www.jointjs.com/license), [React diagrams](https://www.jointjs.com/react-diagrams), [Links](https://docs.jointjs.com/learn/features/diagram-basics/links/), [Custom shapes](https://docs.jointjs.com/learn/features/customizing-shapes/creating-a-shape-from-scratch/), [GitHub clientIO/joint](https://github.com/clientIO/joint), [Getting started with JointJS for React](https://www.jointjs.com/blog/how-to-get-started-with-jointjs-for-react)
- Cytoscape.js: [js.cytoscape.org](https://js.cytoscape.org/), [react-cytoscapejs](https://www.npmjs.com/package/react-cytoscapejs)
- Konva: [react-konva](https://konvajs.org/docs/react/index.html), [Connected Objects](https://konvajs.org/docs/sandbox/Connected_Objects.html)
- GoJS: [gojs.net](https://gojs.net/latest/), [React](https://gojs.net/latest/intro/react.html), [Pricing](https://gojs.net/latest/pricing), [Deployment](https://gojs.net/latest/intro/deployment.html)
- Product scope: [`prd.md`](../../../prd.md)
