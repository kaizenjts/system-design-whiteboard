import { describe, expect, it } from 'vitest'
import type { DiagramDocument } from '../domain/types'
import {
  STORAGE_KEY,
  loadDiagram,
  parseDiagram,
  saveDiagram,
  serializeDiagram,
} from './diagramStorage'

const sample: DiagramDocument = {
  version: 1,
  nodes: [
    {
      id: 'n1',
      type: 'api',
      label: 'API',
      position: { x: 1, y: 2 },
      capacity: 4000,
    },
  ],
  edges: [{ id: 'e1', source: 'n1', target: 'n1' }],
  viewport: { x: 0, y: 0, zoom: 1 },
}

describe('serializeDiagram / parseDiagram', () => {
  it('round-trips a v1 diagram including capacity and viewport', () => {
    const json = serializeDiagram(sample)
    expect(parseDiagram(json)).toEqual(sample)
  })

  it('rejects non-v1 documents', () => {
    expect(() => parseDiagram(JSON.stringify({ version: 2, nodes: [], edges: [] }))).toThrow(
      /version/i,
    )
  })

  it('rejects malformed JSON', () => {
    expect(() => parseDiagram('{')).toThrow()
  })
})

describe('saveDiagram / loadDiagram', () => {
  it('persists under sds.diagram.v1 and restores', () => {
    const memory = new Map<string, string>()
    const storage = {
      getItem: (key: string) => memory.get(key) ?? null,
      setItem: (key: string, value: string) => {
        memory.set(key, value)
      },
      removeItem: (key: string) => {
        memory.delete(key)
      },
    }

    saveDiagram(storage, sample)
    expect(memory.has(STORAGE_KEY)).toBe(true)
    expect(loadDiagram(storage)).toEqual(sample)
  })

  it('returns null when nothing is saved', () => {
    const storage = {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    }
    expect(loadDiagram(storage)).toBeNull()
  })
})
