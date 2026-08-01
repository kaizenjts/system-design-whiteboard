# Health Check engine and Health Mode UI

Type: task
Status: resolved
Blocked by: 02, 03

## Question

Implement pure `simulation/health` for HC01–HC07 (starter-only ctx for HC05/HC06) and Health Mode UI: Re-run on enter + button, Findings panel, click-to-highlight related nodes/edges.

## Answer

- Pure `healthCheck(diagram, ctx)` with catalog HC01–HC07; HC05/HC06 gated by `isUrlShortenerStarter`
- Vitest fixtures: good starter clean, blank skips HC05/06, broken high findings, CDN/Queue removal, HC07 queue-on-path
- Health Mode UI: run on enter + Re-run; Findings panel; click Finding → canvas highlight; `Load starter` sets starter ctx
