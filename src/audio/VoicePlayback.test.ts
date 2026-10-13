import { describe, expect, it, vi } from 'vitest'
import {
  chooseLocalVoice,
  localEnglishVoices,
  VoicePlayback,
  type SpeechService,
} from './VoicePlayback'
import { defaultAudioPreferences } from './preferences'
import type { DialogueLine } from '../content/harbor'

const voice = (name: string, local = true, lang = 'en-US') =>
  ({ name, voiceURI: name, localService: local, lang, default: false }) as SpeechSynthesisVoice
const voices = [
  voice('Microsoft David'),
  voice('Microsoft Zira'),
  voice('Cloud Aria', false),
  voice('Local French', true, 'fr-FR'),
]
const lines: DialogueLine[] = [
  { id: 'a', speaker: 'Kite', text: 'First line.' },
  { id: 'b', speaker: 'Mara', text: 'Second line.' },
]

function setup(available = voices) {
  const spoken: SpeechSynthesisUtterance[] = []
  const service: SpeechService = {
    getVoices: () => available,
    cancel: vi.fn(),
    speak: (utterance) => {
      spoken.push(utterance)
    },
  }
  const state = vi.fn()
  const player = new VoicePlayback(service, (text) => ({ text }) as SpeechSynthesisUtterance, state)
  return { spoken, service, state, player }
}

describe('local dialogue playback', () => {
  it('excludes remote and non-English voices, even if explicitly selected', () => {
    expect(localEnglishVoices(voices).map((v) => v.name)).toEqual([
      'Microsoft David',
      'Microsoft Zira',
    ])
    expect(chooseLocalVoice(voices, 'Kite', 'Cloud Aria')?.name).toBe('Microsoft David')
    expect(chooseLocalVoice(voices, 'Mara', '')?.name).toBe('Microsoft Zira')
    expect(chooseLocalVoice([voice('Remote', false)], 'Kite', '')).toBeNull()
  })
  it('plays one line at a time and applies master × voice volume', () => {
    const { player, spoken, state } = setup()
    player.say(lines, { ...defaultAudioPreferences, master: 0.5, voice: 0.8 })
    expect(spoken).toHaveLength(1)
    expect(spoken[0].volume).toBeCloseTo(0.4)
    expect(spoken[0].voice?.name).toBe('Microsoft David')
    spoken[0].onstart?.({} as SpeechSynthesisEvent)
    expect(state).toHaveBeenLastCalledWith('speaking')
    spoken[0].onend?.({} as SpeechSynthesisEvent)
    expect(spoken).toHaveLength(2)
    expect(spoken[1].voice?.name).toBe('Microsoft Zira')
    spoken[1].onend?.({} as SpeechSynthesisEvent)
    expect(state).toHaveBeenLastCalledWith('idle')
  })
  it('prevents late completion from resurrecting canceled scene dialogue', () => {
    const { player, spoken } = setup()
    player.say(lines, defaultAudioPreferences)
    const oldEnd = spoken[0].onend!
    player.say([{ id: 'new', speaker: 'Mara', text: 'New scene.' }], defaultAudioPreferences)
    oldEnd.call(spoken[0], {} as SpeechSynthesisEvent)
    expect(spoken.map((line) => line.text)).toEqual(['First line.', 'New scene.'])
    const newEnd = spoken[1].onend!
    player.stop()
    newEnd.call(spoken[1], {} as SpeechSynthesisEvent)
    expect(spoken).toHaveLength(2)
  })
  it('never calls speech with muted, disabled, zero-volume, or unavailable voices', () => {
    const { player, spoken } = setup()
    for (const patch of [{ muted: true }, { voiceEnabled: false }, { master: 0 }, { voice: 0 }])
      player.say(lines, { ...defaultAudioPreferences, ...patch })
    expect(spoken).toHaveLength(0)
    const remote = setup([voice('Remote only', false)])
    remote.player.say(lines, defaultAudioPreferences)
    expect(remote.spoken).toHaveLength(0)
    expect(remote.state).toHaveBeenLastCalledWith('unavailable')
  })
  it('clears speaking state after a playback failure so music can recover', () => {
    const { player, spoken, state } = setup()
    player.say(lines, defaultAudioPreferences)
    spoken[0].onerror?.({ error: 'audio-busy' } as SpeechSynthesisErrorEvent)
    expect(state).toHaveBeenLastCalledWith('error')
    expect(spoken).toHaveLength(1)
  })
})
