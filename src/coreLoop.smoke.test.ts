import { describe, expect, it } from 'vitest'
import {
  STORAGE_KEY,
  loadDiagram,
  parseDiagram,
  saveDiagram,
  serializeDiagram,
} from './persistence/diagramStorage'
import { META_KEY, loadMeta, saveMeta } from './persistence/sessionMeta'
import { simulateFailure } from './simulation/failure/failure'
import { healthCheck } from './simulation/health/healthCheck'
import { simulateTraffic } from './simulation/traffic/traffic'
import { STARTERS } from './starters/catalog'
import { createNotificationStarter } from './starters/notification'
import { createUrlShortenerStarter } from './starters/urlShortener'

describe('core loop smoke', () => {
  it('runs Health → Traffic → Failure on the URL Shortener starter without false positives', () => {
    const starter = createUrlShortenerStarter()

    const findings = healthCheck(starter, { activeStarter: 'url_shortener' })
    expect(findings).toEqual([])

    const at1500 = simulateTraffic(starter, 1_500)
    expect(at1500.bottleneckNodeIds).toEqual([])

    const at3000 = simulateTraffic(starter, 3_000)
    expect(at3000.bottleneckNodeIds).toEqual(['node-db'])

    const failure = simulateFailure(starter, 'node-db')
    expect(failure.nodes.find((n) => n.nodeId === 'node-api')?.state).toBe(
      'degraded',
    )
    expect(failure.blastRadiusNodeIds).toContain('node-db')
    expect(failure.blastRadiusNodeIds).toContain('node-api')
  })

  it('runs Health → Traffic → Failure on the Notification starter without false positives', () => {
    const starter = createNotificationStarter()

    expect(
      healthCheck(starter, { activeStarter: 'notification' }),
    ).toEqual([])

    expect(simulateTraffic(starter, 2_000).bottleneckNodeIds).toEqual([])
    expect(simulateTraffic(starter, 5_000).bottleneckNodeIds).toEqual([
      'node-db',
    ])

    const queueFail = simulateFailure(starter, 'node-queue')
    expect(queueFail.nodes.find((n) => n.nodeId === 'node-queue')?.state).toBe(
      'failed',
    )
    expect(queueFail.nodes.find((n) => n.nodeId === 'node-api')?.state).toBe(
      'healthy',
    )
    expect(queueFail.nodes.find((n) => n.nodeId === 'node-db')?.state).toBe(
      'healthy',
    )

    const dbFail = simulateFailure(starter, 'node-db')
    expect(dbFail.nodes.find((n) => n.nodeId === 'node-api')?.state).toBe(
      'degraded',
    )
  })

  it('round-trips each catalog starter through persistence with Active Starter meta', () => {
    for (const def of STARTERS) {
      const starter = def.create()
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

      saveDiagram(storage, starter)
      saveMeta(storage, { activeStarter: def.id })

      expect(memory.has(STORAGE_KEY)).toBe(true)
      expect(memory.has(META_KEY)).toBe(true)

      const restored = loadDiagram(storage)!
      const meta = loadMeta(storage)
      expect(parseDiagram(serializeDiagram(restored))).toEqual(starter)
      expect(meta.activeStarter).toBe(def.id)
      expect(
        healthCheck(restored, { activeStarter: meta.activeStarter }),
      ).toEqual([])
    }
  })
})
