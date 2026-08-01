# Light chrome pass surfaces

Type: grilling
Status: resolved
Blocked by:

## Question

Which chrome surfaces get the **light Look pass** (typography, color, spacing) so the shell does not kill core-loop punch — and which stay as-is?

Name surfaces (Mode switcher, panels, palette, actions, empty state, etc.), depth of change allowed, and whether micro-copy / empty-state tweaks are in or out per surface. Not a full brand/landing redesign.

## Answer

Light chrome pass = **shell must not undercut canvas Feel**, not a brand/landing redesign. Product/polish docs and learner-facing UI must not say “demo”; prefer core loop / teaching / learner.

### In — polish (type / color / spacing + hierarchy)

1. **Mode switcher** — clear active lens; optional short hints OK.
2. **Header actions** — Load starter primary; Export/Import quieter.
3. **Right Mode panels** (Findings / Traffic / Failure) — spacing, contrast, primary CTA hierarchy (Re-run / Load presets / Fail Database).
4. **Empty-canvas CTA** — starter pick prominent; copy may nudge Health → Traffic → Failure.
5. **Live chip** — readable status while a Mode overlay is active.

### In — light only (structure freeze)

6. **Palette** — keep place/drag model; minor spacing/contrast; capacity/swatch OK; collapse in non-Design OK.
7. **Inspector (Design)** — minor spacing/contrast only.
8. **Core-loop tip bar** — keep dismissable coachmark; wording polish OK.

### Out / freeze

9. Canvas **node geometry**, React Flow **Controls / MiniMap** chrome.
10. Brand mark / wordmark redesign, marketing landing, dark-mode product track.
11. Anything that invents new Modes or simulation features.

### Micro-copy policy

12. **Core-loop copy OK (option B):** empty CTA, tip bar, panel one-liners, mode hints may be tweaked to serve the ~60s loop.
13. **Finding catalog copy** (HC titles / explanations / suggested fixes) stays PRD-owned — out of this chrome ticket unless a separate ticket changes them.
14. Scrub learner-facing “demo” language; comments/docs follow the map doc-language rule (assemble / follow-on may track product-doc scrub).

### Implementer note

Recent header/palette/CTA hierarchy work aligns with this answer; polish implementation should **ratify and tighten**, not redesign from scratch. Prototype not required.
