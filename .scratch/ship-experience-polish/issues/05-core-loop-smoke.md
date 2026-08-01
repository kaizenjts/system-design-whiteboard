# Core-loop polish smoke

Type: task
Status: resolved
Blocked by: 01, 02, 03, 04

## Question

Smoke against the ~60s checklist in the polish spec (engines already covered by `coreLoop.smoke.test.ts`; add UI/CSS regression notes or light tests if needed). Confirm chrome hierarchy still matches light Look tier.

## Answer

- `pnpm test` 48 green (incl. new Health presence/focus adapter test) + `pnpm build` OK
- Engine core-loop smoke unchanged
- Chrome hierarchy from prior session retained (Load starter primary, palette collapse, tip bar)
- Scrubbed a few remaining “demo” comments in UI/simulation sources
