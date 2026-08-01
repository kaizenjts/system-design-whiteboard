import { describe, expect, it } from 'vitest'
import type { DiagramDocument, NodeType } from '../../domain/types'
import { createUrlShortenerStarter } from '../../starters/urlShortener'
import { simulateFailure } from './failure'

function node(
  id: string,
  type: NodeType,
  position = { x: 0, y: 0 },
): DiagramDocument['nodes'][number] {
  return { id, type, label: type, position }
}

function edge(id: string, source: string, target: string) {
  return { id, source, target }
}

function stateOf(
  result: ReturnType<typeof simulateFailure>,
  nodeId: string,
) {
  return result.nodes.find((n) => n.nodeId === nodeId)?.state
}

describe('simulateFailure', () => {
  it('marks Database failure on starter as Degraded API (with Cache)', () => {
    const starter = createUrlShortenerStarter()
    const result = simulateFailure(starter, 'node-db')
    expect(stateOf(result, 'node-db')).toBe('failed')
    expect(stateOf(result, 'node-api')).toBe('degraded')
    expect(stateOf(result, 'node-client')).toBe('healthy')
  })

  it('marks API without Cache path to DB as Down when Database fails', () => {
    const doc: DiagramDocument = {
      version: 1,
      nodes: [
        node('c', 'client'),
        node('a', 'api'),
        node('d', 'database'),
      ],
      edges: [edge('e1', 'c', 'a'), edge('e2', 'a', 'd')],
    }
    const result = simulateFailure(doc, 'd')
    expect(stateOf(result, 'a')).toBe('down')
  })

  it('marks upstream path Down when API fails', () => {
    const starter = createUrlShortenerStarter()
    const result = simulateFailure(starter, 'node-api')
    expect(stateOf(result, 'node-api')).toBe('failed')
    expect(stateOf(result, 'node-lb')).toBe('down')
    expect(stateOf(result, 'node-cdn')).toBe('down')
    expect(stateOf(result, 'node-client')).toBe('down')
    expect(stateOf(result, 'node-db')).toBe('healthy')
  })

  it('does not take down sync path when Queue fails', () => {
    const starter = createUrlShortenerStarter()
    const result = simulateFailure(starter, 'node-queue')
    expect(stateOf(result, 'node-queue')).toBe('failed')
    expect(stateOf(result, 'node-api')).toBe('healthy')
    expect(stateOf(result, 'node-client')).toBe('healthy')
    expect(stateOf(result, 'node-db')).toBe('healthy')
  })

  it('replaces the previous Failed target when a new id is simulated', () => {
    const starter = createUrlShortenerStarter()
    const first = simulateFailure(starter, 'node-db')
    expect(first.failedNodeId).toBe('node-db')
    const second = simulateFailure(starter, 'node-api')
    expect(second.failedNodeId).toBe('node-api')
    expect(stateOf(second, 'node-db')).toBe('healthy')
    expect(stateOf(second, 'node-api')).toBe('failed')
  })

  it('clears to all Healthy when failedNodeId is null', () => {
    const starter = createUrlShortenerStarter()
    const result = simulateFailure(starter, null)
    expect(result.failedNodeId).toBeNull()
    expect(result.nodes.every((n) => n.state === 'healthy')).toBe(true)
  })
})
