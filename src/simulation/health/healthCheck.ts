import type { ActiveStarter, DiagramDocument } from '../../domain/types'
import {
  edgeIdsOnPath,
  nodesOfType,
  outgoingMap,
  pathContainsType,
  simplePathsFrom,
  typeById,
} from './graph'

export type FindingId =
  | 'HC01'
  | 'HC02'
  | 'HC03'
  | 'HC04'
  | 'HC05'
  | 'HC06'
  | 'HC07'

export type FindingSeverity = 'high' | 'medium'

export type Finding = {
  id: FindingId
  severity: FindingSeverity
  title: string
  explanation: string
  suggestedFix: string
  relatedNodeIds: string[]
  relatedEdgeIds: string[]
}

export type HealthContext = {
  activeStarter: ActiveStarter
}

type Rule = {
  id: FindingId
  severity: FindingSeverity
  title: string
  explanation: string
  suggestedFix: string
  starterOnly?: boolean
  evaluate: (diagram: DiagramDocument) => {
    hit: boolean
    relatedNodeIds: string[]
    relatedEdgeIds: string[]
  }
}

const CATALOG: Rule[] = [
  {
    id: 'HC01',
    severity: 'high',
    title: 'Missing cache on read path',
    explanation:
      'A Client path reaches the Database through the API without a Cache on the lookup path.',
    suggestedFix: 'Put a Cache on the read/lookup path before the Database.',
    evaluate: (diagram) => {
      const types = typeById(diagram)
      const outgoing = outgoingMap(diagram)
      const clients = nodesOfType(diagram, 'client')
      for (const client of clients) {
        for (const path of simplePathsFrom(client.id, outgoing)) {
          const apiIdx = path.findIndex((id) => types.get(id) === 'api')
          const dbIdx = path.findIndex((id) => types.get(id) === 'database')
          if (apiIdx === -1 || dbIdx === -1 || dbIdx <= apiIdx) continue
          const between = path.slice(apiIdx, dbIdx + 1)
          if (!pathContainsType(between, types, 'cache')) {
            return {
              hit: true,
              relatedNodeIds: between,
              relatedEdgeIds: edgeIdsOnPath(
                diagram,
                path.slice(apiIdx, dbIdx + 1),
              ),
            }
          }
        }
      }
      return { hit: false, relatedNodeIds: [], relatedEdgeIds: [] }
    },
  },
  {
    id: 'HC02',
    severity: 'medium',
    title: 'Missing load balancer before API',
    explanation:
      'Traffic reaches the API without a Load Balancer in front of the API tier.',
    suggestedFix: 'Place a Load Balancer in front of the API tier.',
    evaluate: (diagram) => {
      const types = typeById(diagram)
      const outgoing = outgoingMap(diagram)
      const clients = nodesOfType(diagram, 'client')
      for (const client of clients) {
        for (const path of simplePathsFrom(client.id, outgoing)) {
          const apiIdx = path.findIndex((id) => types.get(id) === 'api')
          if (apiIdx === -1) continue
          const prefix = path.slice(0, apiIdx + 1)
          if (!pathContainsType(prefix, types, 'load_balancer')) {
            return {
              hit: true,
              relatedNodeIds: prefix,
              relatedEdgeIds: edgeIdsOnPath(diagram, prefix),
            }
          }
        }
      }
      return { hit: false, relatedNodeIds: [], relatedEdgeIds: [] }
    },
  },
  {
    id: 'HC03',
    severity: 'high',
    title: 'Cache without durable Database',
    explanation:
      'A Cache is present but there is no Database reachable behind it as source of truth.',
    suggestedFix:
      'Add a durable Database behind the Cache as source of truth.',
    evaluate: (diagram) => {
      const caches = nodesOfType(diagram, 'cache')
      if (caches.length === 0) {
        return { hit: false, relatedNodeIds: [], relatedEdgeIds: [] }
      }
      const types = typeById(diagram)
      const outgoing = outgoingMap(diagram)
      const databases = nodesOfType(diagram, 'database')
      if (databases.length === 0) {
        return {
          hit: true,
          relatedNodeIds: caches.map((c) => c.id),
          relatedEdgeIds: [],
        }
      }
      for (const cache of caches) {
        const reachesDb = simplePathsFrom(cache.id, outgoing).some((path) =>
          pathContainsType(path, types, 'database'),
        )
        if (!reachesDb) {
          return {
            hit: true,
            relatedNodeIds: [cache.id],
            relatedEdgeIds: [],
          }
        }
      }
      return { hit: false, relatedNodeIds: [], relatedEdgeIds: [] }
    },
  },
  {
    id: 'HC04',
    severity: 'high',
    title: 'No complete Client → service path',
    explanation:
      'The Client has no outbound path to an API, Cache, or Database that can serve the request.',
    suggestedFix:
      'Connect Client to the services that handle the request end-to-end.',
    evaluate: (diagram) => {
      const clients = nodesOfType(diagram, 'client')
      if (clients.length === 0) {
        return { hit: false, relatedNodeIds: [], relatedEdgeIds: [] }
      }
      const types = typeById(diagram)
      const outgoing = outgoingMap(diagram)
      for (const client of clients) {
        const ok = simplePathsFrom(client.id, outgoing).some(
          (path) =>
            pathContainsType(path, types, 'api') ||
            pathContainsType(path, types, 'cache') ||
            pathContainsType(path, types, 'database'),
        )
        if (!ok) {
          return {
            hit: true,
            relatedNodeIds: [client.id],
            relatedEdgeIds: [],
          }
        }
      }
      return { hit: false, relatedNodeIds: [], relatedEdgeIds: [] }
    },
  },
  {
    id: 'HC05',
    severity: 'medium',
    title: 'Missing CDN/DNS at edge',
    explanation:
      'For this URL Shortener starter, edge traffic should hit CDN/DNS before origin.',
    suggestedFix:
      'Add CDN/DNS at the edge in front of origin for redirect-heavy traffic.',
    starterOnly: true,
    evaluate: (diagram) => {
      const types = typeById(diagram)
      const outgoing = outgoingMap(diagram)
      const clients = nodesOfType(diagram, 'client')
      const cdns = nodesOfType(diagram, 'cdn_dns')
      if (cdns.length === 0) {
        return {
          hit: true,
          relatedNodeIds: clients.map((c) => c.id),
          relatedEdgeIds: [],
        }
      }
      for (const client of clients) {
        for (const path of simplePathsFrom(client.id, outgoing)) {
          const reachesService =
            pathContainsType(path, types, 'api') ||
            pathContainsType(path, types, 'load_balancer') ||
            pathContainsType(path, types, 'database')
          if (!reachesService) continue
          if (!pathContainsType(path, types, 'cdn_dns')) {
            return {
              hit: true,
              relatedNodeIds: path,
              relatedEdgeIds: edgeIdsOnPath(diagram, path),
            }
          }
        }
      }
      return { hit: false, relatedNodeIds: [], relatedEdgeIds: [] }
    },
  },
  {
    id: 'HC06',
    severity: 'medium',
    title: 'Analytics on hot path (no Queue)',
    explanation:
      'The starter reaches a Database but analytics is not emitted asynchronously via a Queue from the API.',
    suggestedFix:
      'Emit click/analytics asynchronously via a Queue off the hot path.',
    starterOnly: true,
    evaluate: (diagram) => {
      const types = typeById(diagram)
      const outgoing = outgoingMap(diagram)
      const clients = nodesOfType(diagram, 'client')
      const hasPathToDb = clients.some((client) =>
        simplePathsFrom(client.id, outgoing).some((path) =>
          pathContainsType(path, types, 'database'),
        ),
      )
      if (!hasPathToDb) {
        return { hit: false, relatedNodeIds: [], relatedEdgeIds: [] }
      }

      const apis = nodesOfType(diagram, 'api')
      const queues = nodesOfType(diagram, 'queue')
      if (queues.length === 0 || apis.length === 0) {
        return {
          hit: true,
          relatedNodeIds: [
            ...apis.map((a) => a.id),
            ...nodesOfType(diagram, 'database').map((d) => d.id),
          ],
          relatedEdgeIds: [],
        }
      }

      const linked = apis.some((api) =>
        (outgoing.get(api.id) ?? []).some((tid) => types.get(tid) === 'queue'),
      )
      if (!linked) {
        return {
          hit: true,
          relatedNodeIds: [
            ...apis.map((a) => a.id),
            ...queues.map((q) => q.id),
          ],
          relatedEdgeIds: [],
        }
      }
      return { hit: false, relatedNodeIds: [], relatedEdgeIds: [] }
    },
  },
  {
    id: 'HC07',
    severity: 'medium',
    title: 'Queue on synchronous user path',
    explanation:
      'A user-facing Client path reaches the API through a Queue, which blocks the synchronous request.',
    suggestedFix:
      'Keep shorten/redirect synchronous; use Queue for async side work only.',
    evaluate: (diagram) => {
      const types = typeById(diagram)
      const outgoing = outgoingMap(diagram)
      const clients = nodesOfType(diagram, 'client')
      for (const client of clients) {
        for (const path of simplePathsFrom(client.id, outgoing)) {
          const apiIdx = path.findIndex((id) => types.get(id) === 'api')
          if (apiIdx === -1) continue
          const prefix = path.slice(0, apiIdx + 1)
          if (pathContainsType(prefix, types, 'queue')) {
            return {
              hit: true,
              relatedNodeIds: prefix,
              relatedEdgeIds: edgeIdsOnPath(diagram, prefix),
            }
          }
        }
      }
      return { hit: false, relatedNodeIds: [], relatedEdgeIds: [] }
    },
  },
]

export function healthCheck(
  diagram: DiagramDocument,
  ctx: HealthContext,
): Finding[] {
  const findings: Finding[] = []
  for (const rule of CATALOG) {
    if (rule.starterOnly && ctx.activeStarter !== 'url_shortener') continue
    const result = rule.evaluate(diagram)
    if (!result.hit) continue
    findings.push({
      id: rule.id,
      severity: rule.severity,
      title: rule.title,
      explanation: rule.explanation,
      suggestedFix: rule.suggestedFix,
      relatedNodeIds: result.relatedNodeIds,
      relatedEdgeIds: result.relatedEdgeIds,
    })
  }
  return findings
}
