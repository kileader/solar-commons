export interface ReadingPreferences {
  largeText: boolean
  autoDelay: number
  readingSpeed: number
}

export const defaultReadingPreferences: ReadingPreferences = {
  largeText: false,
  autoDelay: 1,
  readingSpeed: 200,
}
export const readingStorageKey = 'solar-commons.reading.v1'

export function normalizeReadingPreferences(value: unknown): ReadingPreferences {
  const result = { ...defaultReadingPreferences }
  if (!value || typeof value !== 'object') return result
  const source = value as Record<string, unknown>
  if (typeof source.largeText === 'boolean') result.largeText = source.largeText
  for (const [key, min, max] of [
    ['autoDelay', 0.5, 5],
    ['readingSpeed', 120, 300],
  ] as const) {
    if (typeof source[key] === 'number' && Number.isFinite(source[key]))
      result[key] = Math.max(min, Math.min(max, source[key]))
  }
  return result
}

export function loadReadingPreferences() {
  try {
    return normalizeReadingPreferences(
      JSON.parse(localStorage.getItem(readingStorageKey) ?? 'null'),
    )
  } catch {
    return { ...defaultReadingPreferences }
  }
}

export function saveReadingPreferences(preferences: ReadingPreferences) {
  try {
    localStorage.setItem(readingStorageKey, JSON.stringify(preferences))
  } catch {
    /* Reading must work when storage is unavailable. */
  }
}
