import { useAppStore } from '../app/store'
import type { Finding } from '../simulation/health/healthCheck'

export function FindingsPanel() {
  const findings = useAppStore((s) => s.findings)
  const diagram = useAppStore((s) => s.diagram)
  const runHealthCheck = useAppStore((s) => s.runHealthCheck)
  const selectFinding = useAppStore((s) => s.selectFinding)
  const setMode = useAppStore((s) => s.setMode)
  const failNode = useAppStore((s) => s.failNode)

  const hasNodes = diagram.nodes.length > 0
  const database = diagram.nodes.find((n) => n.type === 'database')

  return (
    <aside className="panel panel-right" aria-label="Findings" data-tour="findings">
      <div className="panel-heading">
        <h2>Findings</h2>
        <button
          type="button"
          className="action-btn action-btn-primary"
          onClick={runHealthCheck}
        >
          Re-run
        </button>
      </div>
      {findings.length === 0 ? (
        <div className="findings-empty">
          {hasNodes ? (
            <>
              <p className="findings-empty-title">Architecture looks solid</p>
              <p className="muted">
                No Health findings on this diagram. Stress it next with Traffic
                or Failure.
              </p>
              <div className="findings-empty-actions">
                <button
                  type="button"
                  className="action-btn action-btn-primary"
                  onClick={() => setMode('traffic')}
                >
                  Open Traffic
                </button>
                <button
                  type="button"
                  className="action-btn"
                  disabled={!database}
                  onClick={() => {
                    if (!database) return
                    setMode('failure')
                    failNode(database.id)
                  }}
                >
                  Fail Database
                </button>
              </div>
            </>
          ) : (
            <p className="muted">
              Draw a diagram or load a starter, then Re-run.
            </p>
          )}
        </div>
      ) : (
        <ul className="findings-list">
          {findings.map((f) => (
            <li key={f.id}>
              <FindingCard finding={f} onSelect={selectFinding} />
            </li>
          ))}
        </ul>
      )}
    </aside>
  )
}

function FindingCard({
  finding,
  onSelect,
}: {
  finding: Finding
  onSelect: (f: Finding) => void
}) {
  return (
    <button
      type="button"
      className="finding-card"
      onClick={() => onSelect(finding)}
    >
      <div className="finding-top">
        <span className={`severity severity-${finding.severity}`}>
          {finding.severity}
        </span>
        <span className="finding-id">{finding.id}</span>
      </div>
      <strong className="finding-title">{finding.title}</strong>
      <p className="finding-body">{finding.explanation}</p>
      <p className="finding-fix">Fix: {finding.suggestedFix}</p>
    </button>
  )
}
