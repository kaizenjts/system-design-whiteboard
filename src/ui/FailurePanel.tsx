import { useEffect, useMemo, useRef, useState } from 'react'
import { useAppStore } from '../app/store'
import { NODE_TYPE_LABELS } from '../domain/catalog'
import { simulateFailure } from '../simulation/failure/failure'

export function FailurePanel() {
  const diagram = useAppStore((s) => s.diagram)
  const selectedNodeId = useAppStore((s) => s.selectedNodeId)
  const failedNodeId = useAppStore((s) => s.failedNodeId)
  const simulateFailureOnSelected = useAppStore(
    (s) => s.simulateFailureOnSelected,
  )
  const failNode = useAppStore((s) => s.failNode)
  const clearFailure = useAppStore((s) => s.clearFailure)

  const failure = useMemo(
    () => simulateFailure(diagram, failedNodeId),
    [diagram, failedNodeId],
  )

  const [summaryFlash, setSummaryFlash] = useState(false)
  const prevFailed = useRef<string | null | undefined>(undefined)

  useEffect(() => {
    const prev = prevFailed.current
    prevFailed.current = failedNodeId
    if (prev === undefined) return
    if (prev === failedNodeId) return
    // Flash when a failure is applied or cleared (spec: brief summary attention).
    setSummaryFlash(true)
    const t = window.setTimeout(() => setSummaryFlash(false), 700)
    return () => window.clearTimeout(t)
  }, [failedNodeId])

  const selected = diagram.nodes.find((n) => n.id === selectedNodeId)
  const selectedFailure = failure.nodes.find((n) => n.nodeId === selectedNodeId)
  const failedNode = diagram.nodes.find((n) => n.id === failedNodeId)
  const database = diagram.nodes.find((n) => n.type === 'database')
  const queue = diagram.nodes.find((n) => n.type === 'queue')

  return (
    <aside className="panel panel-right" aria-label="Failure simulation">
      <h2>Failure</h2>
      <p className="muted">
        Select a node, then simulate failure. Cascade follows dependents only.
      </p>

      <div className="traffic-presets failure-actions">
        <button
          type="button"
          className="action-btn action-btn-primary"
          disabled={!database}
          onClick={() => database && failNode(database.id)}
        >
          Fail Database
        </button>
        <button
          type="button"
          className="action-btn"
          disabled={!queue}
          onClick={() => queue && failNode(queue.id)}
        >
          Fail Queue
        </button>
        <button
          type="button"
          className="action-btn"
          disabled={!selectedNodeId}
          onClick={simulateFailureOnSelected}
        >
          Simulate selected
        </button>
        <button
          type="button"
          className="action-btn action-btn-quiet"
          disabled={!failedNodeId}
          onClick={clearFailure}
        >
          Clear
        </button>
      </div>

      <div className="failure-legend" aria-label="Health state legend">
        <div><span className="legend-swatch fail-failed" /> Failed</div>
        <div><span className="legend-swatch fail-down" /> Down</div>
        <div><span className="legend-swatch fail-degraded" /> Degraded</div>
        <div><span className="legend-swatch fail-healthy" /> Healthy</div>
      </div>

      <div
        className={
          summaryFlash ? 'traffic-summary traffic-summary-flash' : 'traffic-summary'
        }
        aria-live="polite"
      >
        <p>
          Failed target:{' '}
          {failedNode
            ? failedNode.label || NODE_TYPE_LABELS[failedNode.type]
            : 'none'}
        </p>
        <p>
          Blast radius:{' '}
          {failure.blastRadiusNodeIds.length === 0
            ? 'none'
            : `${failure.blastRadiusNodeIds.length} node(s)`}
        </p>
      </div>

      {selected && selectedFailure ? (
        <div className="failure-reason">
          <h2>Selected</h2>
          <p className="muted">
            {selected.label || NODE_TYPE_LABELS[selected.type]} ·{' '}
            <strong>{selectedFailure.state}</strong>
          </p>
          <p className="finding-body">{selectedFailure.reason}</p>
        </div>
      ) : (
        <p className="muted">Select a node to see its failure reason.</p>
      )}
    </aside>
  )
}
