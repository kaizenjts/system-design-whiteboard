# Dual-starter core-loop polish

Type: task
Status: resolved
Blocked by: 03, 04

## Question

Finish the demable loop for both starters: empty-canvas CTA, header/core-loop hint, and smoke coverage so URL Shortener keeps 1.5k→3k / Fail DB and Notification demos ~2k→5k / Fail Queue+DB without false positives.

## Answer

- Empty canvas: both starters from `STARTERS` catalog.
- Header hint: `1 Pick starter · 2 Health · 3 Traffic presets · 4 Fail Database / Queue`.
- Traffic presets: 1.5k / 2k / 3k / 5k; Failure: **Fail Queue** shortcut alongside Fail Database.
- Smoke: URL Shortener + Notification core loops; persistence round-trip for each catalog starter.
- Suite 42 green; `pnpm build` OK.
