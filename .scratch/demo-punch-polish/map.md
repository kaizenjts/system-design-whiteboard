# Map: Demo-punch experience polish

## Destination

A locked **experience-polish spec** (markdown) plus a **~60s core-loop checklist** that defines Feel (+ light Look) for the existing MVP core loop — so an implementer can ship punchy teaching polish without inventing motion rules.

Traffic Mode is the hero beat; Failure and Health get secondary must-feel rules in the same doc. No new simulation features.

**Destination met:** [spec.md](./spec.md)

## Notes

- Domain: educational System Design Simulator (interview prep). Glossary: root `CONTEXT.md`. Product cut: root `prd.md` — do not reopen MVP non-goals.
- Skills: `/grilling`, `/domain-modeling`. Default: **plan, don't build** — this map ends at the locked spec + checklist, not the implementation.
- Tracker: local markdown under this folder.
- Graduates fog from [Build MVP System Design Simulator](../mvp-simulator-build/map.md) (“Visual/brand polish beyond usable MVP chrome”).
- **Locked in charting (do not re-grill unless destination changes):**
  - Audience: **~60s core-loop punch** when showing the product (not everyday quiet tool as primary).
  - Scope: **one spec for the whole core loop**; Traffic hero; Failure & Health secondary.
  - Motion bar: **clearly visible teaching motion** (edge flow / load pulse, cascade stagger) — readable cues, not game VFX; **not** a Request Journey Mode.
  - Look: **light chrome pass** (type/color/spacing on Mode shell + panels) — not full visual identity / landing.
  - Done bar: written polish spec + 60s core-loop checklist; **prototype only if a decision stalls**.
  - Out-of-cut: no new Modes/engines, no Architecture Score/Cost, no new starters; **micro-copy / empty-state tweaks allowed** if they serve the ~60s core-loop punch.
  - **Doc language:** learner-facing and product docs (`prd.md`, polish spec, UI copy) must **not** use the word “demo” (or “demo punch”). Prefer core loop / teaching / learner. Wayfinder map internal titles may lag; published artifacts must not.

## Decisions so far

- [Traffic Mode demo motion vocabulary](./issues/01-traffic-motion-vocabulary.md) — Must: dash-flow + Warning/Bottleneck node treatments + path highlight; packets only on Bottleneck paths; panel summary flash; no Request Journey / dim / VFX; canvas req/s labels optional
- [Failure Mode cascade reveal](./issues/02-failure-cascade-reveal.md) — Hop stagger + short edge pulse; soft dash after; soft edge-dim only; state labels + legend; Clear instant; no Failure packets/burst/scale
- [Health Mode must-feel budget](./issues/03-health-must-feel.md) — All-Findings soft presence on enter/Re-run; click → focus + one-shot pulse then static; Re-run primary; no packets/cascade/celebration
- [Light chrome pass surfaces](./issues/04-light-chrome-surfaces.md) — Mode/actions/panels/empty/live chip polish; palette/inspector/tip light-only; core-loop micro-copy OK; freeze node geometry/RF chrome/brand/dark mode
- [Prefers-reduced-motion policy](./issues/05-reduced-motion-policy.md) — Static equivalents required; kill loop/packets/scale/stagger; ≤200ms panel flash OK; checklist must not require motion
- [Assemble experience polish spec](./issues/06-assemble-polish-spec.md) — Locked artifact at [`spec.md`](./spec.md) + ~60s checklist (full + reduced-motion)

## Not yet specified

- Post-spec **implementation** sequencing (separate build map after this destination)
- Scrub existing product docs (`prd.md`, `rfc.md`, UI comments) that still say “demo” / “demo loop” / “demo punch” — small follow-on

## Out of scope

- Request Journey Mode / Architecture Score / Cost / Data-Flow / new starters / engine rule changes (PRD non-goals)
- Full brand identity, marketing landing, dark-mode redesign as a product track
- Implementing or shipping the polish in-app (destination is the spec, not the build)
- Expanding HC catalog or Traffic/Failure simulation semantics
