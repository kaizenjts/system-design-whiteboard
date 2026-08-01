import type { DiagramDocument, DiagramNode, NodeType } from '../../domain/types'

/** Outgoing adjacency: source → targets (A → B means A depends on B). */
export function outgoingMap(diagram: DiagramDocument): Map<string, string[]> {
  const map = new Map<string, string[]>()
  for (const n of diagram.nodes) map.set(n.id, [])
  for (const e of diagram.edges) {
    const list = map.get(e.source)
    if (list) list.push(e.target)
    else map.set(e.source, [e.target])
  }
  return map
}

export function nodesOfType(
  diagram: DiagramDocument,
  type: NodeType,
): DiagramNode[] {
  return diagram.nodes.filter((n) => n.type === type)
}

export function typeById(diagram: DiagramDocument): Map<string, NodeType> {
  return new Map(diagram.nodes.map((n) => [n.id, n.type]))
}

/** All simple paths from start following outgoing edges. */
export function simplePathsFrom(
  startId: string,
  outgoing: Map<string, string[]>,
  maxDepth = 16,
): string[][] {
  const results: string[][] = []
  const stack: { path: string[] }[] = [{ path: [startId] }]

  while (stack.length > 0) {
    const { path } = stack.pop()!
    results.push(path)
    if (path.length >= maxDepth) continue
    const last = path[path.length - 1]!
    for (const next of outgoing.get(last) ?? []) {
      if (path.includes(next)) continue
      stack.push({ path: [...path, next] })
    }
  }
  return results
}

export function edgeIdsOnPath(
  diagram: DiagramDocument,
  path: string[],
): string[] {
  const ids: string[] = []
  for (let i = 0; i < path.length - 1; i++) {
    const source = path[i]!
    const target = path[i + 1]!
    const edge = diagram.edges.find(
      (e) => e.source === source && e.target === target,
    )
    if (edge) ids.push(edge.id)
  }
  return ids
}

export function pathContainsType(
  path: string[],
  types: Map<string, NodeType>,
  type: NodeType,
): boolean {
  return path.some((id) => types.get(id) === type)
}
