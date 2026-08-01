import { describe, expect, it } from 'vitest'
import { createUrlShortenerStarter } from './urlShortener'
import type { DiagramDocument, NodeType } from '../domain/types'

function nodeByType(doc: DiagramDocument, type: NodeType) {
  const matches = doc.nodes.filter((n) => n.type === type)
  expect(matches).toHaveLength(1)
  return matches[0]!
}

function hasEdge(
  doc: DiagramDocument,
  sourceType: NodeType,
  targetType: NodeType,
) {
  const source = nodeByType(doc, sourceType)
  const target = nodeByType(doc, targetType)
  return doc.edges.some((e) => e.source === source.id && e.target === target.id)
}

describe('createUrlShortenerStarter', () => {
  it('returns a version-1 diagram with the teaching topology', () => {
    const doc = createUrlShortenerStarter()

    expect(doc.version).toBe(1)

    const chain: NodeType[] = [
      'client',
      'cdn_dns',
      'load_balancer',
      'api',
      'cache',
      'database',
    ]
    for (let i = 0; i < chain.length - 1; i++) {
      expect(hasEdge(doc, chain[i]!, chain[i + 1]!)).toBe(true)
    }

    expect(hasEdge(doc, 'api', 'queue')).toBe(true)
  })
})
