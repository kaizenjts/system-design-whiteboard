import { useAppStore } from '../app/store'
import { MODES } from '../domain/types'
import { STARTERS } from '../starters/catalog'

/** Compact header badges: Active Starter + current Mode lens. */
export function SessionContext() {
  const mode = useAppStore((s) => s.mode)
  const activeStarter = useAppStore((s) => s.activeStarter)

  const starterLabel =
    STARTERS.find((s) => s.id === activeStarter)?.label ?? 'Freeform'
  const modeMeta = MODES.find((m) => m.id === mode)

  return (
    <div className="session-context" aria-label="Session context">
      <span className="context-badge" title="Active Starter">
        {starterLabel}
      </span>
      {modeMeta ? (
        <span
          className="context-badge context-badge-mode"
          title={modeMeta.hint}
        >
          {modeMeta.label}
        </span>
      ) : null}
    </div>
  )
}
