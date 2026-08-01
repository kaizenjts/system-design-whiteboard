import {
  BaseEdge,
  getBezierPath,
  type Edge,
  type EdgeProps,
} from '@xyflow/react'

export type FailureEdgeData = {
  inBlastRadius?: boolean
  [key: string]: unknown
}

export type FailureFlowEdge = Edge<FailureEdgeData>

/** Blast-radius edges carry red failure pulses; others dim so the cascade reads. */
export function FailureEdge({
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
}: EdgeProps<FailureFlowEdge>) {
  const [path] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  })

  const hot = Boolean(data?.inBlastRadius)
  const packetCount = hot ? 3 : 0
  const duration = 1.15

  return (
    <>
      <BaseEdge
        id={id}
        path={path}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: hot ? 'var(--sim-danger)' : 'var(--line)',
          strokeWidth: hot ? 2.75 : 1.25,
          opacity: hot ? 1 : 0.32,
        }}
        className={hot ? 'sim-edge sim-edge-blast' : 'sim-edge sim-edge-dim'}
      />
      {Array.from({ length: packetCount }, (_, i) => (
        <circle
          key={`${id}-fail-pkt-${i}`}
          r={i === 0 ? 5.5 : 4}
          fill="#b91c1c"
          stroke="#fffdf8"
          strokeWidth={1.25}
          className="sim-packet sim-packet-hot"
        >
          <animateMotion
            path={path}
            dur={`${duration}s`}
            begin={`${-(i / packetCount) * duration}s`}
            repeatCount="indefinite"
            rotate="auto"
          />
        </circle>
      ))}
      {hot && (
        <g className="sim-fail-burst" pointerEvents="none">
          <circle
            cx={(sourceX + targetX) / 2}
            cy={(sourceY + targetY) / 2}
            r={3}
            fill="#b91c1c"
            className="sim-fail-burst-core"
          >
            <animate
              attributeName="opacity"
              values="0.45;1;0.45"
              dur="1.2s"
              repeatCount="indefinite"
            />
          </circle>
          <circle
            cx={(sourceX + targetX) / 2}
            cy={(sourceY + targetY) / 2}
            r={3}
            fill="none"
            stroke="#b91c1c"
            strokeWidth={1.5}
          >
            <animate
              attributeName="r"
              values="3;14"
              dur="1.2s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.65;0"
              dur="1.2s"
              repeatCount="indefinite"
            />
          </circle>
        </g>
      )}
    </>
  )
}
