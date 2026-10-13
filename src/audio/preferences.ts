export interface AudioPreferences {
  master: number
  music: number
  effects: number
  voice: number
  muted: boolean
  voiceEnabled: boolean
  voiceURI: string
}

export const defaultAudioPreferences: AudioPreferences = {
  master: 0.75,
  music: 0.5,
  effects: 0.65,
  voice: 1,
  muted: false,
  voiceEnabled: true,
  voiceURI: '',
}
export const audioStorageKey = 'solar-commons.audio.v1'

export function normalizeAudioPreferences(value: unknown): AudioPreferences {
  const result = { ...defaultAudioPreferences }
  if (!value || typeof value !== 'object') return result
  const source = value as Record<string, unknown>
  for (const key of ['master', 'music', 'effects', 'voice'] as const) {
    const level = source[key]
    if (typeof level === 'number' && Number.isFinite(level))
      result[key] = Math.max(0, Math.min(1, level))
  }
  for (const key of ['muted', 'voiceEnabled'] as const) {
    if (typeof source[key] === 'boolean') result[key] = source[key]
  }
  if (typeof source.voiceURI === 'string' && source.voiceURI.length < 400)
    result.voiceURI = source.voiceURI
  return result
}

export function loadAudioPreferences(): AudioPreferences {
  try {
    return normalizeAudioPreferences(JSON.parse(localStorage.getItem(audioStorageKey) ?? 'null'))
  } catch {
    return { ...defaultAudioPreferences }
  }
}

export function saveAudioPreferences(preferences: AudioPreferences) {
  try {
    localStorage.setItem(audioStorageKey, JSON.stringify(preferences))
  } catch {
    /* Private browsing or a full store should never interrupt the story. */
  }
}
