import { useAppStore } from '../app/store'
import type { Finding } from '../simulation/health/healthCheck'

export function FindingsPanel() {
  const findings = useAppStore((s) => s.findings)
  const runHealthCheck = useAppStore((s) => s.runHealthCheck)
  const selectFinding = useAppStore((s) => s.selectFinding)

  return (
    <aside className="panel panel-right" aria-label="Findings">
      <div className="panel-heading">
        <h2>Findings</h2>
        <button type="button" className="action-btn" onClick={runHealthCheck}>
          Re-run
        </button>
      </div>
      {findings.length === 0 ? (
        <p className="muted">No findings. Nice — or draw more, then Re-run.</p>
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
