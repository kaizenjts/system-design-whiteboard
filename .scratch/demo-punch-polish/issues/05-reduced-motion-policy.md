# Prefers-reduced-motion policy

Type: grilling
Status: resolved
Blocked by: 01, 02, 03

## Question

For every motion mandated by Traffic / Failure / Health polish decisions, what is the **`prefers-reduced-motion`** policy?

Decide: which cues become instant/static equivalents, which may stay as short opacity/color changes, and what the 60s core-loop checklist says when reduced motion is on — so accessibility does not silently drop teaching feedback.

## Answer

Policy: **static teaching equivalents are required** (B). Looping / traveling / scaling motion turns off. **Short opacity/color flashes ≤ ~200ms** may remain for panel summary attention (slice of C). Product/polish docs must not say “demo”.

### Global rules

1. Under `prefers-reduced-motion: reduce`, disable: looping pulses, edge dash **animation**, packets, burst rings, node scale, Failure hop **stagger delays**, Health one-shot pulse, decorative chrome motion.
2. **Keep** (instant/static): Warning/Bottleneck/Failed/Down/Degraded/Finding colors; on-node state labels; path / blast / finding highlights; soft static edge-dim outside Failure blast; panel lists and live chip copy.
3. Panel summary attention may be an instant style change or ≤200ms background flash — never a toast/modal.
4. Focus/hover affordances OK without looping animation.

### Per Mode

| Mode | Full motion | Reduced-motion equivalent |
|---|---|---|
| Traffic | Dash-flow, bottleneck-path packets, warn/bottleneck pulse, thin bottleneck scale, optional OK breathe, summary flash | Static warn/danger + path accents; no packets/dash anim/scale/pulse; summary ≤200ms or instant |
| Failure | Hop stagger + short edge pulse, soft continuous dash, summary flash | Instant blast colors + labels; static soft edge-dim OK; no stagger/packets/burst; summary ≤200ms or instant |
| Health | All-Findings presence; click one-shot pulse → static | Instant presence + focused highlight (color only); no pulse |
| Chrome | — | No decorative motion |

### Core-loop checklist (reduced motion on)

5. Checklist **passes** when teaching states are visibly correct and labeled (Warning / Bottleneck / Failed / Down / Degraded / Finding highlights).
6. Checklist must **not** fail solely because motion is off.
7. Spec / checklist should call out a reduced-motion branch explicitly so implementers do not treat a11y as “optional VFX”.

### Implementer note

Existing `@media (prefers-reduced-motion: reduce)` already kills most animations and hides packets/bursts. Spec requires verifying **static equivalents remain** (especially Failure instant blast + Traffic path colors) and aligning Health continuous pulse → one-shot (full) / none (reduced). Prototype not required.
