import type { ActiveStarter, DiagramDocument } from '../domain/types'
import { createNotificationStarter } from './notification'
import { createUrlShortenerStarter } from './urlShortener'

export type StarterId = Exclude<ActiveStarter, null>

export type StarterDefinition = {
  id: StarterId
  label: string
  create: () => DiagramDocument
}

/** Ordered list for the Load-starter picker. */
export const STARTERS: readonly StarterDefinition[] = [
  {
    id: 'url_shortener',
    label: 'URL Shortener',
    create: createUrlShortenerStarter,
  },
  {
    id: 'notification',
    label: 'Notification Service',
    create: createNotificationStarter,
  },
]

export function starterById(id: StarterId): StarterDefinition {
  const found = STARTERS.find((s) => s.id === id)
  if (!found) throw new Error(`Unknown starter: ${id}`)
  return found
}
