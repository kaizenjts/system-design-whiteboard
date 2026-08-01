import { useAppStore } from '../app/store'
import { defaultCapacity, formatCapacity } from '../domain/capacity'
import { NODE_TYPE_LABELS, PALETTE_TYPES } from '../domain/catalog'
import { PALETTE_DND_MIME } from '../canvas/paletteDnD'

export function Palette() {
  const addNode = useAppStore((s) => s.addNode)
  const mode = useAppStore((s) => s.mode)
  const setMode = useAppStore((s) => s.setMode)
  const editable = mode === 'design'

  return (
    <aside
      className={
        editable
          ? 'panel panel-left'
          : 'panel panel-left panel-muted panel-left-collapsed'
      }
      aria-label="Node palette"
    >
      <div className="palette-heading">
        <h2>Palette</h2>
        {!editable ? (
          <button
            type="button"
            className="action-btn action-btn-quiet palette-to-design"
            onClick={() => setMode('design')}
          >
            Design
          </button>
        ) : null}
      </div>
      {editable ? (
        <p className="muted">
          Click or drag to place. Edge <code>A → B</code> means A depends on B.
        </p>
      ) : (
        <p className="muted palette-collapsed-hint">
          Switch to Design to add nodes.
        </p>
      )}
      <ul className="palette-list">
        {PALETTE_TYPES.map((type) => {
          const capacity = defaultCapacity(type)
          const meta =
            capacity != null
              ? `${formatCapacity(capacity)} req/s`
              : 'Load source'
          return (
            <li key={type}>
              <button
                type="button"
                className="palette-btn"
                data-node-type={type}
                data-tooltip={`${NODE_TYPE_LABELS[type]} · ${meta}`}
                disabled={!editable}
                draggable={editable}
                title={`${NODE_TYPE_LABELS[type]} · ${meta}`}
                aria-label={`${NODE_TYPE_LABELS[type]} · ${meta}`}
                onClick={() => addNode(type)}
                onDragStart={(e) => {
                  if (!editable) {
                    e.preventDefault()
                    return
                  }
                  e.dataTransfer.setData(PALETTE_DND_MIME, type)
                  e.dataTransfer.effectAllowed = 'copy'
                }}
              >
                <span className="palette-btn-main">
                  <span className="palette-swatch" aria-hidden />
                  <span className="palette-btn-label">
                    {NODE_TYPE_LABELS[type]}
                  </span>
                </span>
                <span className="palette-btn-meta">{meta}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </aside>
  )
}
