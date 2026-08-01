# Health Feel: one-shot then static

Type: task
Status: resolved
Blocked by:

## Question

Align Health Mode with the polish spec: soft all-Findings presence on enter/Re-run; click Finding → focus + one-shot pulse then static highlight; no continuous finding pulse.

## Answer

- Store: `healthHighlightMode` (`presence` | `focus`) + `findingPulseKey`
- Enter/Re-run → presence union highlight; select Finding → focus + pulse key bump
- CSS: static finding colors; one-shot `.arch-node-finding-pulse` only on focus
- Adapter test covers presence vs focus tone
