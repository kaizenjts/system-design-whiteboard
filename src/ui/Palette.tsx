import { NODE_TYPE_LABELS, PALETTE_TYPES } from '../domain/catalog'
import { useAppStore } from '../app/store'

export function Palette() {
  const addNode = useAppStore((s) => s.addNode)

  return (
    <aside className="panel panel-left" aria-label="Node palette">
      <h2>Palette</h2>
      <p className="muted">Click to place a node on the canvas.</p>
      <ul className="palette-list">
        {PALETTE_TYPES.map((type) => (
          <li key={type}>
            <button
              type="button"
              className="palette-btn"
              onClick={() => addNode(type)}
            >
              {NODE_TYPE_LABELS[type]}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  )
}
