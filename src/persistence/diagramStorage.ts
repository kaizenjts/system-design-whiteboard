import type {
  DiagramDocument,
  DiagramEdge,
  DiagramNode,
  NodeType,
} from '../domain/types'

export const STORAGE_KEY = 'sds.diagram.v1'

export type DiagramStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

const NODE_TYPES = new Set<NodeType>([
  'client',
  'cdn_dns',
  'load_balancer',
  'api',
  'cache',
  'database',
  'queue',
])

export function serializeDiagram(diagram: DiagramDocument): string {
  return JSON.stringify(diagram)
}

export function parseDiagram(json: string): DiagramDocument {
  let raw: unknown
  try {
    raw = JSON.parse(json)
  } catch {
    throw new Error('Invalid JSON')
  }

  if (!raw || typeof raw !== 'object') {
    throw new Error('Diagram must be an object')
  }

  const doc = raw as Record<string, unknown>
  if (doc.version !== 1) {
    throw new Error('Unsupported diagram version (expected version: 1)')
  }
  if (!Array.isArray(doc.nodes) || !Array.isArray(doc.edges)) {
    throw new Error('Diagram must include nodes and edges arrays')
  }

  const nodes: DiagramNode[] = doc.nodes.map((n, i) => parseNode(n, i))
  const edges: DiagramEdge[] = doc.edges.map((e, i) => parseEdge(e, i))

  const result: DiagramDocument = { version: 1, nodes, edges }

  if (doc.viewport !== undefined) {
    result.viewport = parseViewport(doc.viewport)
  }

  return result
}

export function saveDiagram(storage: DiagramStorage, diagram: DiagramDocument): void {
  storage.setItem(STORAGE_KEY, serializeDiagram(diagram))
}

export function loadDiagram(storage: DiagramStorage): DiagramDocument | null {
  const raw = storage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    return parseDiagram(raw)
  } catch {
    return null
  }
}

function parseNode(raw: unknown, index: number): DiagramNode {
  if (!raw || typeof raw !== 'object') {
    throw new Error(`Invalid node at index ${index}`)
  }
  const n = raw as Record<string, unknown>
  if (typeof n.id !== 'string' || typeof n.label !== 'string') {
    throw new Error(`Invalid node fields at index ${index}`)
  }
  if (typeof n.type !== 'string' || !NODE_TYPES.has(n.type as NodeType)) {
    throw new Error(`Invalid node type at index ${index}`)
  }
  if (
    !n.position ||
    typeof n.position !== 'object' ||
    typeof (n.position as { x?: unknown }).x !== 'number' ||
    typeof (n.position as { y?: unknown }).y !== 'number'
  ) {
    throw new Error(`Invalid node position at index ${index}`)
  }

  const node: DiagramNode = {
    id: n.id,
    type: n.type as NodeType,
    label: n.label,
    position: {
      x: (n.position as { x: number }).x,
      y: (n.position as { y: number }).y,
    },
  }
  if (n.capacity !== undefined) {
    if (typeof n.capacity !== 'number' || !Number.isFinite(n.capacity)) {
      throw new Error(`Invalid capacity at index ${index}`)
    }
    node.capacity = n.capacity
  }
  return node
}

function parseEdge(raw: unknown, index: number): DiagramEdge {
  if (!raw || typeof raw !== 'object') {
    throw new Error(`Invalid edge at index ${index}`)
  }
  const e = raw as Record<string, unknown>
  if (
    typeof e.id !== 'string' ||
    typeof e.source !== 'string' ||
    typeof e.target !== 'string'
  ) {
    throw new Error(`Invalid edge fields at index ${index}`)
  }
  return { id: e.id, source: e.source, target: e.target }
}

function parseViewport(raw: unknown): { x: number; y: number; zoom: number } {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Invalid viewport')
  }
  const v = raw as Record<string, unknown>
  if (
    typeof v.x !== 'number' ||
    typeof v.y !== 'number' ||
    typeof v.zoom !== 'number'
  ) {
    throw new Error('Invalid viewport fields')
  }
  return { x: v.x, y: v.y, zoom: v.zoom }
}
