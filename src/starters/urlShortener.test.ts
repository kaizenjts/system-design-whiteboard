import { describe, expect, it } from 'vitest'
import {
  createUrlShortenerBrokenStarter,
  createUrlShortenerStarter,
} from './urlShortener'
import type { DiagramDocument, NodeType } from '../domain/types'
import { healthCheck } from '../simulation/health/healthCheck'
import { simulateFailure } from '../simulation/failure/failure'

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

describe('createUrlShortenerBrokenStarter', () => {
  it('omits Cache and wires API straight to Database', () => {
    const doc = createUrlShortenerBrokenStarter()

    expect(doc.nodes.some((n) => n.type === 'cache')).toBe(false)
    expect(hasEdge(doc, 'api', 'database')).toBe(true)
    expect(hasEdge(doc, 'api', 'queue')).toBe(true)
    expect(hasEdge(doc, 'client', 'cdn_dns')).toBe(true)
  })

  it('surfaces HC01 under Active Starter url_shortener', () => {
    const findings = healthCheck(createUrlShortenerBrokenStarter(), {
      activeStarter: 'url_shortener',
    })
    expect(findings.map((f) => f.id)).toContain('HC01')
  })

  it('marks API Down when Database fails (no Cache fallback)', () => {
    const doc = createUrlShortenerBrokenStarter()
    const failure = simulateFailure(doc, 'node-db')
    expect(failure.nodes.find((n) => n.nodeId === 'node-api')?.state).toBe(
      'down',
    )
  })
})
