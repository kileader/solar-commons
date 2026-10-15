import { describe, expect, it } from 'vitest'
import { clues, conclusionChoices, entryChoices } from '../content/harbor'
import { floodSnapshot, museumApproaches, museumContent } from '../content/museum'
import { getCurrentLine, initialSceneState, sceneReducer, type SceneState } from './scene'

function finishDialogue(state: SceneState) {
  let count = 0
  while (getCurrentLine(state)) {
    if (++count > 30) throw new Error('Dialogue failed to reach a decision')
    state = sceneReducer(state, { type: 'NEXT' })
  }
  return state
}

function reachGallery(entry: string, ending: string, approach = 'memory') {
  let state = finishDialogue(initialSceneState)
  state = finishDialogue(sceneReducer(state, { type: 'CHOOSE_ENTRY', id: entry }))
  for (const clue of clues) state = sceneReducer(state, { type: 'OPEN_CLUE', id: clue.id })
  state = sceneReducer(state, { type: 'MAKE_DECISION' })
  state = finishDialogue(sceneReducer(state, { type: 'CHOOSE_ENDING', id: ending }))
  state = finishDialogue(sceneReducer(state, { type: 'VISIT_MUSEUM' }))
  return finishDialogue(sceneReducer(state, { type: 'CHOOSE_MUSEUM_APPROACH', id: approach }))
}

const routes = entryChoices.flatMap((entry) =>
  conclusionChoices.flatMap((ending) =>
    museumApproaches.flatMap((approach) =>
      [false, true].flatMap((gate) =>
        museumContent.leads.map((lead) => ({
          entry: entry.id,
          ending: ending.id,
          approach: approach.id,
          gate,
          lead: lead.id,
        })),
      ),
    ),
  ),
)

describe('harbor to Hall of Waters', () => {
  it.each(routes)('preserves $entry/$ending through $approach, gate=$gate, lead=$lead', (route) => {
    let state = reachGallery(route.entry, route.ending, route.approach)
    expect(state.phase).toBe('museum-explore')
    expect(state.exhibitRead).toBe(false)
    expect(state.inspected).toHaveLength(3)
    state = finishDialogue(sceneReducer(state, { type: 'ENTER_MODEL' }))
    expect(state.phase).toBe('museum-model')
    expect(sceneReducer(state, { type: 'INSPECT_LAMP' })).toBe(state)
    if (route.gate) state = sceneReducer(state, { type: 'TOGGLE_GATE' })
    state = sceneReducer(state, { type: 'SET_FLOOD_STAGE', stage: 1 })
    expect(sceneReducer(state, { type: 'INSPECT_LAMP' })).toBe(state)
    state = sceneReducer(state, { type: 'SET_FLOOD_STAGE', stage: 2 })
    expect(sceneReducer(state, { type: 'TOGGLE_GATE' })).toBe(state)
    state = sceneReducer(state, { type: 'INSPECT_LAMP' })
    expect(getCurrentLine(state)?.text).toContain(
      route.gate ? 'I opened' : 'Keeping the gates shut',
    )
    state = finishDialogue(state)
    expect(state.phase).toBe('museum-lead-choice')
    expect(sceneReducer(state, { type: 'CHOOSE_LEAD', id: 'invalid' })).toBe(state)
    state = finishDialogue(sceneReducer(state, { type: 'CHOOSE_LEAD', id: route.lead }))
    expect(state).toMatchObject({
      phase: 'museum-complete',
      entryChoiceId: route.entry,
      endingChoiceId: route.ending,
      museumApproach: route.approach,
      museumLeadId: route.lead,
      discovered: true,
      gateOpen: route.gate,
    })
    expect(sceneReducer(state, { type: 'NEXT' })).toBe(state)
    state = sceneReducer(state, { type: 'RESTART' })
    expect(state).toEqual(initialSceneState)
  })

  it.each(museumApproaches)(
    'reveals the mystery through reading after the $id route',
    (approach) => {
      let state = reachGallery(entryChoices[0].id, conclusionChoices[0].id, approach.id)
      state = sceneReducer(state, { type: 'READ_HANDOVER' })
      expect(state.usedTideModel).toBe(false)
      expect(getCurrentLine(state)?.text).toContain('written account')
      const text: string[] = []
      while (getCurrentLine(state)) {
        text.push(getCurrentLine(state)!.text)
        state = sceneReducer(state, { type: 'NEXT' })
      }
      expect(text.join(' ')).toContain(
        approach.id === 'memory' ? 'Grandma said the names' : 'Capability, then an action',
      )
      expect(state.phase).toBe('museum-lead-choice')
      expect(state.exhibitRead).toBe(false)
    },
  )

  it('allows leaving, optional reading, and revisiting without losing earlier evidence', () => {
    let state = reachGallery(entryChoices[0].id, conclusionChoices[0].id)
    state = finishDialogue(sceneReducer(state, { type: 'ENTER_MODEL' }))
    state = sceneReducer(state, { type: 'LEAVE_MODEL' })
    expect(state).toMatchObject({ phase: 'museum-complete', discovered: false })
    state = sceneReducer(state, { type: 'READ_HISTORY' })
    expect(state.exhibitRead).toBe(true)
    state = sceneReducer(state, { type: 'ENTER_MODEL' })
    expect(state.phase).toBe('museum-model')
    state = sceneReducer(state, { type: 'SET_FLOOD_STAGE', stage: 2 })
    state = finishDialogue(sceneReducer(state, { type: 'INSPECT_LAMP' }))
    state = finishDialogue(sceneReducer(state, { type: 'CHOOSE_LEAD', id: 'voices' }))
    state = sceneReducer(state, { type: 'ENTER_MODEL' })
    state = sceneReducer(state, { type: 'INSPECT_LAMP' })
    expect(state).toMatchObject({
      phase: 'museum-complete',
      museumLeadId: 'voices',
      exhibitRead: true,
    })
    expect(state.inspected).toEqual(clues.map((clue) => clue.id))
  })

  it('ignores museum actions before the harbor ending and invalid approach IDs', () => {
    for (const event of [
      { type: 'VISIT_MUSEUM' },
      { type: 'ENTER_MODEL' },
      { type: 'READ_HANDOVER' },
      { type: 'INSPECT_LAMP' },
      { type: 'READ_HISTORY' },
      { type: 'TOGGLE_GATE' },
    ] as const) {
      expect(sceneReducer(initialSceneState, event)).toBe(initialSceneState)
    }
    const gallery = reachGallery(entryChoices[0].id, conclusionChoices[0].id)
    expect(sceneReducer(gallery, { type: 'CHOOSE_MUSEUM_APPROACH', id: 'unknown' })).toBe(gallery)
  })

  it('illustrates why no gate setting keeps both waters out and dawn is independent of it', () => {
    expect(floodSnapshot(0, false).streetWater).toBeLessThan(floodSnapshot(0, true).streetWater)
    expect(floodSnapshot(1, false).streetWater).toBeGreaterThan(floodSnapshot(1, true).streetWater)
    expect(floodSnapshot(1, true).streetWater).toBeGreaterThan(floodSnapshot(0, true).streetWater)
    expect(floodSnapshot(2, false)).toEqual(floodSnapshot(2, true))
  })
})
