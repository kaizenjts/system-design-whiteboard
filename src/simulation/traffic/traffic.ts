import { defaultCapacity } from '../../domain/capacity'
import type { DiagramDocument, NodeType } from '../../domain/types'
import { outgoingMap, typeById } from '../health/graph'

export type NodeTraffic = {
  nodeId: string
  loadRps: number
  capacity?: number
  /** load / capacity when capacity is defined; otherwise 0 */
  utilization: number
  warning: boolean
  bottleneck: boolean
}

export type TrafficResult = {
  nodes: NodeTraffic[]
  edgeLoads: { edgeId: string; loadRps: number }[]
  bottleneckNodeIds: string[]
  warningNodeIds: string[]
  highlightNodeIds: string[]
  highlightEdgeIds: string[]
}

/**
 * Attribute global Load from Client(s) along outbound edges.
 * Equal-split across sync outbound edges. Queue edges are async side-emits:
 * they receive a copy of the parent Load and do not dilute the sync path
 * (matches PRD starter teaching loop: 3k → Database bottleneck with API→Queue present).
 */
export function simulateTraffic(
  diagram: DiagramDocument,
  loadRps: number,
): TrafficResult {
  const loadByNode = new Map<string, number>()
  const edgeLoad = new Map<string, number>()
  for (const n of diagram.nodes) loadByNode.set(n.id, 0)

  const clients = diagram.nodes.filter((n) => n.type === 'client')
  if (clients.length === 0 || loadRps <= 0) {
    return emptyResult(diagram)
  }

  const perClient = loadRps / clients.length
  for (const c of clients) loadByNode.set(c.id, perClient)

  const outgoing = outgoingMap(diagram)
  const types = typeById(diagram)
  const edgeIdByPair = new Map<string, string>()
  for (const e of diagram.edges) {
    edgeIdByPair.set(`${e.source}->${e.target}`, e.id)
  }

  // Kahn-style: process nodes once predecessors are done. With DAGs typical of
  // architecture diagrams; if cycles exist, fall back to bounded passes.
  const indegree = new Map<string, number>()
  for (const n of diagram.nodes) indegree.set(n.id, 0)
  for (const e of diagram.edges) {
    indegree.set(e.target, (indegree.get(e.target) ?? 0) + 1)
  }

  const queue: string[] = []
  for (const [id, deg] of indegree) {
    if (deg === 0) queue.push(id)
  }

  const distributed = new Set<string>()
  let guard = 0
  const maxGuard = diagram.nodes.length * diagram.nodes.length + 8

  while (queue.length > 0 && guard < maxGuard) {
    guard += 1
    const id = queue.shift()!
    if (distributed.has(id)) continue
    distributed.add(id)
    distributeFrom(
      id,
      loadByNode.get(id) ?? 0,
      outgoing,
      types,
      edgeIdByPair,
      loadByNode,
      edgeLoad,
    )
    for (const target of outgoing.get(id) ?? []) {
      indegree.set(target, (indegree.get(target) ?? 1) - 1)
      if ((indegree.get(target) ?? 0) <= 0) queue.push(target)
    }
  }

  // Cycles / leftovers: still distribute remaining nodes
  for (const n of diagram.nodes) {
    if (!distributed.has(n.id)) {
      distributeFrom(
        n.id,
        loadByNode.get(n.id) ?? 0,
        outgoing,
        types,
        edgeIdByPair,
        loadByNode,
        edgeLoad,
      )
    }
  }

  const nodes: NodeTraffic[] = diagram.nodes.map((n) => {
    const load = loadByNode.get(n.id) ?? 0
    const capacity =
      n.type === 'client'
        ? undefined
        : (n.capacity ?? defaultCapacity(n.type))
    const utilization =
      capacity && capacity > 0 ? load / capacity : 0
    return {
      nodeId: n.id,
      loadRps: load,
      ...(capacity !== undefined ? { capacity } : {}),
      utilization,
      warning: capacity !== undefined && utilization >= 0.8 && utilization <= 1,
      bottleneck: capacity !== undefined && utilization > 1,
    }
  })

  // Warning is ≥80%; bottleneck is >100%. A bottleneck node is not also "warning".
  for (const n of nodes) {
    if (n.bottleneck) n.warning = false
  }

  const bottleneckNodeIds = nodes
    .filter((n) => n.bottleneck)
    .map((n) => n.nodeId)
  const warningNodeIds = nodes.filter((n) => n.warning).map((n) => n.nodeId)

  const { highlightNodeIds, highlightEdgeIds } = highlightsThroughBottlenecks(
    diagram,
    bottleneckNodeIds,
    outgoing,
  )

  return {
    nodes,
    edgeLoads: [...edgeLoad.entries()].map(([edgeId, load]) => ({
      edgeId,
      loadRps: load,
    })),
    bottleneckNodeIds,
    warningNodeIds,
    highlightNodeIds,
    highlightEdgeIds,
  }
}

