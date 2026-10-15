import { describe, expect, it, vi } from 'vitest'
import { VoicePlayback, type VoiceProgress } from './VoicePlayback'
import { defaultAudioPreferences } from './preferences'
import { dialogueRecordings, recordingFor, recordingIdFor } from './dialogueAssets'
import {
  clues,
  conclusionChoices,
  entryChoices,
  introLines,
  sceneCopy,
  voiceTestLine,
  type DialogueLine,
} from '../content/harbor'
import { openingShots } from '../content/opening'
import { museumContent, museumDialogue } from '../content/museum'
import { exhibitSectionReadings, modelReading, museumReadings } from '../content/museumReadings'
import { initialSceneState, type ScenePhase } from '../state/scene'
import script from '../../dialogue/script.json'

function setup(blocked = false, progress?: (progress: VoiceProgress | null) => void) {
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
    progress,
  )
  return { player, clips, state, speak }
}
const lines = introLines.slice(0, 2)

describe('supplied dialogue recordings', () => {
  it('reports media time without animation frames and releases progress timers on completion or cancel', () => {
    vi.useFakeTimers()
    try {
      const progress = vi.fn()
      const { player, clips } = setup(false, progress)
      player.say(lines.slice(0, 1), defaultAudioPreferences)
      const clip = clips[0]
      Object.assign(clip, { currentTime: 0, duration: 20 })
      clip.onloadedmetadata?.({} as Event)
      expect(progress).toHaveBeenLastCalledWith({ time: 0, duration: 20 })
      clip.onplaying?.({} as Event)
      clip.currentTime = 7
      vi.advanceTimersByTime(200)
      expect(progress).toHaveBeenLastCalledWith({ time: 7, duration: 20 })
      const stale = clip.ontimeupdate!
      clip.currentTime = 20
      clip.onended?.({} as Event)
      expect(progress).toHaveBeenLastCalledWith({ time: 20, duration: 20 })
      expect(vi.getTimerCount()).toBe(0)
      player.say(lines.slice(1), defaultAudioPreferences)
      const next = clips[1]
      next.onplaying?.({} as Event)
      expect(vi.getTimerCount()).toBe(1)
      const count = progress.mock.calls.length
      stale.call(clip, {} as Event)
      expect(progress).toHaveBeenCalledTimes(count)
      player.stop()
      expect(progress).toHaveBeenLastCalledWith(null)
      expect(next.ontimeupdate).toBeNull()
      expect(vi.getTimerCount()).toBe(0)
    } finally {
      vi.useRealTimers()
    }
  })

  it('maps all 94 recordings to exact authored words across every route and optional reading', () => {
    const authored: DialogueLine[] = [
      ...introLines,
      ...entryChoices.flatMap((choice) => choice.response),
      ...clues.flatMap((clue) => clue.dialogue),
      ...conclusionChoices.flatMap((choice) => choice.ending),
      voiceTestLine,
      { id: 'investigation-false', speaker: 'Kite', text: sceneCopy.investigation },
      { id: 'investigation-true', speaker: 'Kite', text: sceneCopy.synthesis },
      ...openingShots.flatMap((shot) =>
        shot.caption ? [{ id: `opening-${shot.id}`, ...shot.caption }] : [],
      ),
      ...Object.values(museumReadings),
      ...museumContent.historicalExhibit.sections.flatMap((_, index) =>
        exhibitSectionReadings(index),
      ),
    ]
    for (const stage of [0, 1, 2] as const)
      for (const gate of [false, true]) authored.push(modelReading(stage, gate))
    for (const phase of [
      'museum-arrival',
      'museum-approach',
      'museum-model-intro',
      'museum-discovery',
      'museum-lead-ending',
    ] as ScenePhase[])
      for (const endingChoiceId of ['survey', 'handshake'])
        for (const museumApproach of ['memory', 'signal'] as const)
          for (const gateOpen of [false, true])
            for (const usedTideModel of [false, true])
              for (const museumLeadId of ['stair', 'voices'])
                authored.push(
                  ...museumDialogue({
                    ...initialSceneState,
                    phase,
                    endingChoiceId,
                    museumApproach,
                    gateOpen,
                    usedTideModel,
                    museumLeadId,
                  }),
                )
    const used = new Set<string>()
    for (const line of authored) {
      const id = recordingIdFor(line)
      expect(id, `${line.id}: ${line.text}`).toBeTruthy()
      expect(recordingFor(line), id).toBeTruthy()
      const recorded = script.find((clip) => clip.id === id)!
      expect(recorded.speaker).toBe(line.speaker)
      expect(recorded.text).toBe(line.text)
      used.add(id!)
    }
    expect([...used].sort()).toEqual(Object.keys(dialogueRecordings).sort())
    expect(script.map((line) => line.id).sort()).toEqual([...used].sort())
    expect(used.size).toBe(94)
  })
  it('selects the correct discovery performance for the written, closed-gate and open-gate routes', () => {
    const ids = (patch: Partial<typeof initialSceneState>) =>
      museumDialogue({ ...initialSceneState, phase: 'museum-discovery', ...patch }).map(
        recordingIdFor,
      )
    expect(ids({ usedTideModel: false })[0]).toBe('museum-discovery-0--v1')
    expect(ids({ usedTideModel: true, gateOpen: false })[0]).toBe('museum-discovery-0--v2')
    expect(ids({ usedTideModel: true, gateOpen: true })[0]).toBe('museum-discovery-0--v3')
    expect(ids({ usedTideModel: false })[1]).toBe('museum-discovery-1--v1')
    expect(ids({ usedTideModel: true })[1]).toBe('museum-discovery-1--v2')
    expect(ids({ endingChoiceId: 'survey' })[10]).toBe('museum-discovery-10--v1')
    expect(ids({ endingChoiceId: 'handshake' })[10]).toBe('museum-discovery-10--v2')
    expect(ids({ museumApproach: 'memory' })[11]).toBe('museum-discovery-11--v1')
    expect(ids({ museumApproach: 'signal' })[11]).toBe('museum-discovery-11--v2')
    const arrival = (endingChoiceId: string) =>
      museumDialogue({ ...initialSceneState, phase: 'museum-arrival', endingChoiceId })[2]
    expect(recordingIdFor(arrival('survey'))).toBe('museum-arrival-2--v1')
    expect(recordingIdFor(arrival('handshake'))).toBe('museum-arrival-2--v2')
  })
  it('never plays a recording with changed wording or the wrong speaker, even for a shared runtime ID', () => {
    expect(recordingFor({ ...introLines[0], text: 'A rewritten line.' })).toBeUndefined()
    expect(recordingFor({ ...introLines[0], speaker: 'Mara' })).toBeUndefined()
    expect(
      recordingFor({ id: 'museum-discovery-0', speaker: 'Mara', text: 'Another account.' }),
    ).toBeUndefined()
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
