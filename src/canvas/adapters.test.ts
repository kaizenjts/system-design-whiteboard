import { describe, expect, it } from 'vitest'
import type { DiagramDocument } from '../domain/types'
import { toFlowEdges, toFlowNodes } from './adapters'

const sample: DiagramDocument = {
  version: 1,
  nodes: [
    {
      id: 'a',
      type: 'client',
      label: 'Client',
      position: { x: 10, y: 20 },
    },
    {
      id: 'b',
      type: 'api',
      label: 'API',
      position: { x: 100, y: 20 },
      capacity: 4_000,
    },
  ],
  edges: [{ id: 'e1', source: 'a', target: 'b' }],
}

describe('domain ↔ React Flow adapters', () => {
  it('maps domain nodes to RF nodes with type, position, and data', () => {
    const nodes = toFlowNodes(sample)

    expect(nodes).toEqual([
      {
        id: 'a',
        type: 'client',
        position: { x: 10, y: 20 },
        selected: false,
        data: { label: 'Client', nodeType: 'client' },
      },
      {
        id: 'b',
        type: 'api',
        position: { x: 100, y: 20 },
        selected: false,
        data: { label: 'API', nodeType: 'api', capacity: 4_000 },
      },
    ])
  })

  it('marks the selected domain node on the RF view model', () => {
    const nodes = toFlowNodes(sample, { selectedNodeId: 'b' })
    expect(nodes.find((n) => n.id === 'b')?.selected).toBe(true)
    expect(nodes.find((n) => n.id === 'a')?.selected).toBe(false)
  })

  it('maps domain edges to directed RF edges', () => {
    expect(toFlowEdges(sample)).toEqual([
      {
        id: 'e1',
        source: 'a',
        target: 'b',
        type: 'wiring',
        markerEnd: { type: 'arrowclosed' },
      },
    ])
  })

  it('marks traffic packets only on Bottleneck highlight edges', () => {
    const edges = toFlowEdges(sample, {
      edgeMode: 'traffic',
      edgeLoadById: { e1: 3000 },
      highlightEdgeIds: ['e1'],
      warningNodeIds: [],
      bottleneckNodeIds: ['b'],
    })

    expect(edges[0]?.data).toMatchObject({
      loadRps: 3000,
      onBottleneckPath: true,
      warning: false,
    })
    expect(edges[0]?.className).toBe('rf-edge-bottleneck-path')
  })

  it('keeps dash-only traffic edges off the Bottleneck path (no packets flag)', () => {
    const edges = toFlowEdges(sample, {
      edgeMode: 'traffic',
      edgeLoadById: { e1: 1500 },
      highlightEdgeIds: [],
      warningNodeIds: [],
      bottleneckNodeIds: [],
    })

    expect(edges[0]?.data).toMatchObject({
      loadRps: 1500,
      onBottleneckPath: false,
      warning: false,
    })
    expect(edges[0]?.className).toBeUndefined()
  })

  it('accents non-bottleneck nodes on the traffic highlight path', () => {
    const nodes = toFlowNodes(sample, {
      loadByNodeId: { a: 3000, b: 3000 },
      highlightNodeIds: ['a', 'b'],
      bottleneckNodeIds: ['b'],
    })

    expect(nodes.find((n) => n.id === 'a')?.className).toContain(
      'rf-node-traffic-path',
    )
    expect(nodes.find((n) => n.id === 'a')?.data.onTrafficPath).toBe(true)
    expect(nodes.find((n) => n.id === 'b')?.className).toContain(
      'rf-node-bottleneck',
    )
    expect(nodes.find((n) => n.id === 'b')?.className).not.toContain(
      'rf-node-traffic-path',
    )
  })

  it('marks Health presence vs focus tone on finding highlights', () => {
    const presence = toFlowNodes(sample, {
      highlightNodeIds: ['b'],
      findingSeverityByNodeId: { b: 'high' },
      healthHighlightMode: 'presence',
    })
    expect(presence.find((n) => n.id === 'b')?.data).toMatchObject({
      findingSeverity: 'high',
      findingTone: 'presence',
    })
    expect(presence.find((n) => n.id === 'b')?.className).toContain(
      'rf-node-finding-presence',
    )

    const focus = toFlowNodes(sample, {
      highlightNodeIds: ['b'],
      findingSeverityByNodeId: { b: 'medium' },
      healthHighlightMode: 'focus',
      findingPulseKey: 3,
    })
    expect(focus.find((n) => n.id === 'b')?.data).toMatchObject({
      findingSeverity: 'medium',
      findingTone: 'focus',
      findingPulseKey: 3,
    })
  })
})
