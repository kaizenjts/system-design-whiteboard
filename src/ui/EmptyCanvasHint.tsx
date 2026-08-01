import { useAppStore } from '../app/store'
import { STARTER_PICKER, starterPickerByKey } from '../starters/catalog'

/** First-run / empty-canvas call-to-action for the ~60s core loop. */
export function EmptyCanvasHint() {
  const nodeCount = useAppStore((s) => s.diagram.nodes.length)
  const setDiagram = useAppStore((s) => s.setDiagram)
  const setMode = useAppStore((s) => s.setMode)

  if (nodeCount > 0) return null

  const entries = STARTER_PICKER.filter((e) => e.emptyCanvas)

  function loadPickerEntry(key: string) {
    const entry = starterPickerByKey(key)
    setDiagram(entry.create(), { activeStarter: entry.activeStarter })
    if (entry.openHealth) setMode('health')
  }

  return (
    <div className="empty-canvas-hint" role="status" data-tour="empty-canvas">
      <p>
        Pick a starter for the ~60s loop (Health → Traffic → Failure), or place
        nodes from the palette. “Find the gaps” opens Health with a teaching
        Finding already waiting.
      </p>
      <div className="empty-canvas-actions">
        {entries.map((entry) => (
          <button
            key={entry.key}
            type="button"
            className={
              entry.emptyCanvasPrimary
                ? 'action-btn action-btn-primary'
                : 'action-btn'
            }
            title={entry.hint}
            onClick={() => loadPickerEntry(entry.key)}
          >
            {entry.emptyCanvasLabel ?? entry.label}
          </button>
        ))}
      </div>
    </div>
  )
}
