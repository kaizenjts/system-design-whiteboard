import type { DiagramDocument, NodeType } from './types'

export const EMPTY_DIAGRAM: DiagramDocument = {
  version: 1,
  nodes: [],
  edges: [],
}

export const NODE_TYPE_LABELS: Record<NodeType, string> = {
  client: 'Client',
  cdn_dns: 'CDN / DNS',
  load_balancer: 'Load Balancer',
  api: 'API',
  cache: 'Cache',
  database: 'Database',
  queue: 'Queue',
}

export const PALETTE_TYPES: NodeType[] = [
  'client',
  'cdn_dns',
  'load_balancer',
  'api',
  'cache',
  'database',
  'queue',
]
