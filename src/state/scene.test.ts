import { describe, expect, it } from 'vitest'
import { clues, conclusionChoices, entryChoices, introLines } from '../content/harbor'
import {
  canConclude,
  getCurrentLine,
  initialSceneState,
  sceneReducer,
  type SceneState,
} from './scene'

function advanceLines(state: SceneState, count: number): SceneState {
  for (let index = 0; index < count; index += 1) {
    state = sceneReducer(state, { type: 'NEXT' })
  }
  return state
}

function enterInvestigation(choiceId = entryChoices[0].id): SceneState {
  let state = advanceLines(initialSceneState, introLines.length)
  state = sceneReducer(state, { type: 'CHOOSE_ENTRY', id: choiceId })
  const response = entryChoices.find((choice) => choice.id === choiceId)!.response
  return advanceLines(state, response.length)
}

function inspectAll(state: SceneState): SceneState {
  return clues.reduce(
    (current, clue) => sceneReducer(current, { type: 'OPEN_CLUE', id: clue.id }),
    state,
  )
}

describe('harbor scene progression', () => {
  it('plays each intro line once and waits for an entry choice', () => {
    let state = initialSceneState
    for (const line of introLines) {
      expect(getCurrentLine(state)).toEqual(line)
      state = sceneReducer(state, { type: 'NEXT' })
    }
    expect(state.phase).toBe('entry-choice')
    expect(getCurrentLine(state)).toBeNull()
    expect(sceneReducer(state, { type: 'NEXT' })).toBe(state)
  })

  it.each(entryChoices)('plays the $id response before investigation', (choice) => {
    let state = advanceLines(initialSceneState, introLines.length)
    state = sceneReducer(state, { type: 'CHOOSE_ENTRY', id: choice.id })
    for (const line of choice.response) {
      expect(getCurrentLine(state)).toEqual(line)
      state = sceneReducer(state, { type: 'NEXT' })
    }
    expect(state.phase).toBe('investigation')
    expect(state.entryChoiceId).toBe(choice.id)
    expect(getCurrentLine(state)).toBeNull()
    expect(state.inspected).toEqual([])
  })

  it('records inspection once, keeps evidence open on NEXT, and preserves it on close', () => {
    const original = enterInvestigation()
    let state = sceneReducer(original, { type: 'OPEN_CLUE', id: clues[0].id })
    expect(state.activeClueId).toBe(clues[0].id)
    expect(state.inspected).toEqual([clues[0].id])
    expect(original.inspected).toEqual([])
    expect(sceneReducer(state, { type: 'NEXT' })).toBe(state)

    state = sceneReducer(state, { type: 'CLOSE_CLUE' })
    expect(state.activeClueId).toBeNull()
    expect(state.inspected).toEqual([clues[0].id])
    state = sceneReducer(state, { type: 'OPEN_CLUE', id: clues[0].id })
    expect(state.inspected).toEqual([clues[0].id])
  })

  it('gates the final decision on all distinct, known clues', () => {
    let state = enterInvestigation()
    expect(canConclude(state)).toBe(false)
    expect(sceneReducer(state, { type: 'MAKE_DECISION' })).toBe(state)

    for (const clue of clues.slice(0, -1)) {
      state = sceneReducer(state, { type: 'OPEN_CLUE', id: clue.id })
      expect(canConclude(state)).toBe(false)
      expect(sceneReducer(state, { type: 'MAKE_DECISION' })).toBe(state)
    }
    state = sceneReducer(state, { type: 'OPEN_CLUE', id: clues.at(-1)!.id })
    expect(canConclude(state)).toBe(true)
    state = sceneReducer(state, { type: 'MAKE_DECISION' })
    expect(state.phase).toBe('decision')
    expect(state.activeClueId).toBeNull()
    expect(sceneReducer(state, { type: 'NEXT' })).toBe(state)
  })

  it.each(conclusionChoices)('reaches the distinct $id ending', (choice) => {
    let state = inspectAll(enterInvestigation())
    state = sceneReducer(state, { type: 'MAKE_DECISION' })
    state = sceneReducer(state, { type: 'CHOOSE_ENDING', id: choice.id })
    for (const line of choice.ending) {
      expect(getCurrentLine(state)).toEqual(line)
      state = sceneReducer(state, { type: 'NEXT' })
    }
    expect(state.phase).toBe('complete')
    expect(state.endingChoiceId).toBe(choice.id)
    expect(getCurrentLine(state)).toBeNull()
    expect(sceneReducer(state, { type: 'NEXT' })).toBe(state)
  })

  it('ignores unknown IDs and actions in the wrong phase', () => {
    expect(sceneReducer(initialSceneState, { type: 'OPEN_CLUE', id: clues[0].id })).toBe(
      initialSceneState,
    )
    expect(sceneReducer(initialSceneState, { type: 'CHOOSE_ENTRY', id: entryChoices[0].id })).toBe(
      initialSceneState,
    )
    const entryState = advanceLines(initialSceneState, introLines.length)
    expect(sceneReducer(entryState, { type: 'CHOOSE_ENTRY', id: 'unknown' })).toBe(entryState)

    const investigation = enterInvestigation()
    expect(sceneReducer(investigation, { type: 'OPEN_CLUE', id: 'unknown' })).toBe(investigation)
    expect(
      sceneReducer(investigation, { type: 'CHOOSE_ENDING', id: conclusionChoices[0].id }),
    ).toBe(investigation)

    const decision = sceneReducer(inspectAll(investigation), { type: 'MAKE_DECISION' })
    expect(sceneReducer(decision, { type: 'CHOOSE_ENDING', id: 'unknown' })).toBe(decision)
    expect(sceneReducer(decision, { type: 'OPEN_CLUE', id: clues[0].id })).toBe(decision)
  })

  it('toggles perception without consuming dialogue or changing evidence', () => {
    const state = sceneReducer(initialSceneState, { type: 'TOGGLE_PERCEPTION' })
    expect(state.perception).toBe(true)
    expect(getCurrentLine(state)).toEqual(introLines[0])
    expect(state.inspected).toEqual([])
    expect(sceneReducer(state, { type: 'TOGGLE_PERCEPTION' })).toEqual(initialSceneState)
  })

  it('restarts with no retained choice, evidence, perception, or ending', () => {
    let state = inspectAll(enterInvestigation(entryChoices[1].id))
    state = sceneReducer(state, { type: 'TOGGLE_PERCEPTION' })
    state = sceneReducer(state, { type: 'MAKE_DECISION' })
    state = sceneReducer(state, { type: 'CHOOSE_ENDING', id: conclusionChoices[1].id })
    state = advanceLines(state, conclusionChoices[1].ending.length)
    const restarted = sceneReducer(state, { type: 'RESTART' })
    expect(restarted).toEqual(initialSceneState)
    expect(getCurrentLine(restarted)).toEqual(introLines[0])
    expect(initialSceneState.inspected).toEqual([])
  })
})
