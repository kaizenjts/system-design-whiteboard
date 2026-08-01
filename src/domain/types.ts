export type Mode = 'design' | 'health' | 'traffic' | 'failure'

/** Which Starter Template is loaded; null when none / freeform diagram. */
export type ActiveStarter = 'url_shortener' | 'notification' | null

export type NodeType =
  | 'client'
  | 'cdn_dns'
  | 'load_balancer'
  | 'api'
  | 'cache'
  | 'database'
  | 'queue'

export type DiagramNode = {
  id: string
  type: NodeType
  label: string
  position: { x: number; y: number }
  /** Override; omit to use type default. Client has none. */
  capacity?: number
}

export type DiagramEdge = {
  id: string
  /** Dependent (traffic/dependency source) */
  source: string
  /** Dependency (target) */
  target: string
}

export type DiagramDocument = {
  version: 1
  nodes: DiagramNode[]
  edges: DiagramEdge[]
  viewport?: { x: number; y: number; zoom: number }
}

export const MODES: { id: Mode; label: string }[] = [
  { id: 'design', label: 'Design' },
  { id: 'health', label: 'Health' },
  { id: 'traffic', label: 'Traffic' },
  { id: 'failure', label: 'Failure' },
]
