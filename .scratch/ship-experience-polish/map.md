# Map: Ship experience polish

## Destination

Implement [`.scratch/demo-punch-polish/spec.md`](../demo-punch-polish/spec.md) Feel (+ light Look already partly shipped) so the ~60s core-loop checklist passes — without new simulation features.

**Destination met** for Feel gaps in this pass (Failure / Health / Traffic ratify / reduced-motion / smoke).

## Notes

- Spec truth: `../demo-punch-polish/spec.md`. Product: root `prd.md` / `rfc.md` / `CONTEXT.md`.
- Skills: `/implement`, `/tdd` where fitting.
- Tracker: local markdown under this folder.
- Do not reopen MVP non-goals or invent Request Journey / Score / engine changes.
- Doc language: no learner-facing “demo”.

## Decisions so far

- [Failure Feel](./issues/01-failure-feel.md) — Soft dash, no packets/burst; cascade-in then static; panel summary flash
- [Health Feel](./issues/02-health-feel.md) — Presence → focus + one-shot pulse; no continuous finding pulse
- [Traffic Feel ratify](./issues/03-traffic-ratify.md) — Bottleneck-path packets already correct
- [Reduced-motion](./issues/04-reduced-motion.md) — Static equivalents; kill motion/packets/scale
- [Core-loop smoke](./issues/05-core-loop-smoke.md) — Tests/build green; chrome retained

## Not yet specified

- Optional follow-on: scrub “demo” in `prd.md` / `rfc.md` product docs

## Out of scope

- New Modes, starters, HC catalog changes, Equal Split / cascade semantic changes
- Full brand identity / dark mode
