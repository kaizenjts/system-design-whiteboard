import { describe, expect, it } from 'vitest'
import { defaultCapacity, formatCapacity } from './capacity'

describe('defaultCapacity', () => {
  it('returns PRD default capacities in req/s', () => {
    expect(defaultCapacity('cdn_dns')).toBe(50_000)
    expect(defaultCapacity('load_balancer')).toBe(20_000)
    expect(defaultCapacity('api')).toBe(5_000)
    expect(defaultCapacity('cache')).toBe(20_000)
    expect(defaultCapacity('database')).toBe(2_000)
    expect(defaultCapacity('queue')).toBe(10_000)
  })

  it('returns undefined for Client (Load source, no Capacity check)', () => {
    expect(defaultCapacity('client')).toBeUndefined()
  })
})

describe('formatCapacity', () => {
  it('formats whole thousands as k', () => {
    expect(formatCapacity(2_000)).toBe('2k')
    expect(formatCapacity(50_000)).toBe('50k')
  })

  it('keeps small values as plain numbers', () => {
    expect(formatCapacity(80)).toBe('80')
  })
})
