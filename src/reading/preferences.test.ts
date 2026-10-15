import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  defaultReadingPreferences,
  loadReadingPreferences,
  normalizeReadingPreferences,
  saveReadingPreferences,
} from './preferences'

afterEach(() => vi.unstubAllGlobals())
describe('reading preferences', () => {
  it('normalizes unsafe values and clamps reading pace and pauses', () => {
    expect(
      normalizeReadingPreferences({ largeText: 'yes', autoDelay: 0, readingSpeed: 10000 }),
    ).toEqual({ ...defaultReadingPreferences, autoDelay: 0.5, readingSpeed: 300 })
    expect(normalizeReadingPreferences({ autoDelay: NaN, readingSpeed: Infinity })).toEqual(
      defaultReadingPreferences,
    )
  })
  it('persists reading settings without storing an active autoplay session', () => {
    let stored: string | null = null
    vi.stubGlobal('localStorage', {
      getItem: () => stored,
      setItem: (_key: string, value: string) => {
        stored = value
      },
    })
    const preferences = { largeText: true, autoDelay: 2, readingSpeed: 160 }
    saveReadingPreferences(preferences)
    expect(loadReadingPreferences()).toEqual(preferences)
    expect(stored).not.toContain('enabled')
  })
  it('survives damaged or blocked storage', () => {
    vi.stubGlobal('localStorage', {
      getItem: () => '{bad',
      setItem: () => {
        throw new Error('blocked')
      },
    })
    expect(loadReadingPreferences()).toEqual(defaultReadingPreferences)
    expect(() => saveReadingPreferences(defaultReadingPreferences)).not.toThrow()
  })
})
