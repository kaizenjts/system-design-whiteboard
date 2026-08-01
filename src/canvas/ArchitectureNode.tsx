import { Handle, Position, type Node, type NodeProps } from '@xyflow/react'
import type { CSSProperties } from 'react'
import { NODE_TYPE_LABELS } from '../domain/catalog'
import type { ArchitectureNodeData } from './adapters'

type ArchNode = Node<ArchitectureNodeData>

export function ArchitectureNode({ data, selected }: NodeProps<ArchNode>) {
  const title = data.label || NODE_TYPE_LABELS[data.nodeType]
  const fail = data.failureState && data.failureState !== 'healthy'
  const finding = data.findingSeverity
  const stateClass = fail
    ? `arch-node-fail-${data.failureState}`
    : finding === 'high'
      ? 'arch-node-finding-high'
      : finding === 'medium'
        ? 'arch-node-finding-medium'
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

  return (
    <div
      className={[
        'arch-node',
        selected ? 'arch-node-selected' : '',
        stateClass,
        data.trafficState && data.trafficState !== 'ok' ? 'arch-node-live' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={cascadeStyle}
      data-type={data.nodeType}
      data-traffic={data.trafficState ?? undefined}
      data-failure={data.failureState ?? undefined}
      data-finding={finding ?? undefined}
    >
      <Handle type="target" position={Position.Left} />
      <div className="arch-node-type">{NODE_TYPE_LABELS[data.nodeType]}</div>
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
