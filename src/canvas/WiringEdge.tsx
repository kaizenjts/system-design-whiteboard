import {
  BaseEdge,
  getBezierPath,
  type Edge,
  type EdgeProps,
} from '@xyflow/react'

export type WiringEdgeData = {
  muted?: boolean
  [key: string]: unknown
}

export type WiringFlowEdge = Edge<WiringEdgeData>

/**
 * Default / Design-mode wiring with a subtle flowing dash + traveling bead
 * so cables never feel "dead" on the canvas.
 */
export function WiringEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  markerEnd,
  style,
  data,
}: EdgeProps<WiringFlowEdge>) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  })

  const muted = Boolean(data?.muted)

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: muted ? '#cfc6b8' : '#8a8278',
          strokeWidth: muted ? 1.25 : 1.75,
        }}
        className="sim-edge sim-edge-wiring"
      />
      {!muted && (
        <circle
          r={3.25}
          fill="#0f6e56"
          stroke="#fffdf8"
          strokeWidth={1}
          className="sim-packet sim-packet-wiring"
          opacity={0.9}
        >
          <animateMotion
            path={edgePath}
            dur="2.2s"
            repeatCount="indefinite"
            rotate="auto"
          />
        </circle>
      )}
    </>
  )
}
