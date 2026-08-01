import { useEffect, useRef } from 'react'
import { useAppStore } from '../app/store'
import { saveDiagram } from './diagramStorage'
import { saveMeta } from './sessionMeta'

const DEBOUNCE_MS = 300

/** Debounced auto-save of the domain diagram + starter meta to localStorage. */
export function useDiagramAutoSave() {
  const diagram = useAppStore((s) => s.diagram)
  const activeStarter = useAppStore((s) => s.activeStarter)
  const ready = useRef(false)

  useEffect(() => {
    // Skip the first run so hydrate does not immediately rewrite storage.
    if (!ready.current) {
      ready.current = true
      return
    }

    const handle = window.setTimeout(() => {
      try {
        saveDiagram(window.localStorage, diagram)
        saveMeta(window.localStorage, { activeStarter })
      } catch {
        // Quota / private mode — ignore for MVP.
      }
    }, DEBOUNCE_MS)

    return () => window.clearTimeout(handle)
  }, [diagram, activeStarter])
}
