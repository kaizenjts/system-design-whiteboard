# Health Mode must-feel budget

Type: grilling
Status: resolved
Blocked by:

## Question

With only a **secondary** polish budget for Health Mode, what is the minimum must-feel for Findings + canvas highlight so the first beat of the ~60s core loop still “clicks,” without competing with Traffic’s hero motion?

Lock panel behavior, highlight behavior, enter/exit of Health Mode, and explicit non-goals (what we will not animate).

## Answer

Health Mode is a **secondary Feel beat** with a small motion budget: make Findings clickable and spatially obvious, then get out of Traffic’s way. Product/polish docs must not say “demo”; use core loop / teaching language.

### Must (canvas)

1. **Enter Health / Re-run:** soft **all-Findings presence** — light tint/accent on the union of related Nodes/Edges from the current Findings list (readable that “something is flagged”), not as strong as a selected Finding.
2. **Click a Finding:** narrow highlight to that Finding’s related Nodes/Edges; play a **one-shot soft pulse**, then hold **static** highlight. High vs Medium keep distinct colors.
3. **No continuous pulse** after the one-shot lands.
4. Live chip while `findings.length > 0` (e.g. `N health finding(s)`).

### Must (panel)

5. Findings list: severity, id/title, short explanation, suggested fix (existing shape).
6. Click Finding selects it (canvas focus as above).
7. **Re-run** is the primary panel action; recomputes Findings + resets to all-Findings presence.
8. Zero Findings: static muted empty copy — **no** celebration / success motion.

### Enter / exit

9. Enter Health: run check + all-Findings presence (existing enter-run stays).
10. Exit Health: clear highlights immediately — **no** exit animation.

### Forbidden / non-goals

11. Edge packets, Failure-style cascade stagger, node scale, dimming the rest of the diagram.
12. Auto-cycling Findings, charts, toasts/modals for Findings.
13. Any change to HC01–HC07 semantics or Finding copy unless a separate ticket says so.

### Implementer note

Today enter/Re-run already highlights the union of all Findings, and selected Finding narrows via `selectFinding`; node treatments currently use **continuous** finding pulses. Spec **ratifies** union presence + click focus, and **requires** continuous pulse → **one-shot then static**. Prototype not required.
