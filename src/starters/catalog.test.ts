import { describe, expect, it } from 'vitest'
import { STARTERS, starterById } from './catalog'

describe('starter catalog', () => {
  it('lists URL Shortener and Notification Service for the picker', () => {
    expect(STARTERS.map((s) => s.id)).toEqual([
      'url_shortener',
      'notification',
    ])
    expect(STARTERS.map((s) => s.label)).toEqual([
      'URL Shortener',
      'Notification Service',
    ])
  })

  it('builds diagrams keyed by Active Starter id', () => {
    const url = starterById('url_shortener').create()
    expect(url.nodes.some((n) => n.type === 'cdn_dns')).toBe(true)

    const notification = starterById('notification').create()
    expect(notification.nodes.some((n) => n.type === 'cdn_dns')).toBe(false)
    expect(notification.nodes.some((n) => n.type === 'queue')).toBe(true)
  })
})
