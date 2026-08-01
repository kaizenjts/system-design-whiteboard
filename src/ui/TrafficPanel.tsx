import { useEffect, useMemo, useRef, useState } from 'react'
import { useAppStore } from '../app/store'
import { defaultCapacity } from '../domain/capacity'
import { NODE_TYPE_LABELS } from '../domain/catalog'
import { simulateTraffic } from '../simulation/traffic/traffic'

export function TrafficPanel() {
  const diagram = useAppStore((s) => s.diagram)
  const loadRps = useAppStore((s) => s.loadRps)
  const setLoadRps = useAppStore((s) => s.setLoadRps)
  const selectedNodeId = useAppStore((s) => s.selectedNodeId)
  const updateNode = useAppStore((s) => s.updateNode)
  const clearNodeCapacity = useAppStore((s) => s.clearNodeCapacity)

  const traffic = useMemo(
    () => simulateTraffic(diagram, loadRps),
    [diagram, loadRps],
  )

  const [summaryFlash, setSummaryFlash] = useState(false)
  const prevBottlenecks = useRef<string | null>(null)

  useEffect(() => {
    const key = [...traffic.bottleneckNodeIds].sort().join(',')
    const prev = prevBottlenecks.current
    prevBottlenecks.current = key
    if (prev === null) return
    const appeared = prev === '' && key !== ''
    const cleared = prev !== '' && key === ''
    if (!appeared && !cleared) return
    setSummaryFlash(true)
    const t = window.setTimeout(() => setSummaryFlash(false), 700)
    return () => window.clearTimeout(t)
  }, [traffic.bottleneckNodeIds])

  const selected = diagram.nodes.find((n) => n.id === selectedNodeId)
  const selectedTraffic = traffic.nodes.find((n) => n.nodeId === selectedNodeId)

  return (
    <aside className="panel panel-right" aria-label="Traffic">
      <h2>Traffic</h2>
      <p className="muted">
        Global Load enters at Client. ≥80% warning, &gt;100% bottleneck.
      </p>
      <label className="field">
        <span>Load (req/s)</span>
        <input
          type="number"
          min={0}
          step={100}
          value={loadRps}
          onChange={(e) => setLoadRps(Number(e.target.value) || 0)}
        />
      </label>
      <input
        className="load-slider"
        type="range"
        min={0}
        max={10_000}
        step={100}
        value={Math.min(loadRps, 10_000)}
        onChange={(e) => setLoadRps(Number(e.target.value))}
        aria-label="Load slider"
      />
      <div className="traffic-presets" role="group" aria-label="Load presets">
        {(
          [
            [1_500, '1.5k'],
            [2_000, '2k'],
            [3_000, '3k'],
            [5_000, '5k'],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            className={
              loadRps === value
                ? 'action-btn action-btn-primary'
                : 'action-btn'
            }
            aria-pressed={loadRps === value}
            onClick={() => setLoadRps(value)}
          >
            {label}
          </button>
        ))}
      </div>
      <div
        className={
          summaryFlash ? 'traffic-summary traffic-summary-flash' : 'traffic-summary'
        }
        aria-live="polite"
      >
        <p>
          Bottlenecks:{' '}
          {traffic.bottleneckNodeIds.length === 0
            ? 'none'
            : traffic.bottleneckNodeIds
                .map((id) => diagram.nodes.find((n) => n.id === id)?.label ?? id)
                .join(', ')}
        </p>
        <p>
          Warnings:{' '}
          {traffic.warningNodeIds.length === 0
            ? 'none'
            : traffic.warningNodeIds
                .map((id) => diagram.nodes.find((n) => n.id === id)?.label ?? id)
                .join(', ')}
        </p>
      </div>

      {selected && selected.type !== 'client' ? (
        <div className="traffic-capacity">
          <h2>Capacity override</h2>
          <p className="muted">
            {NODE_TYPE_LABELS[selected.type]}
            {selectedTraffic
              ? ` · ${Math.round(selectedTraffic.loadRps).toLocaleString()} req/s attributed`
              : ''}
          </p>
          <label className="field">
            <span>Capacity (req/s)</span>
            <input
              type="number"
              min={1}
              placeholder={String(defaultCapacity(selected.type) ?? '')}
              value={selected.capacity ?? ''}
              onChange={(e) => {
                const raw = e.target.value
                if (raw === '') {
                  clearNodeCapacity(selected.id)
                  return
                }
                const value = Number(raw)
                if (Number.isFinite(value) && value > 0) {
                  updateNode(selected.id, { capacity: value })
                }
              }}
            />
            <span className="field-hint">
              Default: {defaultCapacity(selected.type)?.toLocaleString() ?? '—'}
            </span>
          </label>
        </div>
      ) : (
        <p className="muted">Select a node to override Capacity.</p>
      )}
    </aside>
  )
}
