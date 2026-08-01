import { MarkerType, type Edge, type Node } from '@xyflow/react'
import type { DiagramDocument, NodeType } from '../domain/types'
import type { FailureEdgeData } from './FailureEdge'
import type { TrafficEdgeData } from './TrafficEdge'

export type ArchitectureNodeData = {
  label: string
  nodeType: NodeType
  capacity?: number
  loadRps?: number
  trafficState?: 'ok' | 'warning' | 'bottleneck'
  failureState?: 'failed' | 'down' | 'degraded' | 'healthy'
  failureReason?: string
  /** Hop distance from the failed root — drives cascade stagger. */
  cascadeHop?: number
  /** Health finding severity when highlighted. */
  findingSeverity?: 'high' | 'medium'
  [key: string]: unknown
}

export type ArchitectureFlowNode = Node<ArchitectureNodeData, NodeType>

export type FlowViewOptions = {
  selectedNodeId?: string | null
  highlightNodeIds?: ReadonlySet<string> | readonly string[]
  highlightEdgeIds?: ReadonlySet<string> | readonly string[]
  warningNodeIds?: ReadonlySet<string> | readonly string[]
  bottleneckNodeIds?: ReadonlySet<string> | readonly string[]
  loadByNodeId?: ReadonlyMap<string, number> | Record<string, number>
  edgeLoadById?: ReadonlyMap<string, number> | Record<string, number>
  edgeMode?: 'default' | 'traffic' | 'failure'
  failureByNodeId?: ReadonlyMap<
    string,
    { state: 'failed' | 'down' | 'degraded' | 'healthy'; reason: string }
  >
  cascadeHopByNodeId?: ReadonlyMap<string, number> | Record<string, number>
  findingSeverityByNodeId?: ReadonlyMap<
    string,
    'high' | 'medium'
  > | Record<string, 'high' | 'medium'>
}

export function toFlowNodes(
  diagram: DiagramDocument,
  options: FlowViewOptions = {},
): ArchitectureFlowNode[] {
  const selectedNodeId = options.selectedNodeId ?? null
  const highlights = toSet(options.highlightNodeIds)
  const warnings = toSet(options.warningNodeIds)
  const bottlenecks = toSet(options.bottleneckNodeIds)
  const loads = toLoadMap(options.loadByNodeId)
  const failures = options.failureByNodeId
  const hops = toNumberMap(options.cascadeHopByNodeId)
  const findingSeverity = toSeverityMap(options.findingSeverityByNodeId)

  return diagram.nodes.map((n) => {
    const failure = failures?.get(n.id)
    const severity = findingSeverity.get(n.id)
    const classes = [
      highlights.has(n.id)
        ? severity === 'high'
          ? 'rf-node-highlight rf-node-finding-high'
          : severity === 'medium'
            ? 'rf-node-highlight rf-node-finding-medium'
            : 'rf-node-highlight'
        : '',
      bottlenecks.has(n.id) ? 'rf-node-bottleneck' : '',
      warnings.has(n.id) ? 'rf-node-warning' : '',
      failure && failure.state !== 'healthy' ? `rf-node-fail-${failure.state}` : '',
    ]
      .filter(Boolean)
      .join(' ')

    const loadRps = loads.get(n.id)
    const trafficState = bottlenecks.has(n.id)
      ? 'bottleneck'
      : warnings.has(n.id)
        ? 'warning'
        : 'ok'
    const cascadeHop = hops.get(n.id)

    return {
      id: n.id,
      type: n.type,
      position: n.position,
      selected: n.id === selectedNodeId,
      className: classes || undefined,
      data: {
        label: n.label,
        nodeType: n.type,
        ...(n.capacity !== undefined ? { capacity: n.capacity } : {}),
        ...(loadRps !== undefined ? { loadRps, trafficState } : {}),
        ...(failure
          ? {
              failureState: failure.state,
              failureReason: failure.reason,
              ...(cascadeHop !== undefined ? { cascadeHop } : {}),
            }
          : {}),
        ...(severity ? { findingSeverity: severity } : {}),
      },
    }
  })
}

export function toFlowEdges(
  diagram: DiagramDocument,
  options: FlowViewOptions = {},
): Edge[] {
  const highlights = toSet(options.highlightEdgeIds)
  const edgeLoads = toLoadMap(options.edgeLoadById)
  const bottlenecks = toSet(options.bottleneckNodeIds)
  const warnings = toSet(options.warningNodeIds)
  const blastNodes = toSet(options.highlightNodeIds)
  const edgeMode = options.edgeMode ?? 'default'

  return diagram.edges.map((e) => {
    const loadRps = edgeLoads.get(e.id) ?? 0
    const touchesBottleneck =
      bottlenecks.has(e.source) || bottlenecks.has(e.target)
    const touchesWarning = warnings.has(e.source) || warnings.has(e.target)
    const inBlast =
      blastNodes.has(e.source) && blastNodes.has(e.target)

    if (edgeMode === 'traffic') {
      const data: TrafficEdgeData = {
        loadRps,
        bottleneck: touchesBottleneck && loadRps > 0,
        warning: !touchesBottleneck && touchesWarning && loadRps > 0,
      }
      return {
        id: e.id,
        source: e.source,
        target: e.target,
        type: 'traffic',
        markerEnd: { type: MarkerType.ArrowClosed },
        className: highlights.has(e.id) ? 'rf-edge-highlight' : undefined,
        data,
      }
    }

    if (edgeMode === 'failure') {
      const data: FailureEdgeData = { inBlastRadius: inBlast }
      return {
        id: e.id,
        source: e.source,
        target: e.target,
        type: 'failure',
        markerEnd: { type: MarkerType.ArrowClosed },
        data,
      }
    }

    return {
      id: e.id,
      source: e.source,
      target: e.target,
      type: 'wiring',
      markerEnd: { type: MarkerType.ArrowClosed },
      className: highlights.has(e.id) ? 'rf-edge-highlight' : undefined,
    }
  })
}

function toSet(ids?: ReadonlySet<string> | readonly string[]): Set<string> {
  if (!ids) return new Set()
  return ids instanceof Set ? ids : new Set(ids)
}

function toLoadMap(
  loads?: ReadonlyMap<string, number> | Record<string, number>,
): Map<string, number> {
  return toNumberMap(loads)
}

function toNumberMap(
  values?: ReadonlyMap<string, number> | Record<string, number>,
): Map<string, number> {
  if (!values) return new Map()
  if (values instanceof Map) return values
  return new Map(Object.entries(values))
}

function toSeverityMap(
  values?:
    | ReadonlyMap<string, 'high' | 'medium'>
    | Record<string, 'high' | 'medium'>,
): Map<string, 'high' | 'medium'> {
  if (!values) return new Map()
  if (values instanceof Map) return values
  return new Map(
    Object.entries(values) as [string, 'high' | 'medium'][],
  )
}
