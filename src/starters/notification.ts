import { NODE_TYPE_LABELS } from '../domain/catalog'
import type { DiagramDocument, DiagramEdge, DiagramNode, NodeType } from '../domain/types'

/**
 * Notification Service teaching starter:
 * Client → LB → API → Cache → Database, plus API → Queue (fan-out).
 * No CDN — contrasts the URL Shortener edge path.
 *
 * Cache sits on the path to Database so Failure Simulation yields Degraded API
 * when the Database fails (same cascade rule as the URL Shortener).
 */
export function createNotificationStarter(): DiagramDocument {
  const ids = {
    client: 'node-client',
    load_balancer: 'node-lb',
    api: 'node-api',
    cache: 'node-cache',
    database: 'node-db',
    queue: 'node-queue',
  } as const

  const layout: { type: Exclude<NodeType, 'cdn_dns'>; x: number; y: number }[] =
    [
      { type: 'client', x: 0, y: 120 },
      { type: 'load_balancer', x: 180, y: 120 },
      { type: 'api', x: 360, y: 120 },
      { type: 'cache', x: 540, y: 40 },
      { type: 'database', x: 720, y: 40 },
      { type: 'queue', x: 540, y: 220 },
    ]

  const nodes: DiagramNode[] = layout.map(({ type, x, y }) => ({
    id: ids[type],
    type,
    label: NODE_TYPE_LABELS[type],
    position: { x, y },
  }))

  const links: [keyof typeof ids, keyof typeof ids][] = [
    ['client', 'load_balancer'],
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
