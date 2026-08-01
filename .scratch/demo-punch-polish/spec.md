# Experience polish spec — System Design Simulator MVP

**Status:** Locked for implementation  
**Effort:** `.scratch/demo-punch-polish/`  
**Audience:** Implementers shipping Feel (+ light Look) for the existing MVP core loop  
**Non-goals:** New Modes, engine rule changes, Architecture Score/Cost, Request Journey Mode, full brand/landing, dark-mode track

Language: use **core loop / teaching / learner** — never “demo” or “demo punch” in product docs, this spec, or learner-facing UI.

Sources of truth for product rules remain [`prd.md`](../../prd.md), [`rfc.md`](../../rfc.md), [`CONTEXT.md`](../../CONTEXT.md). This spec only defines **presentation Feel/Look** on top of those rules.

---

## 1. Intent

Make the ~60s core loop feel like a **simulator that pushes back**, not a static diagram:

1. Pick starter  
2. **Health** — Findings click and point at the graph  
3. **Traffic** — Load presets → Warning / Bottleneck read instantly (**hero beat**)  
4. **Failure** — mark Database/Queue Failed → Blast Radius reads as dependents-only cascade (**secondary**)

Motion bar: **clearly visible teaching motion** — readable cues, not game VFX.

---

## 2. Feel by Mode

### 2.1 Traffic (hero)

**Must — canvas**

| Cue | Rule |
|---|---|
| Edge dash-flow | Animate on edges that carry attributed Load |
| Warning (≥80%) | Warn color + pulse ring; **no** scale |
| Bottleneck (>100%) | Danger color + stronger/faster pulse + **thin scale** (strongest node treatment) |
| Path highlight | Client → … → Bottleneck: highlight those edges + light accent on non-bottleneck path nodes; Bottleneck stays strongest; **do not** dim the rest of the diagram |
| Packets | **Only** on highlight edges that touch a Bottleneck; never on healthy-only paths |

**Must — panel**

- Live recompute on Load / topology / Capacity (existing product rule)
- Bottleneck + Warning summaries update immediately
- Brief attention flash when Bottleneck set becomes non-empty or clears — **no** toast/modal
- Load control + presets stay; **no** charts

**Optional**

- Subtle OK-load breathe on nodes with Load but &lt;80% Capacity
- Persistent req/s or % labels on canvas — **not** required
- Dash speed lightly tied to Load (secondary to packets)

**Forbidden**

- Request Journey / hop-by-hop single-request storytelling
- Particles, confetti, screen shake, heavy glow, dimming non-path nodes
- Packets off bottleneck highlight paths
- Changes to Equal Split, thresholds, or capacities

### 2.2 Failure (secondary)

**Must — canvas**

| Cue | Rule |
|---|---|
| Reveal | Hop-stagger from Failed root along Dependents (~140ms/hop, cap ~6) + short edge attention pulse as hops land |
| After reveal | Blast edges: **soft continuous dash** in danger color — **no packets**, **no burst rings** |
| Dim | Soft-dim **edges outside** Blast Radius only; **nodes stay full opacity** |
| States | **Failed** danger fill + label; **Down** danger tint + label; **Degraded** warn tint + label; **Healthy** default, no badge |
| Legend | Panel legend required alongside on-node labels |
| Scale | **No** node scale (reserved for Traffic Bottleneck) |

**Must — panel / controls**

- Simulate / Fail Database / Fail Queue / fail selected → stagger + brief summary flash (Failed target / Blast radius count); no toast
- **Clear** → instant canvas + panel reset (no reverse stagger)
- Live chip only while a Failed target is active

**Forbidden**

- Continuous Failure packets, edge burst loops, screen shake, confetti, heavy glow
- Dimming Healthy nodes; Request Journey storytelling
- Changes to dependents-only cascade / state semantics

### 2.3 Health (secondary, small budget)

**Must — canvas**

- **Enter / Re-run:** soft **all-Findings presence** (union of related Nodes/Edges)
- **Click Finding:** focus that Finding’s related Nodes/Edges + **one-shot soft pulse**, then **static** highlight
- High vs Medium keep distinct colors; **no** continuous pulse after the one-shot
- Live chip while `findings.length > 0`

**Must — panel**

- Findings list shape unchanged (severity, id/title, explanation, suggested fix)
- **Re-run** is primary action
- Zero Findings: static muted empty copy — **no** celebration motion

