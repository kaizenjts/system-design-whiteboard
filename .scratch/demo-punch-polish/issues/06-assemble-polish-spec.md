# Assemble experience polish spec

Type: task
Status: resolved
Blocked by: 01, 02, 03, 04, 05

## Question

Write the locked **experience-polish spec** markdown and the **~60s core-loop checklist**, folding in all resolved decisions from this map (Traffic hero vocabulary, Failure reveal, Health must-feel, chrome surfaces, reduced-motion).

Settle the artifact path when writing. Spec must be implementer-ready and must not invent new simulation features. Prototype only if a prior ticket explicitly deferred a detail here (should be rare).

## Answer

Artifact path locked: [`.scratch/demo-punch-polish/spec.md`](../spec.md) (effort-owned implementer spec per issue-tracker convention).

Contents folded from resolved tickets 01–05:

- Traffic hero motion vocabulary
- Failure cascade reveal (stagger, soft dash, edge-dim only, no packets)
- Health must-feel (all-Findings presence, one-shot then static)
- Light chrome surface tiers + micro-copy policy
- `prefers-reduced-motion` static equivalents + checklist branch

Includes a ~60s core-loop checklist (full motion + reduced-motion). No prototype required. Implementation is a **separate build map** after this destination.
