import { useAppStore } from '../app/store'
import { STARTERS, starterById, type StarterId } from '../starters/catalog'

/** First-run / empty-canvas call-to-action for the ~60s core loop. */
export function EmptyCanvasHint() {
  const nodeCount = useAppStore((s) => s.diagram.nodes.length)
  const setDiagram = useAppStore((s) => s.setDiagram)

  if (nodeCount > 0) return null

  function loadStarter(id: StarterId) {
    const starter = starterById(id)
    setDiagram(starter.create(), { activeStarter: starter.id })
  }

  return (
    <div className="empty-canvas-hint" role="status" data-tour="empty-canvas">
      <p>
        Pick a starter for the ~60s loop (Health → Traffic → Failure), or place
        nodes from the palette.
      </p>
      <div className="empty-canvas-actions">
        {STARTERS.map((starter, index) => (
          <button
            key={starter.id}
            type="button"
            className={
              index === 0
                ? 'action-btn action-btn-primary'
                : 'action-btn'
            }
            onClick={() => loadStarter(starter.id)}
          >
            {starter.label}
          </button>
        ))}
      </div>
    </div>
  )
}
