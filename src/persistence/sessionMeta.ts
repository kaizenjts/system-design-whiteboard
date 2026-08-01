import type { ActiveStarter } from '../domain/types'

export const META_KEY = 'sds.meta.v1'

export type { ActiveStarter }

export type SessionMeta = {
  activeStarter: ActiveStarter
}

export type MetaStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

const ACTIVE_STARTERS = new Set<Exclude<ActiveStarter, null>>([
  'url_shortener',
  'notification',
])

export function saveMeta(storage: MetaStorage, meta: SessionMeta): void {
  storage.setItem(META_KEY, JSON.stringify({ activeStarter: meta.activeStarter }))
}

export function loadMeta(storage: MetaStorage): SessionMeta {
  const raw = storage.getItem(META_KEY)
  if (!raw) return { activeStarter: null }
  try {
    const parsed = JSON.parse(raw) as {
      activeStarter?: unknown
      isUrlShortenerStarter?: unknown
    }
    return { activeStarter: resolveActiveStarter(parsed) }
  } catch {
    return { activeStarter: null }
  }
}

function resolveActiveStarter(parsed: {
  activeStarter?: unknown
  isUrlShortenerStarter?: unknown
}): ActiveStarter {
  if (
    typeof parsed.activeStarter === 'string' &&
    ACTIVE_STARTERS.has(parsed.activeStarter as Exclude<ActiveStarter, null>)
  ) {
    return parsed.activeStarter as Exclude<ActiveStarter, null>
  }
  if (parsed.activeStarter === null) return null
  // Legacy sds.meta.v1 boolean — silent map
  if (parsed.isUrlShortenerStarter === true) return 'url_shortener'
  return null
}
