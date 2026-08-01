import {
  BaseEdge,
  getSmoothStepPath,
  type Edge,
  type EdgeProps,
} from '@xyflow/react'

export type FailureEdgeData = {
  inBlastRadius?: boolean
  [key: string]: unknown
}

export type FailureFlowEdge = Edge<FailureEdgeData>

/**
 * Failure Mode edges: soft danger dash on blast-radius links; soft-dim others.
 * Packets/bursts are Traffic Bottleneck–only (experience polish spec).
 */
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
  const [path] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    borderRadius: 10,
    offset: 18,
  })

  const hot = Boolean(data?.inBlastRadius)

  return (
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
  )
}
