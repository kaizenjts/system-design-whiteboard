import { useState } from 'react'

const STORAGE_KEY = 'sds.coreLoopTip.dismissed'

function readDismissed(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return window.localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

/** Dismissable coachmark for the ~60s core loop — kept out of the brand block. */
export function CoreLoopTip() {
  const [dismissed, setDismissed] = useState(readDismissed)

  if (dismissed) return null

  function dismiss() {
    setDismissed(true)
    try {
      window.localStorage.setItem(STORAGE_KEY, '1')
    } catch {
      /* ignore quota / private mode */
    }
  }

  return (
    <div className="core-loop-tip" role="note">
      <p>
        <span className="core-loop-tip-label">Core loop</span>
        1 Pick starter · 2 Health · 3 Traffic presets · 4 Fail Database / Queue
      </p>
      <button type="button" className="core-loop-tip-dismiss" onClick={dismiss}>
        Dismiss
      </button>
    </div>
  )
}