function emptyResult(diagram: DiagramDocument): TrafficResult {
  return {
    nodes: diagram.nodes.map((n) => ({
      nodeId: n.id,
      loadRps: 0,
      utilization: 0,
      warning: false,
      bottleneck: false,
    })),
    edgeLoads: [],
    bottleneckNodeIds: [],
    warningNodeIds: [],
    highlightNodeIds: [],
    highlightEdgeIds: [],
  }
}

function distributeFrom(
  id: string,
  load: number,
  outgoing: Map<string, string[]>,
  types: Map<string, NodeType>,
  edgeIdByPair: Map<string, string>,
  loadByNode: Map<string, number>,
  edgeLoad: Map<string, number>,
) {
  if (load <= 0) return
  const targets = outgoing.get(id) ?? []
  if (targets.length === 0) return

  const syncTargets = targets.filter((t) => types.get(t) !== 'queue')
  const queueTargets = targets.filter((t) => types.get(t) === 'queue')

  const push = (target: string, amount: number) => {
    loadByNode.set(target, (loadByNode.get(target) ?? 0) + amount)
    const eid = edgeIdByPair.get(`${id}->${target}`)
    if (eid) edgeLoad.set(eid, (edgeLoad.get(eid) ?? 0) + amount)
  }

  if (syncTargets.length > 0) {
    const share = load / syncTargets.length
    for (const t of syncTargets) push(t, share)
    for (const t of queueTargets) push(t, load)
  } else {
    const share = load / queueTargets.length
    for (const t of queueTargets) push(t, share)
  }
}

function highlightsThroughBottlenecks(
  diagram: DiagramDocument,
  bottleneckNodeIds: string[],
  outgoing: Map<string, string[]>,
): { highlightNodeIds: string[]; highlightEdgeIds: string[] } {
  if (bottleneckNodeIds.length === 0) {
    return { highlightNodeIds: [], highlightEdgeIds: [] }
  }
  const bottleneck = new Set(bottleneckNodeIds)
  const clients = diagram.nodes.filter((n) => n.type === 'client')
  const highlightNodes = new Set<string>()
  const highlightEdges = new Set<string>()

  for (const client of clients) {
    const stack: { path: string[] }[] = [{ path: [client.id] }]
    while (stack.length > 0) {
      const { path } = stack.pop()!
      const last = path[path.length - 1]!
      if (bottleneck.has(last)) {
        for (const id of path) highlightNodes.add(id)
        for (let i = 0; i < path.length - 1; i++) {
          const e = diagram.edges.find(
            (edge) =>
              edge.source === path[i] && edge.target === path[i + 1],
          )
          if (e) highlightEdges.add(e.id)
        }
      }
      for (const next of outgoing.get(last) ?? []) {
        if (path.includes(next)) continue
        stack.push({ path: [...path, next] })
      }
    }
  }

  return {
    highlightNodeIds: [...highlightNodes],
    highlightEdgeIds: [...highlightEdges],
  }
}
