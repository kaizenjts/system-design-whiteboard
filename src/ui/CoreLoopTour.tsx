import { useEffect, useState } from 'react'
import { useAppStore } from '../app/store'
import {
  clampStepIndex,
  readTourDismissed,
  TOUR_STEPS,
  type TourSnapshot,
  writeTourDismissed,
} from './coreLoopTourModel'

const AUTO_ADVANCE_MS = 450

function readDismissed(): boolean {
  if (typeof window === 'undefined') return false
  return readTourDismissed(window.localStorage)
}

/** First-visit 4-step coachmarks for the ~60s core loop. */
export function CoreLoopTour() {
  const [dismissed, setDismissed] = useState(readDismissed)
  const [stepIndex, setStepIndex] = useState(0)

  const mode = useAppStore((s) => s.mode)
  const activeStarter = useAppStore((s) => s.activeStarter)
  const nodeCount = useAppStore((s) => s.diagram.nodes.length)
  const failedNodeId = useAppStore((s) => s.failedNodeId)

  const snap: TourSnapshot = {
    mode,
    activeStarter,
    nodeCount,
    failedNodeId,
  }

  const step = TOUR_STEPS[clampStepIndex(stepIndex)]
  const isLast = stepIndex >= TOUR_STEPS.length - 1
  const stepDone = step.isComplete(snap)
  const targetKey = step.target(snap)

  useEffect(() => {
    if (dismissed) return
    const selector = `[data-tour="${targetKey}"]`
    const el = document.querySelector(selector)
    if (!(el instanceof HTMLElement)) return

    el.classList.add('tour-spotlight')
    el.setAttribute('data-tour-active', 'true')
    return () => {
      el.classList.remove('tour-spotlight')
      el.removeAttribute('data-tour-active')
    }
  }, [dismissed, targetKey, mode])

  useEffect(() => {
    if (dismissed || !stepDone) return
    if (isLast) return
    const t = window.setTimeout(() => {
      setStepIndex((i) => clampStepIndex(i + 1))
    }, AUTO_ADVANCE_MS)
    return () => window.clearTimeout(t)
  }, [dismissed, stepDone, isLast, stepIndex])

  if (dismissed) return null

  function dismiss() {
    setDismissed(true)
    writeTourDismissed(window.localStorage)
  }

  function goNext() {
    if (isLast) {
      dismiss()
      return
    }
    setStepIndex((i) => clampStepIndex(i + 1))
  }

  function goBack() {
    setStepIndex((i) => clampStepIndex(i - 1))
  }

  return (
    <div
      className="core-loop-tour"
      role="region"
      aria-label="Core loop tour"
      aria-live="polite"
    >
      <div className="core-loop-tour-main">
        <p className="core-loop-tour-meta">
          <span className="core-loop-tip-label">Core loop</span>
          <span className="core-loop-tour-progress">
            {stepIndex + 1} / {TOUR_STEPS.length}
          </span>
        </p>
        <p className="core-loop-tour-copy">
          <strong className="core-loop-tour-title">{step.title}</strong>
          {step.body}
        </p>
        <ol className="core-loop-tour-dots" aria-hidden="true">
          {TOUR_STEPS.map((s, i) => (
            <li
              key={s.id}
              className={
                i === stepIndex
                  ? 'core-loop-tour-dot active'
                  : i < stepIndex
                    ? 'core-loop-tour-dot done'
                    : 'core-loop-tour-dot'
              }
            />
          ))}
        </ol>
      </div>
      <div className="core-loop-tour-actions">
        <button
          type="button"
          className="core-loop-tip-dismiss"
          onClick={dismiss}
        >
          Skip tour
        </button>
        <button
          type="button"
          className="action-btn action-btn-quiet"
          disabled={stepIndex === 0}
          onClick={goBack}
        >
          Back
        </button>
        <button
          type="button"
          className="action-btn action-btn-primary"
          onClick={goNext}
        >
          {isLast ? 'Finish' : stepDone ? 'Continue' : 'Next'}
        </button>
      </div>
    </div>
  )
}
