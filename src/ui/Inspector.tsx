import { defaultCapacity } from '../domain/capacity'
import { NODE_TYPE_LABELS } from '../domain/catalog'
import { useAppStore } from '../app/store'

export function Inspector() {
  const selectedNodeId = useAppStore((s) => s.selectedNodeId)
  const diagram = useAppStore((s) => s.diagram)
  const updateNode = useAppStore((s) => s.updateNode)
  const clearNodeCapacity = useAppStore((s) => s.clearNodeCapacity)
  const removeNode = useAppStore((s) => s.removeNode)
  const setMode = useAppStore((s) => s.setMode)

  const node = diagram.nodes.find((n) => n.id === selectedNodeId)

  if (!node) {
    const hasNodes = diagram.nodes.length > 0
    return (
      <aside className="panel panel-right" aria-label="Inspector">
        <h2>Inspector</h2>
        <div className="inspector-empty">
          <p>Select a node to edit its label and capacity.</p>
          <p className="muted">
            Edge <code>A → B</code> means A depends on B.
          </p>
          {hasNodes ? (
            <>
              <p className="muted inspector-empty-loop">
                Next: Health → Traffic → Failure
              </p>
              <button
                type="button"
                className="action-btn action-btn-primary inspector-empty-cta"
                onClick={() => setMode('health')}
              >
                Open Health
              </button>
            </>
          ) : (
            <p className="muted">
              Place nodes from the Palette, or load a starter to begin.
            </p>
          )}
        </div>
      </aside>
    )
  }

  const typeDefault = defaultCapacity(node.type)
  const showCapacity = node.type !== 'client'

  return (
    <aside className="panel panel-right" aria-label="Inspector">
      <h2>Inspector</h2>
      <div className="inspector-fields">
        <label className="field">
          <span>Type</span>
          <div className="inspector-type" data-node-type={node.type}>
            <span className="inspector-type-swatch" aria-hidden />
            <input value={NODE_TYPE_LABELS[node.type]} readOnly />
          </div>
        </label>
        <label className="field">
          <span>Label</span>
          <input
            value={node.label}
            onChange={(e) => updateNode(node.id, { label: e.target.value })}
          />
        </label>
        {showCapacity && (
          <label className="field">
            <span>Capacity (req/s)</span>
            <input
              type="number"
              min={1}
              placeholder={
                typeDefault !== undefined ? String(typeDefault) : undefined
              }
              value={node.capacity ?? ''}
              onChange={(e) => {
                const raw = e.target.value
                if (raw === '') {
                  clearNodeCapacity(node.id)
                  return
                }
                const value = Number(raw)
                if (Number.isFinite(value) && value > 0) {
                  updateNode(node.id, { capacity: value })
                }
              }}
            />
            <span className="field-hint">
              Default: {typeDefault?.toLocaleString() ?? '—'}
            </span>
          </label>
        )}
        <button
          type="button"
          className="danger-btn"
          onClick={() => removeNode(node.id)}
        >
          Delete node
        </button>
      </div>
    </aside>
  )
}
