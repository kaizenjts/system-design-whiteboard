import { describe, expect, it } from 'vitest'
import {
  STARTER_PICKER,
  STARTERS,
  starterById,
  starterPickerByKey,
} from './catalog'
import { createUrlShortenerBrokenStarter } from './urlShortener'

describe('starter catalog', () => {
  it('lists URL Shortener and Notification Service as canonical starters', () => {
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

  it('exposes a find-the-gaps practice entry that keeps Active Starter url_shortener', () => {
    const gaps = starterPickerByKey('url_shortener_gaps')
    expect(gaps.activeStarter).toBe('url_shortener')
    expect(gaps.openHealth).toBe(true)
    expect(gaps.create()).toEqual(createUrlShortenerBrokenStarter())

    expect(STARTER_PICKER.map((e) => e.key)).toEqual([
      'url_shortener',
      'url_shortener_gaps',
      'notification',
    ])
  })
})
