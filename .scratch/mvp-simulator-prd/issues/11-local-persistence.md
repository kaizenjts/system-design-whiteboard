# Decide local persistence approach

Type: grilling
Status: resolved

## Question

How exactly does MVP local save/reload + Export/Import JSON work (storage keying, schema versioning, auto-save timing, what is serialized) for the RFC?

## Answer

- **Auto-save** the canonical domain diagram to `localStorage` key `sds.diagram.v1`, debounced ~300ms after changes.
- JSON includes `version: 1` (MVP supports v1 only; no complex migrations yet).
- **Serialized:** nodes, edges, capacity overrides, optional viewport/camera.
- **Not serialized (or cleared on load):** Mode overlays, traffic attributions, failure simulation state — load restores diagram and lands in **Design** Mode (or Design with saved Mode only if we later choose; MVP default = Design).
- **Export / Import:** same JSON schema as downloadable `.json` file.
- **Single active diagram** in MVP — not a multi-document library.
