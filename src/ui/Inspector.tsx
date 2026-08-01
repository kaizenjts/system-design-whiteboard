import { defaultCapacity } from '../domain/capacity'
import { NODE_TYPE_LABELS } from '../domain/catalog'
import { useAppStore } from '../app/store'

export function Inspector() {
  const selectedNodeId = useAppStore((s) => s.selectedNodeId)
  const diagram = useAppStore((s) => s.diagram)
  const updateNode = useAppStore((s) => s.updateNode)
  const clearNodeCapacity = useAppStore((s) => s.clearNodeCapacity)
  const removeNode = useAppStore((s) => s.removeNode)

  const node = diagram.nodes.find((n) => n.id === selectedNodeId)

  if (!node) {
    return (
      <aside className="panel panel-right" aria-label="Inspector">
        <h2>Inspector</h2>
        <p className="muted">Select a node to edit label and capacity.</p>
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
          <input value={NODE_TYPE_LABELS[node.type]} readOnly />
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
