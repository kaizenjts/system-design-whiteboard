# Failure Mode cascade reveal

Type: grilling
Status: resolved
Blocked by: 01

## Question

Given the motion language locked in [Traffic Mode demo motion vocabulary](./01-traffic-motion-vocabulary.md), how should Failure Mode reveal Blast Radius when the learner marks one Node Failed?

Decide stagger vs instant, how Node Health States read on the canvas, Simulate/Clear feedback, and what stays secondary so Traffic remains the hero — still demo-visible, still Believable Teaching Model.

## Answer

Failure Mode is a **secondary Feel beat**: readable cascade teaching, not competing with Traffic’s continuous Bottleneck language. Product/polish docs must not say “demo”; use core loop / teaching language.

### Must (canvas)

1. **Reveal:** hop-stagger from the Failed root outward along Dependents (~140ms/hop, cap ~6 hops), plus a short edge attention pulse as each hop lands.
2. **After reveal:** blast-radius edges keep a **soft continuous dash** in danger color. **No packets** and **no burst rings** on Failure edges (packets stay Traffic Bottleneck–only).
3. **Dim:** soft-dim **edges outside** the Blast Radius only. **Do not** dim Healthy (or other) nodes — full node opacity always.
4. **Node Health States** (strongest → weakest visual weight):
   - **Failed** — danger solid fill + on-node label `Failed`
   - **Down** — danger border/tint + label `Down`
   - **Degraded** — warn tint + label `Degraded`
   - **Healthy** — default chrome, no state badge
5. **Legend:** panel legend remains required alongside on-node labels.
6. **No node scale** in Failure (thin scale reserved for Traffic Bottleneck).

### Must (panel / controls)

7. On Simulate / Fail Database / Fail Queue / fail selected: run canvas stagger **and** a brief flash on the Failure summary (Failed target / Blast radius count). **No** toast/modal.
8. **Clear failure:** instant reset of canvas + panel (no reverse stagger).
9. Live chip (“Failure cascade”) only while a Failed target is active.

### Forbidden / secondary

10. Continuous Failure packets, edge burst loops, screen shake, confetti, heavy glow.
11. Dimming Healthy nodes; Request Journey / hop-by-hop request storytelling.
12. Any change to Failure simulation semantics (dependents-only cascade, state rules).

### Implementer note

Current UI already has hop stagger and on-node state labels; it also runs Failure packets + burst and dims non-blast edges. Spec **ratifies** soft edge-dim + soft dash, and **drops** Failure packets/burst so Traffic stays the packet hero. Prototype not required.
