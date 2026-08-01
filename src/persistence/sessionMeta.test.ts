import { describe, expect, it } from 'vitest'
import { META_KEY, loadMeta, saveMeta } from './sessionMeta'

function memoryStorage() {
  const memory = new Map<string, string>()
  return {
    getItem: (key: string) => memory.get(key) ?? null,
    setItem: (key: string, value: string) => {
      memory.set(key, value)
    },
    removeItem: (key: string) => {
      memory.delete(key)
    },
    memory,
  }
}

describe('sessionMeta Active Starter', () => {
  it('defaults to null Active Starter when meta is missing', () => {
    expect(loadMeta(memoryStorage())).toEqual({ activeStarter: null })
  })

  it('round-trips url_shortener and notification Active Starter', () => {
    const storage = memoryStorage()
    saveMeta(storage, { activeStarter: 'url_shortener' })
    expect(loadMeta(storage)).toEqual({ activeStarter: 'url_shortener' })

    saveMeta(storage, { activeStarter: 'notification' })
    expect(loadMeta(storage)).toEqual({ activeStarter: 'notification' })

    saveMeta(storage, { activeStarter: null })
    expect(loadMeta(storage)).toEqual({ activeStarter: null })
  })

  it('silently maps legacy isUrlShortenerStarter boolean to Active Starter', () => {
    const storage = memoryStorage()
    storage.setItem(META_KEY, JSON.stringify({ isUrlShortenerStarter: true }))
    expect(loadMeta(storage)).toEqual({ activeStarter: 'url_shortener' })

    storage.setItem(META_KEY, JSON.stringify({ isUrlShortenerStarter: false }))
    expect(loadMeta(storage)).toEqual({ activeStarter: null })
  })

  it('prefers activeStarter over legacy boolean when both are present', () => {
    const storage = memoryStorage()
    storage.setItem(
      META_KEY,
      JSON.stringify({
        activeStarter: 'notification',
        isUrlShortenerStarter: true,
      }),
    )
    expect(loadMeta(storage)).toEqual({ activeStarter: 'notification' })
  })

  it('returns null Active Starter for invalid JSON', () => {
    const storage = memoryStorage()
    storage.setItem(META_KEY, '{')
    expect(loadMeta(storage)).toEqual({ activeStarter: null })
  })
})
