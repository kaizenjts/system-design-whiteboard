import type { DiagramDocument, NodeType } from '../../domain/types'
import {
  nodesOfType,
  outgoingMap,
  pathContainsType,
  simplePathsFrom,
  typeById,
} from '../health/graph'

export type NodeHealthState = 'failed' | 'down' | 'degraded' | 'healthy'

export type NodeFailure = {
  nodeId: string
  state: NodeHealthState
  reason: string
}

export type FailureResult = {
  failedNodeId: string | null
  nodes: NodeFailure[]
  blastRadiusNodeIds: string[]
}

/** Dependents-only cascade with PRD per-type teaching rules. */
export function simulateFailure(
  diagram: DiagramDocument,
  failedNodeId: string | null,
): FailureResult {
  const states = new Map<string, NodeFailure>()
  for (const n of diagram.nodes) {
    states.set(n.id, {
      nodeId: n.id,
      state: 'healthy',
      reason: 'Healthy',
    })
  }

  if (!failedNodeId || !states.has(failedNodeId)) {
    return {
      failedNodeId: null,
      nodes: [...states.values()],
      blastRadiusNodeIds: [],
    }
  }

  const types = typeById(diagram)
  const outgoing = outgoingMap(diagram)
  const failedType = types.get(failedNodeId)!

  setState(states, failedNodeId, 'failed', 'Simulated failure')

  switch (failedType) {
    case 'database':
      applyDatabaseFailure(diagram, failedNodeId, outgoing, types, states)
      break
    case 'cache':
      applyCacheFailure(diagram, failedNodeId, outgoing, types, states)
      break
    case 'api':
      applyApiFailure(diagram, failedNodeId, outgoing, states)
      break
    case 'load_balancer':
      applyLbFailure(diagram, failedNodeId, outgoing, types, states)
      break
    case 'cdn_dns':
      applyCdnFailure(diagram, failedNodeId, outgoing, types, states)
      break
    case 'queue':
      // Async path unavailable; sync shorten/redirect stays healthy.
      break
    case 'client':
      // No infra cascade.
      break
  }

  const nodes = [...states.values()]
  return {
    failedNodeId,
    nodes,
    blastRadiusNodeIds: nodes
      .filter((n) => n.state !== 'healthy')
      .map((n) => n.nodeId),
  }
}

function setState(
  states: Map<string, NodeFailure>,
  id: string,
  state: NodeHealthState,
  reason: string,
) {
  const current = states.get(id)
  if (!current || current.state === 'failed') return
  // Prefer Down over Degraded if both would apply
  if (current.state === 'down' && state === 'degraded') return
  states.set(id, { nodeId: id, state, reason })
}

function applyDatabaseFailure(
  diagram: DiagramDocument,
  dbId: string,
  outgoing: Map<string, string[]>,
  types: Map<string, NodeType>,
  states: Map<string, NodeFailure>,
) {
  for (const api of nodesOfType(diagram, 'api')) {
    const pathsToDb = simplePathsFrom(api.id, outgoing).filter((path) =>
      path.includes(dbId),
    )
    if (pathsToDb.length === 0) continue
    const hasCache = pathsToDb.some((path) =>
      pathContainsType(path, types, 'cache'),
    )
    if (hasCache) {
      setState(
        states,
        api.id,
        'degraded',
        'Database failed — API can partially serve via Cache',
      )
    } else {
      setState(
        states,
        api.id,
        'down',
        'Database failed — API has no Cache on the path',
      )
    }
  }
}

function applyCacheFailure(
  diagram: DiagramDocument,
  cacheId: string,
  outgoing: Map<string, string[]>,
  _types: Map<string, NodeType>,
  states: Map<string, NodeFailure>,
) {
  for (const api of nodesOfType(diagram, 'api')) {
    const usesCache = simplePathsFrom(api.id, outgoing).some((path) =>
      path.includes(cacheId),
    )
    if (!usesCache) continue
    setState(
      states,
      api.id,
      'degraded',
      'Cache failed — API continues without cache acceleration',
    )
  }
}

function applyApiFailure(
  diagram: DiagramDocument,
  apiId: string,
  outgoing: Map<string, string[]>,
  states: Map<string, NodeFailure>,
) {
  const upstreamTypes = new Set(['client', 'cdn_dns', 'load_balancer'])
  for (const n of diagram.nodes) {
    if (!upstreamTypes.has(n.type)) continue
    const reachesApi = simplePathsFrom(n.id, outgoing).some((path) =>
      path.includes(apiId),
    )
    if (!reachesApi) continue
    setState(
      states,
      n.id,
      'down',
      'API failed — upstream path cannot complete requests',
    )
  }
}

function applyLbFailure(
  diagram: DiagramDocument,
  lbId: string,
  outgoing: Map<string, string[]>,
  types: Map<string, NodeType>,
  states: Map<string, NodeFailure>,
) {
  for (const n of diagram.nodes) {
    if (n.type !== 'client' && n.type !== 'cdn_dns') continue
    const paths = simplePathsFrom(n.id, outgoing).filter((path) =>
      path.some(
        (id) =>
          types.get(id) === 'api' ||
          types.get(id) === 'database' ||
          types.get(id) === 'cache',
      ),
    )
    if (paths.length === 0) continue
    const allViaLb = paths.every((path) => path.includes(lbId))
    if (!allViaLb) continue
    setState(
      states,
      n.id,
      'down',
      'Load Balancer failed — no alternate path to origin',
    )
  }
}

function applyCdnFailure(
  diagram: DiagramDocument,
  cdnId: string,
  outgoing: Map<string, string[]>,
  types: Map<string, NodeType>,
  states: Map<string, NodeFailure>,
) {
  for (const client of nodesOfType(diagram, 'client')) {
    const paths = simplePathsFrom(client.id, outgoing).filter((path) =>
      path.some(
        (id) =>
          types.get(id) === 'api' ||
          types.get(id) === 'load_balancer' ||
          types.get(id) === 'database',
      ),
    )
    if (paths.length === 0) continue
    const allViaCdn = paths.every((path) => path.includes(cdnId))
    if (!allViaCdn) continue
    setState(
      states,
      client.id,
      'down',
      'CDN/DNS failed — Client has no alternate edge path',
    )
  }
}
