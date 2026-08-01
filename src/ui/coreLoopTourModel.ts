import type { ActiveStarter, Mode } from '../domain/types'

/** Persists after Skip / Finish so returning learners are not re-prompted. */
export const TOUR_STORAGE_KEY = 'sds.coreLoopTour.dismissed'
/** Pre-tour tip bar — treat as already dismissed for existing sessions. */
export const LEGACY_TIP_STORAGE_KEY = 'sds.coreLoopTip.dismissed'

export type TourStepId = 'starter' | 'health' | 'traffic' | 'failure'

export type TourSnapshot = {
  mode: Mode
  activeStarter: ActiveStarter
  nodeCount: number
  failedNodeId: string | null
}

export type TourStep = {
  id: TourStepId
  title: string
  body: string
  /** Prefer this `data-tour` when present; otherwise fall back. */
  target: (snap: TourSnapshot) => string
  isComplete: (snap: TourSnapshot) => boolean
}

export const TOUR_STEPS: readonly TourStep[] = [
  {
    id: 'starter',
    title: 'Pick a starter',
    body: 'Load URL Shortener, Notification Service, or “find the gaps” for a ready diagram — or draw from the palette.',
    target: (snap) => (snap.nodeCount === 0 ? 'empty-canvas' : 'starter'),
    isComplete: (snap) => snap.activeStarter != null || snap.nodeCount > 0,
  },
  {
    id: 'health',
    title: 'Check Health',
    body: 'Switch to Health to see Findings — gaps like missing cache or load balancer.',
    target: (snap) => (snap.mode === 'health' ? 'findings' : 'mode-health'),
    isComplete: (snap) => snap.mode === 'health',
  },
  {
    id: 'traffic',
    title: 'Stress with Traffic',
    body: 'Open Traffic, try 1.5k then 3k Load — watch Warning vs Bottleneck on the Database.',
    target: (snap) =>
      snap.mode === 'traffic' ? 'traffic-presets' : 'mode-traffic',
    isComplete: (snap) => snap.mode === 'traffic',
  },
  {
    id: 'failure',
    title: 'Simulate Failure',
    body: 'Open Failure and Fail Database (or Queue) to see the blast radius on dependents.',
    target: (snap) =>
      snap.mode === 'failure' ? 'fail-database' : 'mode-failure',
    isComplete: (snap) => snap.mode === 'failure' || snap.failedNodeId != null,
  },
] as const

export function readTourDismissed(storage: Storage): boolean {
  try {
    if (storage.getItem(TOUR_STORAGE_KEY) === '1') return true
    if (storage.getItem(LEGACY_TIP_STORAGE_KEY) === '1') return true
    return false
  } catch {
    return false
  }
}

export function writeTourDismissed(storage: Storage): void {
  try {
    storage.setItem(TOUR_STORAGE_KEY, '1')
  } catch {
    /* ignore quota / private mode */
  }
}

export function clampStepIndex(index: number): number {
  if (index < 0) return 0
  if (index >= TOUR_STEPS.length) return TOUR_STEPS.length - 1
  return index
}
