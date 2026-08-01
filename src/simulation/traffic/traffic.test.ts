import { describe, expect, it } from 'vitest'
import type { DiagramDocument, NodeType } from '../../domain/types'
import { createUrlShortenerStarter } from '../../starters/urlShortener'
import { simulateTraffic } from './traffic'

function node(
  id: string,
  type: NodeType,
  position = { x: 0, y: 0 },
  capacity?: number,
): DiagramDocument['nodes'][number] {
  return {
    id,
    type,
    label: type,
    position,
    ...(capacity !== undefined ? { capacity } : {}),
  }
}

function edge(id: string, source: string, target: string) {
  return { id, source, target }
}

function loadOf(
  result: ReturnType<typeof simulateTraffic>,
  nodeId: string,
) {
  return result.nodes.find((n) => n.nodeId === nodeId)?.loadRps
}

describe('simulateTraffic', () => {
  it('attributes the same Load along a linear path', () => {
    const doc: DiagramDocument = {
      version: 1,
      nodes: [
        node('c', 'client'),
        node('a', 'api'),
        node('d', 'database'),
      ],
      edges: [edge('e1', 'c', 'a'), edge('e2', 'a', 'd')],
    }
    const result = simulateTraffic(doc, 1000)
    expect(loadOf(result, 'c')).toBe(1000)
    expect(loadOf(result, 'a')).toBe(1000)
    expect(loadOf(result, 'd')).toBe(1000)
  })

  it('equal-splits Load across multiple sync outbound edges', () => {
    const doc: DiagramDocument = {
      version: 1,
      nodes: [
        node('c', 'client'),
        node('a', 'api'),
        node('d1', 'database'),
        node('d2', 'database'),
      ],
      edges: [
        edge('e1', 'c', 'a'),
        edge('e2', 'a', 'd1'),
        edge('e3', 'a', 'd2'),
      ],
    }
    const result = simulateTraffic(doc, 1000)
    expect(loadOf(result, 'a')).toBe(1000)
    expect(loadOf(result, 'd1')).toBe(500)
    expect(loadOf(result, 'd2')).toBe(500)
  })

  it('on the URL Shortener starter: 1.5k has no bottleneck; 3k bottlenecks Database only', () => {
    const starter = createUrlShortenerStarter()

    const low = simulateTraffic(starter, 1_500)
    expect(low.bottleneckNodeIds).toEqual([])

    const high = simulateTraffic(starter, 3_000)
    expect(high.bottleneckNodeIds).toEqual(['node-db'])
    expect(loadOf(high, 'node-api')).toBe(3_000)
    expect(high.nodes.find((n) => n.nodeId === 'node-api')?.bottleneck).toBe(
      false,
    )
  })

  it('marks warning at ≥80% and respects capacity override', () => {
    const doc: DiagramDocument = {
      version: 1,
      nodes: [
        node('c', 'client'),
        node('a', 'api', { x: 0, y: 0 }, 1_000),
      ],
      edges: [edge('e1', 'c', 'a')],
    }
    const result = simulateTraffic(doc, 800)
    const api = result.nodes.find((n) => n.nodeId === 'a')!
    expect(api.warning).toBe(true)
    expect(api.bottleneck).toBe(false)
  })
})
