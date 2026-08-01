import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type Edge,
  type EdgeProps,
} from '@xyflow/react'

export type TrafficEdgeData = {
  loadRps?: number
  bottleneck?: boolean
  warning?: boolean
  [key: string]: unknown
}

export type TrafficFlowEdge = Edge<TrafficEdgeData>

/** Animated request packets traveling along wiring. */
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
  const bottleneck = Boolean(data?.bottleneck)
  const warning = Boolean(data?.warning)
  const intensity = Math.min(1, Math.max(0.15, load / 3000))
  const duration = Math.max(0.85, 2.4 - intensity * 1.4)
  // Always show at least 2 packets when there is any load so wiring "reads" as live.
  const packetCount =
    load <= 0 ? 2 : Math.min(5, 2 + Math.floor(intensity * 3))

  const stroke = bottleneck
    ? '#b91c1c'
    : warning
      ? '#b45309'
      : '#0f6e56'

  const packetFill = bottleneck ? '#b91c1c' : '#0f6e56'

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke,
          strokeWidth: bottleneck ? 3 : 2 + intensity,
        }}
        className={
          bottleneck
            ? 'sim-edge sim-edge-bottleneck'
            : warning
              ? 'sim-edge sim-edge-warning'
              : 'sim-edge sim-edge-flow'
        }
      />
      {Array.from({ length: packetCount }, (_, i) => (
        <circle
          key={`${id}-pkt-${i}`}
          r={bottleneck ? 5 : 4}
          fill={packetFill}
          stroke="#fffdf8"
          strokeWidth={1.25}
          className="sim-packet"
        >
          {/* path= is more reliable than <mpath> inside React Flow's SVG layers */}
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
