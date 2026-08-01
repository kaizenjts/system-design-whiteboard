import { describe, expect, it } from 'vitest'
import {
  clampStepIndex,
  LEGACY_TIP_STORAGE_KEY,
  readTourDismissed,
  TOUR_STEPS,
  TOUR_STORAGE_KEY,
  type TourSnapshot,
  writeTourDismissed,
} from './coreLoopTourModel'

function memoryStorage(initial: Record<string, string> = {}): Storage {
  const map = new Map(Object.entries(initial))
  return {
    get length() {
      return map.size
    },
    clear: () => map.clear(),
    getItem: (key) => map.get(key) ?? null,
    key: (i) => [...map.keys()][i] ?? null,
    removeItem: (key) => {
      map.delete(key)
    },
    setItem: (key, value) => {
      map.set(key, String(value))
    },
  }
}

function snap(partial: Partial<TourSnapshot> = {}): TourSnapshot {
  return {
    mode: 'design',
    activeStarter: null,
    nodeCount: 0,
    failedNodeId: null,
    ...partial,
  }
}

describe('coreLoopTour', () => {
  it('has four core-loop steps', () => {
    expect(TOUR_STEPS.map((s) => s.id)).toEqual([
      'starter',
      'health',
      'traffic',
      'failure',
    ])
  })

  it('reads dismissed from tour key or legacy tip key', () => {
    expect(readTourDismissed(memoryStorage())).toBe(false)
    expect(
      readTourDismissed(memoryStorage({ [TOUR_STORAGE_KEY]: '1' })),
    ).toBe(true)
    expect(
      readTourDismissed(memoryStorage({ [LEGACY_TIP_STORAGE_KEY]: '1' })),
    ).toBe(true)
  })

  it('writes tour dismissed flag', () => {
    const storage = memoryStorage()
    writeTourDismissed(storage)
    expect(storage.getItem(TOUR_STORAGE_KEY)).toBe('1')
  })

  it('clamps step index', () => {
    expect(clampStepIndex(-1)).toBe(0)
    expect(clampStepIndex(0)).toBe(0)
    expect(clampStepIndex(3)).toBe(3)
    expect(clampStepIndex(99)).toBe(3)
  })

  it('marks starter complete when diagram or Active Starter exists', () => {
    const step = TOUR_STEPS[0]
    expect(step.isComplete(snap())).toBe(false)
    expect(step.isComplete(snap({ nodeCount: 2 }))).toBe(true)
    expect(step.isComplete(snap({ activeStarter: 'url_shortener' }))).toBe(
      true,
    )
  })

  it('targets empty canvas then Load starter', () => {
    const step = TOUR_STEPS[0]
    expect(step.target(snap())).toBe('empty-canvas')
    expect(step.target(snap({ nodeCount: 3 }))).toBe('starter')
  })

  it('completes mode steps when the matching Mode is active', () => {
    expect(TOUR_STEPS[1].isComplete(snap({ mode: 'health' }))).toBe(true)
    expect(TOUR_STEPS[2].isComplete(snap({ mode: 'traffic' }))).toBe(true)
    expect(TOUR_STEPS[3].isComplete(snap({ mode: 'failure' }))).toBe(true)
    expect(
      TOUR_STEPS[3].isComplete(snap({ failedNodeId: 'db-1' })),
    ).toBe(true)
  })

  it('retargets into panel controls once inside the Mode', () => {
    expect(TOUR_STEPS[1].target(snap({ mode: 'health' }))).toBe('findings')
    expect(TOUR_STEPS[2].target(snap({ mode: 'traffic' }))).toBe(
      'traffic-presets',
    )
    expect(TOUR_STEPS[3].target(snap({ mode: 'failure' }))).toBe(
      'fail-database',
    )
  })
})
