import { Handle, Position, type Node, type NodeProps } from '@xyflow/react'
import { useEffect, useState, type CSSProperties } from 'react'
import { NODE_TYPE_LABELS } from '../domain/catalog'
import type { ArchitectureNodeData } from './adapters'

type ArchNode = Node<ArchitectureNodeData>

export function ArchitectureNode({ data, selected }: NodeProps<ArchNode>) {
  const title = data.label || NODE_TYPE_LABELS[data.nodeType]
  const fail = data.failureState && data.failureState !== 'healthy'
  const finding = data.findingSeverity
  const findingTone = data.findingTone
  const [findingPulse, setFindingPulse] = useState(false)

  useEffect(() => {
    if (findingTone !== 'focus' || !data.findingPulseKey) {
      setFindingPulse(false)
      return
    }
    setFindingPulse(true)
    const t = window.setTimeout(() => setFindingPulse(false), 700)
    return () => window.clearTimeout(t)
  }, [data.findingPulseKey, findingTone])

  const stateClass = fail
    ? `arch-node-fail-${data.failureState}`
    : finding === 'high'
      ? findingTone === 'presence'
        ? 'arch-node-finding-high arch-node-finding-presence'
        : 'arch-node-finding-high arch-node-finding-focus'
      : finding === 'medium'
        ? findingTone === 'presence'
          ? 'arch-node-finding-medium arch-node-finding-presence'
          : 'arch-node-finding-medium arch-node-finding-focus'
        : data.trafficState === 'bottleneck'
          ? 'arch-node-bottleneck'
          : data.trafficState === 'warning'
            ? 'arch-node-warning'
            : ''

  const cascadeStyle =
    fail && data.cascadeHop !== undefined
      ? ({
          '--cascade-delay': `${Math.min(data.cascadeHop, 6) * 140}ms`,
        } as CSSProperties)
      : undefined

  const hasTrafficLoad = data.loadRps !== undefined && data.trafficState

  return (
    <div
      className={[
        'arch-node',
        selected ? 'arch-node-selected' : '',
        stateClass,
        findingPulse ? 'arch-node-finding-pulse' : '',
        data.onTrafficPath ? 'arch-node-path-accent' : '',
        hasTrafficLoad ? 'arch-node-live' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={cascadeStyle}
      data-type={data.nodeType}
      data-traffic={data.trafficState ?? undefined}
      data-failure={data.failureState ?? undefined}
      data-finding={finding ?? undefined}
      data-finding-tone={findingTone ?? undefined}
    >
      <Handle type="target" position={Position.Left} />
      <div className="arch-node-head">
        <span className="arch-node-swatch" aria-hidden />
        <div className="arch-node-type">{NODE_TYPE_LABELS[data.nodeType]}</div>
      </div>
      <div className="arch-node-label">{title}</div>
      {data.loadRps !== undefined && (
        <div className="arch-node-load">
          <span className="arch-node-load-value">
            {Math.round(data.loadRps).toLocaleString()}
          </span>
          <span className="arch-node-load-unit"> req/s</span>
          {data.trafficState === 'bottleneck' && (
            <span className="arch-node-badge hot">bottleneck</span>
          )}
          {data.trafficState === 'warning' && (
            <span className="arch-node-badge warn">warning</span>
          )}
        </div>
      )}
      {fail && (
        <div className="arch-node-fail-label" aria-live="polite">
          {data.failureState}
        </div>
      )}
      {finding && !fail && (
        <div className="arch-node-fail-label" aria-live="polite">
          {finding} finding
        </div>
      )}
      <Handle type="source" position={Position.Right} />
    </div>
  )
}
