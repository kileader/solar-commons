import { describe, expect, it } from 'vitest'
import { clues, conclusionChoices, entryChoices } from '../content/harbor'
import { museumApproaches } from '../content/museum'
import { quietIndexApproaches, quietIndexVoiceLines } from '../content/quietIndex'
import { fieldNotes } from '../content/fieldNotes'
import { recordingFor } from '../audio/dialogueAssets'
import { getCurrentLine, initialSceneState, sceneReducer, type SceneState } from './scene'

function finish(state: SceneState, spoken: string[] = []) {
  let count = 0
  while (getCurrentLine(state) || state.phase === 'qi-intro-shot') {
    if (++count > 100) throw new Error('The chapter did not reach a stopping point')
    if (state.phase === 'qi-intro-shot') {
      expect(sceneReducer(state, { type: 'NEXT' })).toBe(state)
      state = sceneReducer(state, { type: 'FINISH_ILEX_INTRO' })
      continue
    }
    spoken.push(getCurrentLine(state)!.id)
    state = sceneReducer(state, { type: 'NEXT' })
  }
  return state
}

function museum(lead: string, approach: string, entry: string, ending: string) {
  let state = finish(initialSceneState)
  state = finish(sceneReducer(state, { type: 'CHOOSE_ENTRY', id: entry }))
  for (const clue of clues) state = sceneReducer(state, { type: 'OPEN_CLUE', id: clue.id })
  state = sceneReducer(state, { type: 'MAKE_DECISION' })
  state = finish(sceneReducer(state, { type: 'CHOOSE_ENDING', id: ending }))
  state = finish(sceneReducer(state, { type: 'VISIT_MUSEUM' }))
  state = finish(sceneReducer(state, { type: 'CHOOSE_MUSEUM_APPROACH', id: approach }))
  state = sceneReducer(state, { type: 'READ_HISTORY' })
  state = finish(sceneReducer(state, { type: 'READ_HANDOVER' }))
  return finish(sceneReducer(state, { type: 'CHOOSE_LEAD', id: lead }))
}

const routes = ['stair', 'voices'].flatMap((lead) =>
  museumApproaches.flatMap((prior) =>
    quietIndexApproaches.flatMap((choice) =>
      entryChoices.flatMap((entry) =>
        conclusionChoices.map((ending) => ({
          lead,
          prior: prior.id,
          choice: choice.id,
          entry: entry.id,
          ending: ending.id,
        })),
      ),
    ),
  ),
)

describe('The Quiet Index continuity', () => {
  it.each(routes)('retains $entry/$ending, $prior/$lead through $choice', (route) => {
    const before = museum(route.lead, route.prior, route.entry, route.ending)
    const spoken: string[] = []
    let state = finish(sceneReducer(before, { type: 'VISIT_QUIET_INDEX' }), spoken)
    expect(state.phase).toBe('qi-approach-choice')
    expect(spoken).toContain(`qi-arrival-03-${route.lead}`)
    expect(sceneReducer(state, { type: 'NEXT' })).toBe(state)
    expect(sceneReducer(state, { type: 'CHOOSE_QUIET_INDEX_APPROACH', id: 'invalid' })).toBe(state)
    state = sceneReducer(state, { type: 'CHOOSE_QUIET_INDEX_APPROACH', id: route.choice })
    expect(sceneReducer(state, { type: 'CHOOSE_QUIET_INDEX_APPROACH', id: 'analysis' })).toBe(state)
    state = finish(state, spoken)
    expect(state.phase).toBe('qi-complete')
    expect(state.quietIndexHeard).toBe(true)
    expect(state.quietIndexApproach).toBe(route.choice)
    expect(spoken.filter((id) => id.startsWith(`qi-${route.choice}-`))).toHaveLength(3)
    expect(spoken).toContain(`qi-end-03-${route.lead}`)
    expect(spoken.filter((id) => id.startsWith('qi-play-'))).toHaveLength(8)
    expect(spoken).toContain('qi-play-04')
    expect(sceneReducer(state, { type: 'NEXT' })).toBe(state)
    expect(fieldNotes(state).map((note) => note.id)).toEqual([
      ...fieldNotes(before).map((note) => note.id),
      `qi-${route.choice}`,
      'qi-excerpt',
    ])
    const {
      phase: _phase,
      lineIndex: _index,
      quietIndexApproach: _approach,
      quietIndexHeard: _heard,
      ...retained
    } = state
    const {
      phase: _oldPhase,
      lineIndex: _oldIndex,
      quietIndexApproach: _oldApproach,
      quietIndexHeard: _oldHeard,
      ...old
    } = before
    expect(retained).toEqual(old)
    const replay = sceneReducer(state, { type: 'REPLAY_QUIET_INDEX' })
    expect(replay.phase).toBe('qi-arrival')
    expect(replay.quietIndexApproach).toBe(route.choice)
    expect(fieldNotes(replay)).toEqual(fieldNotes(state))
    const revisited = sceneReducer(state, { type: 'RETURN_TO_MUSEUM' })
    expect(revisited.phase).toBe('museum-complete')
    expect(revisited.museumLeadId).toBe(route.lead)
    expect(sceneReducer(revisited, { type: 'ENTER_MODEL' }).phase).toBe('museum-model')
    expect(sceneReducer(revisited, { type: 'VISIT_QUIET_INDEX' }).phase).toBe('qi-arrival')
    expect(sceneReducer(state, { type: 'RESTART' })).toEqual(initialSceneState)
  })

  it('only opens after a completed museum lead and ignores out-of-phase chapter actions', () => {
    for (const state of [
      initialSceneState,
      { ...initialSceneState, phase: 'museum-complete' as const },
      {
        ...initialSceneState,
        phase: 'museum-complete' as const,
        discovered: true,
        museumLeadId: 'invalid',
      },
    ]) {
      for (const type of [
        'VISIT_QUIET_INDEX',
        'FINISH_ILEX_INTRO',
        'REPLAY_QUIET_INDEX',
        'RETURN_TO_MUSEUM',
      ] as const)
        expect(sceneReducer(state, { type })).toBe(state)
      expect(sceneReducer(state, { type: 'CHOOSE_QUIET_INDEX_APPROACH', id: 'empathy' })).toBe(
        state,
      )
    }
  })

  it('gives every reachable passage one stable unrecorded ID, including both lead variations', () => {
    const encountered = new Set<string>()
    for (const lead of ['stair', 'voices']) {
      for (const approach of quietIndexApproaches) {
        const start = museum(lead, 'signal', entryChoices[0].id, conclusionChoices[0].id)
        const spoken: string[] = []
        let state = finish(sceneReducer(start, { type: 'VISIT_QUIET_INDEX' }), spoken)
        state = finish(
          sceneReducer(state, { type: 'CHOOSE_QUIET_INDEX_APPROACH', id: approach.id }),
          spoken,
        )
        spoken.forEach((id) => encountered.add(id))
      }
    }
    expect(new Set(quietIndexVoiceLines.map((line) => line.id)).size).toBe(
      quietIndexVoiceLines.length,
    )
    expect(encountered).toEqual(new Set(quietIndexVoiceLines.map((line) => line.id)))
    quietIndexVoiceLines.forEach((line) => expect(recordingFor(line)).toBeUndefined())
    expect(quietIndexVoiceLines.find((line) => line.id === 'qi-intro-05')?.text).toContain(
      'Ilex accepts',
    )
    expect(quietIndexVoiceLines.find((line) => line.id === 'qi-play-04')?.speaker).toBe(
      'Unknown speaker (recording)',
    )
  })
})
