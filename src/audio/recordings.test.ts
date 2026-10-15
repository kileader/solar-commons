import { describe, expect, it, vi } from 'vitest'
import { VoicePlayback } from './VoicePlayback'
import { defaultAudioPreferences } from './preferences'
import { dialogueRecordings } from './dialogueAssets'
import { clues, conclusionChoices, entryChoices, introLines } from '../content/harbor'
import { openingShots } from '../content/opening'

function setup(blocked = false) {
  const clips: HTMLAudioElement[] = []
  const state = vi.fn()
  const speak = vi.fn()
  const player = new VoicePlayback(
    { getVoices: () => [], speak, cancel: vi.fn() },
    vi.fn(),
    state,
    {
      find: (line) => (line.id === 'missing' ? undefined : `/${line.id}.mp3`),
      create: () => {
        const clip = {
          play: blocked
            ? vi.fn().mockRejectedValue(new Error('Blocked'))
            : vi.fn().mockResolvedValue(undefined),
          pause: vi.fn(),
          load: vi.fn(),
          removeAttribute: vi.fn(),
        } as unknown as HTMLAudioElement
        clips.push(clip)
        return clip
      },
    },
  )
  return { player, clips, state, speak }
}
const lines = introLines.slice(0, 2)

describe('supplied dialogue recordings', () => {
  it('maps all 26 source files to actual harbor or cinematic line IDs', () => {
    const expected = [
      ...introLines,
      ...entryChoices.flatMap((choice) => choice.response),
      ...clues.flatMap((clue) => clue.dialogue),
      ...conclusionChoices.flatMap((choice) => choice.ending),
    ].map((line) => line.id)
    expected.push(
      'investigation-false',
      'investigation-true',
      ...openingShots.filter((shot) => shot.caption).map((shot) => `opening-${shot.id}`),
    )
    expect(Object.keys(dialogueRecordings).sort()).toEqual(expected.sort())
    expect(expected).toHaveLength(26)
  })
  it('plays recordings without installed device voices and signals completion only after every clip', () => {
    const { player, clips, state, speak } = setup()
    player.say(lines, { ...defaultAudioPreferences, master: 0.5, voice: 0.6 })
    expect(state).toHaveBeenLastCalledWith('loading')
    expect(clips[0].volume).toBeCloseTo(0.3)
    clips[0].onplaying?.({} as Event)
    expect(state).toHaveBeenLastCalledWith('speaking')
    clips[0].onended?.({} as Event)
    expect(clips).toHaveLength(2)
    expect(state).toHaveBeenLastCalledWith('loading')
    clips[1].onended?.({} as Event)
    expect(state).toHaveBeenLastCalledWith('ended')
    expect(speak).not.toHaveBeenCalled()
  })
  it('cancels and releases old clips; late ends and errors cannot resume a skipped scene', () => {
    const { player, clips, state } = setup()
    player.say(lines, defaultAudioPreferences)
    const end = clips[0].onended!,
      fail = clips[0].onerror!
    player.say([lines[1]], defaultAudioPreferences)
    expect(clips[0].pause).toHaveBeenCalled()
    expect(clips[0].removeAttribute).toHaveBeenCalledWith('src')
    end.call(clips[0], {} as Event)
    fail.call(clips[0], 'error')
    expect(clips).toHaveLength(2)
    expect(state).toHaveBeenLastCalledWith('loading')
    player.stop()
    expect(clips[1].pause).toHaveBeenCalled()
    expect(state).toHaveBeenLastCalledWith('idle')
  })
  it('recovers to readable text on missing, broken or blocked recordings', async () => {
    const { player, clips, state } = setup()
    player.say([{ ...lines[0], id: 'missing' }], defaultAudioPreferences)
    expect(state).toHaveBeenLastCalledWith('unavailable')
    expect(clips).toHaveLength(0)
    player.say(lines, defaultAudioPreferences)
    clips[0].onerror?.('error')
    expect(state).toHaveBeenLastCalledWith('unavailable')
    const blocked = setup(true)
    blocked.player.say(lines, defaultAudioPreferences)
    await Promise.resolve()
    expect(blocked.state).toHaveBeenLastCalledWith('unavailable')
  })
  it('never creates a clip when muted, disabled or at zero volume', () => {
    const { player, clips } = setup()
    for (const patch of [{ muted: true }, { voiceEnabled: false }, { master: 0 }, { voice: 0 }])
      player.say(lines, { ...defaultAudioPreferences, ...patch })
    expect(clips).toHaveLength(0)
  })
})
