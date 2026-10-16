import { describe, expect, it } from 'vitest'
import { cognitiveView } from './cognition'
import { quietIndexApproaches, quietIndexNotes } from './quietIndex'
import { initialSceneState } from '../state/scene'

describe('shared perception knowledge boundaries', () => {
  it('leaves the harbor and interactive tide model with their own existing views', () => {
    expect(cognitiveView(initialSceneState)).toBeNull()
    expect(cognitiveView({ ...initialSceneState, phase: 'museum-model' })).toBeNull()
  })
  it('does not reveal the attended line before the museum discovery', () => {
    const before = cognitiveView({ ...initialSceneState, phase: 'museum-explore' })!
    const after = cognitiveView({
      ...initialSceneState,
      phase: 'museum-complete',
      discovered: true,
    })!
    expect(before.kind).toBe('museum')
    expect(before.traces).toHaveLength(3)
    expect(before.traces[2].observed).not.toContain('still attended')
    expect(after.traces[2].observed).toContain('still attended')
    expect(before.traces[2].interpretation).toContain('rather than a recovered circuit diagram')
  })
  it.each(['stair', 'voices'])('keeps the chosen %s route in the canal overlay', (lead) => {
    const view = cognitiveView({ ...initialSceneState, phase: 'qi-arrival', museumLeadId: lead })!
    expect(view.kind).toBe('canal')
    expect(view.traces[1].observed).toContain(
      lead === 'stair' ? 'safe access' : 'missing refuge testimony',
    )
    expect(view.traces[1].interpretation).toContain('does not replace')
    expect(view.traces[2].uncertainty).toContain('No private room')
  })
  it('only shows Ilex’s active guest link once the introduction explicitly accepts it', () => {
    const pending = cognitiveView({ ...initialSceneState, phase: 'qi-intro', lineIndex: 3 })!
    const accepted = cognitiveView({ ...initialSceneState, phase: 'qi-intro', lineIndex: 4 })!
    expect(pending.connected).toBe(false)
    expect(pending.traces[1].observed).toContain('not yet been accepted')
    expect(accepted.connected).toBe(true)
    expect(accepted.traces[1].observed).toContain('Ilex accepted')
    expect(accepted.traces[1].interpretation).toContain('private senses, which remain unshared')
  })
  it.each(quietIndexApproaches)(
    'reveals the $id insight after Ilex answers and keeps the other routes undisclosed',
    (approach) => {
      const state = {
        ...initialSceneState,
        phase: 'qi-approach' as const,
        quietIndexApproach: approach.id,
      }
      const before = cognitiveView(state)!
      const after = cognitiveView({ ...state, lineIndex: 1 })!
      expect(before.traces[2].interpretation).not.toContain(quietIndexNotes[approach.id].text)
      expect(after.traces[2].interpretation).toContain(quietIndexNotes[approach.id].text)
      for (const other of quietIndexApproaches.filter((choice) => choice.id !== approach.id))
        expect(after.traces[2].interpretation).not.toContain(quietIndexNotes[other.id].text)
      expect(after.traces[2].uncertainty).toContain('identity, age, or consciousness')
    },
  )
})
