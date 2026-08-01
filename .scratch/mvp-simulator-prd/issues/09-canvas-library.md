# Decide canvas library

Type: grilling
Status: resolved
Blocked by: 07

## Question

Which canvas/diagram library (from the research shortlist) do we commit to in the RFC for rendering Nodes, Edges, selection, and Mode overlays?

## Answer

Commit to **React Flow (`@xyflow/react`)** under MIT for MVP.

- Custom node/edge components for palette types
- Selection drives inspector
- Mode overlays via node/edge style/props + UI panels (not a second canvas)
- Rejected for MVP: JointJS (alternate only), tldraw (wrong abstraction + license friction), Cytoscape, Konva, custom SVG, GoJS

Research: [canvas-libraries.md](../research/canvas-libraries.md)
