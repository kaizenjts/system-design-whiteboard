import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type Edge,
  type EdgeProps,
} from '@xyflow/react'

export type TrafficEdgeData = {
  loadRps?: number
  /** Packets + danger treatment — only Client→Bottleneck highlight edges. */
  onBottleneckPath?: boolean
  warning?: boolean
  [key: string]: unknown
}

export type TrafficFlowEdge = Edge<TrafficEdgeData>

/** Traffic Mode edge: dash-flow when loaded; packets only on Bottleneck paths. */
export function TrafficEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  markerEnd,
  data,
  style,
}: EdgeProps<TrafficFlowEdge>) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  })

  const load = data?.loadRps ?? 0
  const onBottleneckPath = Boolean(data?.onBottleneckPath)
  const warning = Boolean(data?.warning)
  const intensity = Math.min(1, Math.max(0.15, load / 3000))
  const duration = Math.max(0.85, 2.4 - intensity * 1.4)
  // Packets only on Bottleneck highlight paths (locked Traffic vocabulary).
  const packetCount = onBottleneckPath
    ? Math.min(5, 2 + Math.floor(intensity * 3))
    : 0

  const stroke = onBottleneckPath
    ? '#b91c1c'
    : warning
      ? '#b45309'
      : '#0f6e56'

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke,
          strokeWidth: onBottleneckPath ? 3 : 2 + intensity * 0.5,
        }}
        className={
          onBottleneckPath
            ? 'sim-edge sim-edge-bottleneck'
            : warning
              ? 'sim-edge sim-edge-warning'
              : load > 0
                ? 'sim-edge sim-edge-flow'
                : 'sim-edge'
        }
      />
      {Array.from({ length: packetCount }, (_, i) => (
        <circle
          key={`${id}-pkt-${i}`}
          r={5}
          fill="#b91c1c"
          stroke="#fffdf8"
          strokeWidth={1.25}
          className="sim-packet sim-packet-hot"
        >
          <animateMotion
            path={edgePath}
            dur={`${duration}s`}
            begin={`${-(i / packetCount) * duration}s`}
            repeatCount="indefinite"
            rotate="auto"
          />
        </circle>
      ))}
      {load > 0 && (
        <EdgeLabelRenderer>
          <div
            className="sim-edge-label"
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            }}
          >
            {Math.round(load).toLocaleString()} req/s
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  )
}
