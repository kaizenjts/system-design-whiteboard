import type { ActiveStarter, DiagramDocument } from '../domain/types'
import { createNotificationStarter } from './notification'
import {
  createUrlShortenerBrokenStarter,
  createUrlShortenerStarter,
} from './urlShortener'

export type StarterId = Exclude<ActiveStarter, null>

export type StarterDefinition = {
  id: StarterId
  label: string
  create: () => DiagramDocument
}

/** Canonical clean Starter Templates (Active Starter ids). */
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

export type StarterPickerEntry = {
  key: string
  label: string
  /** Short teaching line under the label in the picker. */
  hint?: string
  activeStarter: StarterId
  create: () => DiagramDocument
  /**
   * When true, open Health after load so Findings punch immediately
   * (practice / gaps variants).
   */
  openHealth?: boolean
  /** Show on the empty-canvas CTA row. */
  emptyCanvas?: boolean
  /** Emphasize as the primary empty-canvas button. */
  emptyCanvasPrimary?: boolean
  /** Shorter label for the empty-canvas button row. */
  emptyCanvasLabel?: string
}

/** Load-starter menu + empty-canvas CTAs (includes practice variants). */
export const STARTER_PICKER: readonly StarterPickerEntry[] = [
  {
    key: 'url_shortener',
    label: 'URL Shortener',
    activeStarter: 'url_shortener',
    create: createUrlShortenerStarter,
    emptyCanvas: true,
    emptyCanvasPrimary: true,
  },
  {
    key: 'url_shortener_gaps',
    label: 'URL Shortener — find the gaps',
    hint: 'Missing cache on the read path — open Health to see Findings',
    activeStarter: 'url_shortener',
    create: createUrlShortenerBrokenStarter,
    openHealth: true,
    emptyCanvas: true,
    emptyCanvasLabel: 'Find the gaps',
  },
  {
    key: 'notification',
    label: 'Notification Service',
    activeStarter: 'notification',
    create: createNotificationStarter,
    emptyCanvas: true,
  },
]

export function starterById(id: StarterId): StarterDefinition {
  const found = STARTERS.find((s) => s.id === id)
  if (!found) throw new Error(`Unknown starter: ${id}`)
  return found
}

export function starterPickerByKey(key: string): StarterPickerEntry {
  const found = STARTER_PICKER.find((s) => s.key === key)
  if (!found) throw new Error(`Unknown starter picker entry: ${key}`)
  return found
}
