import { describe, expect, it } from 'vitest'
import type { DiagramDocument, NodeType } from '../../domain/types'
import { createNotificationStarter } from '../../starters/notification'
import { createUrlShortenerStarter } from '../../starters/urlShortener'
import { healthCheck } from './healthCheck'

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

function idsOf(findings: { id: string }[]) {
  return findings.map((f) => f.id).sort()
}

describe('healthCheck', () => {
  it('returns no findings on the official URL Shortener starter', () => {
    const findings = healthCheck(createUrlShortenerStarter(), {
      activeStarter: 'url_shortener',
    })
    expect(findings).toEqual([])
  })

  it('returns no findings on the Notification starter under always-on rules', () => {
    const findings = healthCheck(createNotificationStarter(), {
      activeStarter: 'notification',
    })
    expect(findings).toEqual([])
  })

  it('never runs HC05/HC06 on a blank canvas or non–URL-Shortener Active Starter', () => {
    const blank: DiagramDocument = { version: 1, nodes: [], edges: [] }
    expect(idsOf(healthCheck(blank, { activeStarter: null }))).not.toContain(
      'HC05',
    )
    expect(idsOf(healthCheck(blank, { activeStarter: null }))).not.toContain(
      'HC06',
    )

    const notification = createNotificationStarter()
    expect(
      idsOf(healthCheck(notification, { activeStarter: 'notification' })),
    ).not.toContain('HC05')
    expect(
      idsOf(healthCheck(notification, { activeStarter: 'notification' })),
    ).not.toContain('HC06')
  })

  it('surfaces High findings on a broken Client→API→DB diagram', () => {
    const broken: DiagramDocument = {
      version: 1,
      nodes: [
        node('c', 'client'),
        node('a', 'api'),
        node('d', 'database'),
      ],
      edges: [edge('e1', 'c', 'a'), edge('e2', 'a', 'd')],
    }
    const findings = healthCheck(broken, { activeStarter: null })
    expect(idsOf(findings)).toContain('HC01')
    expect(idsOf(findings)).toContain('HC02')
  })

  it('flags HC03 when Cache has no durable Database behind it', () => {
    const doc: DiagramDocument = {
      version: 1,
      nodes: [node('c', 'client'), node('cache', 'cache')],
      edges: [edge('e1', 'c', 'cache')],
    }
    expect(idsOf(healthCheck(doc, { activeStarter: null }))).toContain('HC03')
  })

  it('flags HC04 when Client has no path to API or store', () => {
    const doc: DiagramDocument = {
      version: 1,
      nodes: [node('c', 'client'), node('q', 'queue')],
      edges: [],
    }
    expect(idsOf(healthCheck(doc, { activeStarter: null }))).toContain('HC04')
  })

  it('flags HC05/HC06 only for url_shortener Active Starter when CDN or Queue link is removed', () => {
    const starter = createUrlShortenerStarter()
    const withoutCdn: DiagramDocument = {
      ...starter,
      nodes: starter.nodes.filter((n) => n.type !== 'cdn_dns'),
      edges: starter.edges
        .filter((e) => e.source !== 'node-cdn' && e.target !== 'node-cdn')
        .concat([{ id: 'e-bypass', source: 'node-client', target: 'node-lb' }]),
    }
    const withoutQueueLink: DiagramDocument = {
      ...starter,
      edges: starter.edges.filter(
        (e) => !(e.source === 'node-api' && e.target === 'node-queue'),
      ),
    }

    expect(
      idsOf(healthCheck(withoutCdn, { activeStarter: 'url_shortener' })),
    ).toContain('HC05')
    expect(
      idsOf(healthCheck(withoutQueueLink, { activeStarter: 'url_shortener' })),
    ).toContain('HC06')
    expect(
      idsOf(healthCheck(withoutCdn, { activeStarter: null })),
    ).not.toContain('HC05')
    expect(
      idsOf(healthCheck(withoutCdn, { activeStarter: 'notification' })),
    ).not.toContain('HC05')
  })

  it('flags HC07 when Queue sits on the Client→API user path', () => {
    const doc: DiagramDocument = {
      version: 1,
      nodes: [
        node('c', 'client'),
        node('q', 'queue'),
        node('a', 'api'),
      ],
      edges: [edge('e1', 'c', 'q'), edge('e2', 'q', 'a')],
    }
    expect(idsOf(healthCheck(doc, { activeStarter: null }))).toContain('HC07')
  })
})
