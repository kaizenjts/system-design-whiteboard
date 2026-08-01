# Traffic Mode demo motion vocabulary

Type: grilling
Status: resolved
Blocked by:

## Question

For Traffic Mode as the **hero demo beat**, what exact canvas + panel motion/visual vocabulary should the polish spec mandate when Load changes and when a Node hits Warning (≥80%) vs Bottleneck (>100%)?

Lock at teaching-demo fidelity: demo-visible edge/load cues allowed; not particle VFX; not a Request Journey Mode. Say what must appear, what is optional, and what is forbidden — enough that an implementer does not invent the language.

## Answer

Traffic Mode is the **hero Feel beat** of the ~60s core loop. Product/polish docs must not say “demo”; use core loop / teaching language.

### Must (canvas)

1. **Duo signal:** animated **edge dash-flow** on edges that carry attributed Load, **and** distinct **node** Warning vs Bottleneck treatment.
2. **Warning (≥80%):** warn color + pulse ring; **no** scale.
3. **Bottleneck (>100%):** danger color + stronger/faster pulse + **thin scale**; remains the strongest node treatment.
4. **Path highlight** (engine already: Client → … → Bottleneck): highlight those **edges** and a **light accent** on non-bottleneck nodes on the path; Bottleneck node stays strongest. Do **not** dim/fade the rest of the diagram.
5. **Packets** only on **highlight edges** (paths that touch a Bottleneck). No packets on healthy-only paths.

### Must (panel)

6. Live recompute on Load / topology / Capacity (unchanged product rule).
7. Bottleneck + Warning summary lists update immediately; brief attention flash on the summary when Bottleneck set becomes non-empty or clears — **no** toast/modal.
8. Load control + starter presets stay; no charts.

### Optional

9. Subtle “OK load” breathe on nodes with Load but &lt;80% Capacity.
10. Persistent req/s or % labels on canvas edges/nodes — **not** required; prefer panel + inspector attributed Load.
11. Dash speed slightly tied to Load intensity (still secondary to Bottleneck packet cue).

### Forbidden

12. Request Journey Mode / hop-by-hop single-request storytelling.
13. Particles, confetti, screen shake, heavy glow, dimming non-path nodes.
14. Packets on edges that are not on a Bottleneck highlight path.
15. Any change to Traffic simulation semantics (Equal Split, thresholds, capacities).

### Implementer note

Current UI already approximates much of this (dash, packets, pulses). Spec **ratifies** the vocabulary above; implementation may trim packets to bottleneck-paths only and drop non-path dimming if present. Prototype not required — vocabulary locked without one.