**Enter / exit**

- Enter runs check + all-Findings presence
- Exit clears highlights immediately — no exit animation

**Forbidden**

- Packets, Failure-style stagger, node scale, dimming the diagram
- Auto-cycling Findings, charts, toasts
- HC semantic / catalog copy changes (unless a separate ticket)

---

## 3. Light Look (chrome)

### Polish (type / color / spacing + hierarchy)

- Mode switcher (clear active lens; short hints OK)
- Header actions (Load starter primary; Export/Import quieter)
- Right Mode panels (CTA hierarchy: Re-run / presets / Fail Database)
- Empty-canvas CTA
- Live chip

### Light only (structure freeze)

- Palette (place/drag, capacity/swatch, collapse in non-Design OK)
- Inspector (minor spacing/contrast)
- Core-loop tip bar (dismissable; wording polish OK)

### Freeze

- Canvas node geometry; React Flow Controls / MiniMap chrome
- Brand mark / wordmark redesign; marketing landing; dark-mode track

### Micro-copy

- **Allowed:** empty CTA, tip bar, panel one-liners, mode hints — if they serve the ~60s loop; no “demo”
- **Not in this pass:** HC Finding catalog copy (PRD-owned)

---

## 4. `prefers-reduced-motion`

**Principle:** teaching feedback must remain; motion is optional packaging.

**Turn off:** looping pulses, animated dash, packets, bursts, node scale, Failure stagger delays, Health one-shot pulse, decorative chrome motion.

**Keep (instant/static):** state colors + labels; path / blast / finding highlights; static Failure edge-dim; panel lists; live chip.

**Allow:** panel summary attention as instant style change or ≤200ms opacity/color flash.

| Mode | Reduced-motion equivalent |
|---|---|
| Traffic | Static warn/danger + path accents; no packets/dash anim/scale/pulse |
| Failure | Instant blast colors + labels; static edge-dim; no stagger/packets/burst |
| Health | Instant presence + focused highlight; no pulse |
| Chrome | No decorative motion |

---

## 5. ~60s core-loop checklist

Use URL Shortener **or** Notification Service starter. Prefer a clean teaching path (fixable starter first).

### Full motion

- [ ] **Start:** Load a starter; canvas fits; tip/empty CTA do not block the loop
- [ ] **Health:** Enter → Findings appear; soft all-Findings presence visible
- [ ] **Health:** Click one Finding → focus + one-shot pulse then static; related nodes/edges clear
- [ ] **Traffic:** Set ~1.5k or ~2k (starter-appropriate) → no Bottleneck (or only expected Warnings)
- [ ] **Traffic:** Raise to bottleneck Load (e.g. 3k URL Shortener / 5k Notification) → Database Bottleneck strongest; path highlight; packets only on bottleneck path; summary flash
- [ ] **Failure:** Fail Database → hop stagger then soft dash; Failed/Down/Degraded labels + legend; non-blast edges soft-dim; nodes undimmed; summary flash
- [ ] **Failure:** Fail Queue (if present) → sync path stays Healthy where teaching rules say so
- [ ] **Failure:** Clear → instant reset
- [ ] **Chrome:** Mode switcher + primary CTAs readable; Load starter obvious

### Reduced motion (`prefers-reduced-motion: reduce`)

- [ ] Same teaching outcomes via **static** colors/labels/highlights (no requirement for pulse/packets/stagger)
- [ ] Checklist does **not** fail solely because motion is off

### Explicit fail conditions

- Packets on non-bottleneck Traffic paths
- Failure packets/bursts competing with Traffic
- Dimming Healthy nodes in Failure, or dimming non-path nodes in Traffic
- Continuous Health pulse after Finding select
- Toasts/modals for Traffic/Failure/Health attention
- Any engine semantic drift (HC rules, Equal Split, cascade rules)

---

## 6. Implementation guidance

1. Prefer **ratify + trim** existing motion (Traffic packets already close; Failure should drop packets/bursts; Health continuous pulse → one-shot).
2. Do not invent new simulation features while polishing.
3. Ship behind normal `pnpm test` / `pnpm build`; add/adjust Vitest only where behavior is asserted today.
4. Doc scrub of remaining “demo” in `prd.md` / `rfc.md` / comments may be a small follow-on ticket.

**Next effort:** separate build map to implement this spec (out of scope for `demo-punch-polish` destination).
