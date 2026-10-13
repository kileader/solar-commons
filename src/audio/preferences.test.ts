import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  defaultAudioPreferences,
  loadAudioPreferences,
  normalizeAudioPreferences,
  saveAudioPreferences,
} from './preferences'

afterEach(() => vi.unstubAllGlobals())

describe('audio preferences', () => {
  it('clamps valid levels and ignores malformed fields', () => {
    expect(
      normalizeAudioPreferences({
        master: 3,
        music: -1,
        effects: NaN,
        voice: 'loud',
        muted: 'true',
        voiceEnabled: false,
      }),
    ).toEqual({ ...defaultAudioPreferences, master: 1, music: 0, voiceEnabled: false })
  })
  it('recovers from corrupt or inaccessible storage', () => {
    vi.stubGlobal('localStorage', {
      getItem: () => '{bad json',
      setItem: () => {
        throw new Error('blocked')
      },
    })
    expect(loadAudioPreferences()).toEqual(defaultAudioPreferences)
    expect(() => saveAudioPreferences(defaultAudioPreferences)).not.toThrow()
  })
  it('round-trips user volumes, mute, and chosen local voice identifier', () => {
    let stored = ''
    vi.stubGlobal('localStorage', {
      getItem: () => stored,
      setItem: (_key: string, value: string) => {
        stored = value
      },
    })
    const preferences = {
      ...defaultAudioPreferences,
      music: 0.2,
      effects: 0.4,
      voiceURI: 'local-zira',
      muted: true,
    }
    saveAudioPreferences(preferences)
    expect(loadAudioPreferences()).toEqual(preferences)
  })
})
