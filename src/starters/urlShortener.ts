import { NODE_TYPE_LABELS } from '../domain/catalog'
import type { DiagramDocument, DiagramEdge, DiagramNode, NodeType } from '../domain/types'

/** URL Shortener teaching starter: Client → CDN → LB → API → Cache → Database, plus API → Queue. */
export function createUrlShortenerStarter(): DiagramDocument {
  const ids = {
    client: 'node-client',
    cdn_dns: 'node-cdn',
    load_balancer: 'node-lb',
    api: 'node-api',
    cache: 'node-cache',
    database: 'node-db',
    queue: 'node-queue',
  } as const

  const layout: { type: NodeType; x: number; y: number }[] = [
    { type: 'client', x: 0, y: 120 },
    { type: 'cdn_dns', x: 180, y: 120 },
    { type: 'load_balancer', x: 360, y: 120 },
    { type: 'api', x: 540, y: 120 },
    { type: 'cache', x: 720, y: 40 },
    { type: 'database', x: 900, y: 40 },
    { type: 'queue', x: 720, y: 220 },
  ]

  const nodes: DiagramNode[] = layout.map(({ type, x, y }) => ({
    id: ids[type],
    type,
    label: NODE_TYPE_LABELS[type],
    position: { x, y },
  }))

  const links: [NodeType, NodeType][] = [
    ['client', 'cdn_dns'],
    ['cdn_dns', 'load_balancer'],
    ['load_balancer', 'api'],
    ['api', 'cache'],
    ['cache', 'database'],
    ['api', 'queue'],
  ]

  const edges: DiagramEdge[] = links.map(([sourceType, targetType], i) => ({
    id: `edge-${i + 1}`,
    source: ids[sourceType],
    target: ids[targetType],
  }))

  return { version: 1, nodes, edges }
}
