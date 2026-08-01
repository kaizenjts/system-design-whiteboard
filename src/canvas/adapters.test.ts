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
})
