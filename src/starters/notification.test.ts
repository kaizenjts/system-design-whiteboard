import { describe, expect, it } from 'vitest'
import type { DiagramDocument, NodeType } from '../domain/types'
import { simulateFailure } from '../simulation/failure/failure'
import { simulateTraffic } from '../simulation/traffic/traffic'
import { createNotificationStarter } from './notification'

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

function stateOf(
  result: ReturnType<typeof simulateFailure>,
  nodeId: string,
) {
  return result.nodes.find((n) => n.nodeId === nodeId)?.state
}

describe('createNotificationStarter', () => {
  it('returns a version-1 diagram with the teaching topology (no CDN)', () => {
    const doc = createNotificationStarter()

    expect(doc.version).toBe(1)
    expect(doc.nodes.some((n) => n.type === 'cdn_dns')).toBe(false)

    const chain: NodeType[] = [
      'client',
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

  it('is clean at ~2k Load and bottlenecks Database at ~5k', () => {
    const doc = createNotificationStarter()
    const db = nodeByType(doc, 'database')

    expect(simulateTraffic(doc, 2_000).bottleneckNodeIds).toEqual([])
    expect(simulateTraffic(doc, 5_000).bottleneckNodeIds).toEqual([db.id])
  })

  it('keeps sync path Healthy when Queue fails; Degrades API when Database fails', () => {
    const doc = createNotificationStarter()
    const queue = nodeByType(doc, 'queue')
    const db = nodeByType(doc, 'database')
    const api = nodeByType(doc, 'api')

    const queueFail = simulateFailure(doc, queue.id)
    expect(stateOf(queueFail, queue.id)).toBe('failed')
    expect(stateOf(queueFail, api.id)).toBe('healthy')
    expect(stateOf(queueFail, db.id)).toBe('healthy')

    const dbFail = simulateFailure(doc, db.id)
    expect(stateOf(dbFail, db.id)).toBe('failed')
    expect(stateOf(dbFail, api.id)).toBe('degraded')
  })
})
