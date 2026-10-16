import { expect, it } from 'vitest'
import { clues } from '../content/harbor'
import { fieldNotes } from '../content/fieldNotes'
import { recordingIdFor } from '../audio/dialogueAssets'
import { getCurrentLine, initialSceneState, sceneAtStart, sceneReducer } from './scene'

it('starts the harbor fresh after a later chapter without retaining discoveries or choices', () => {
  const previous = {
    ...sceneAtStart({ scene: 'quiet-index', endingChoiceId: 'handshake', museumLeadId: 'voices' }),
    lineIndex: 3,
    activeClueId: 'thermal',
    perception: true,
    exhibitRead: true,
    usedTideModel: true,
    gateOpen: true,
    quietIndexApproach: 'empathy' as const,
    quietIndexHeard: true,
  }
  const next = sceneReducer(previous, { type: 'START_SCENE', start: { scene: 'harbor' } })
  expect(next).toEqual(initialSceneState)
  expect(next.inspected).not.toBe(initialSceneState.inspected)
  expect(previous.quietIndexHeard).toBe(true)
  expect(getCurrentLine(next)?.id).toBe('arrival')
})

it.each(['survey', 'handshake'] as const)(
  'starts the museum with the %s outcome and leaves its investigation choices open',
  (endingChoiceId) => {
    let state = sceneAtStart({ scene: 'museum', endingChoiceId })
    expect(state.phase).toBe('museum-arrival')
    expect(state.lineIndex).toBe(0)
    expect(state.inspected).toEqual(clues.map((clue) => clue.id))
    expect(state.discovered).toBe(false)
    expect(state.museumApproach).toBeNull()
    expect(state.museumLeadId).toBeNull()
    expect(fieldNotes(state).map((entry) => entry.id)).toEqual(['geometry', 'thermal', 'archive'])
    state = sceneReducer(sceneReducer(state, { type: 'NEXT' }), { type: 'NEXT' })
    expect(recordingIdFor(getCurrentLine(state)!)).toBe(
      endingChoiceId === 'survey' ? 'museum-arrival-2--v1' : 'museum-arrival-2--v2',
    )
    while (state.phase === 'museum-arrival') state = sceneReducer(state, { type: 'NEXT' })
    expect(state.phase).toBe('museum-approach-choice')
  },
)

it.each([
  { endingChoiceId: 'survey', museumLeadId: 'stair' },
  { endingChoiceId: 'survey', museumLeadId: 'voices' },
  { endingChoiceId: 'handshake', museumLeadId: 'stair' },
  { endingChoiceId: 'handshake', museumLeadId: 'voices' },
] as const)('starts Chapter Two with $endingChoiceId / $museumLeadId context', (context) => {
  let state = sceneAtStart({ scene: 'quiet-index', ...context })
  expect(state.phase).toBe('qi-arrival')
  expect(state.discovered).toBe(true)
  expect(state.endingChoiceId).toBe(context.endingChoiceId)
  expect(state.museumLeadId).toBe(context.museumLeadId)
  expect(state.quietIndexApproach).toBeNull()
  expect(state.quietIndexHeard).toBe(false)
  expect(state.perception).toBe(false)
  expect(fieldNotes(state).map((entry) => entry.id)).toEqual([
    'geometry',
    'thermal',
    'archive',
    'refuge',
    'lead',
  ])
  state = sceneReducer(sceneReducer(state, { type: 'NEXT' }), { type: 'NEXT' })
  expect(recordingIdFor(getCurrentLine(state)!)).toBe(`qi-arrival-03-${context.museumLeadId}`)
  while (state.phase === 'qi-arrival') state = sceneReducer(state, { type: 'NEXT' })
  expect(state.phase).toBe('qi-intro-shot')
  state = sceneReducer(state, { type: 'FINISH_ILEX_INTRO' })
  while (state.phase === 'qi-intro' || state.phase === 'qi-record')
    state = sceneReducer(state, { type: 'NEXT' })
  expect(state.phase).toBe('qi-approach-choice')
  expect(state.quietIndexApproach).toBeNull()
  expect(state.quietIndexHeard).toBe(false)
})
