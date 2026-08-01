import { NODE_TYPE_LABELS } from '../domain/catalog'
import type { DiagramDocument, DiagramEdge, DiagramNode, NodeType } from '../domain/types'

const IDS = {
  client: 'node-client',
  cdn_dns: 'node-cdn',
  load_balancer: 'node-lb',
  api: 'node-api',
  cache: 'node-cache',
  database: 'node-db',
  queue: 'node-queue',
} as const

function buildDiagram(
  layout: { type: NodeType; x: number; y: number }[],
  links: [NodeType, NodeType][],
): DiagramDocument {
  const nodes: DiagramNode[] = layout.map(({ type, x, y }) => ({
    id: IDS[type],
    type,
    label: NODE_TYPE_LABELS[type],
    position: { x, y },
  }))

  const edges: DiagramEdge[] = links.map(([sourceType, targetType], i) => ({
    id: `edge-${i + 1}`,
    source: IDS[sourceType],
    target: IDS[targetType],
  }))

  return { version: 1, nodes, edges }
}

/** URL Shortener teaching starter: Client → CDN → LB → API → Cache → Database, plus API → Queue. */
export function createUrlShortenerStarter(): DiagramDocument {
  return buildDiagram(
    [
      { type: 'client', x: 0, y: 120 },
      { type: 'cdn_dns', x: 180, y: 120 },
      { type: 'load_balancer', x: 360, y: 120 },
      { type: 'api', x: 540, y: 120 },
      { type: 'cache', x: 720, y: 40 },
      { type: 'database', x: 900, y: 40 },
      { type: 'queue', x: 720, y: 220 },
    ],
    [
      ['client', 'cdn_dns'],
      ['cdn_dns', 'load_balancer'],
      ['load_balancer', 'api'],
      ['api', 'cache'],
      ['cache', 'database'],
      ['api', 'queue'],
    ],
  )
}

/**
 * Practice variant: same shortener path without Cache (API → Database).
 * Surfaces HC01 immediately; Active Starter stays `url_shortener`.
 */
export function createUrlShortenerBrokenStarter(): DiagramDocument {
  return buildDiagram(
    [
      { type: 'client', x: 0, y: 120 },
      { type: 'cdn_dns', x: 180, y: 120 },
      { type: 'load_balancer', x: 360, y: 120 },
      { type: 'api', x: 540, y: 120 },
      { type: 'database', x: 780, y: 120 },
      { type: 'queue', x: 720, y: 260 },
    ],
    [
      ['client', 'cdn_dns'],
      ['cdn_dns', 'load_balancer'],
      ['load_balancer', 'api'],
      ['api', 'database'],
      ['api', 'queue'],
    ],
  )
}
