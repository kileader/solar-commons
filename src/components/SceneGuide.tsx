import type { SceneState } from '../state/scene'

export function sceneGuide(state: SceneState) {
  switch (state.phase) {
    case 'entry-choice':
    case 'decision':
    case 'museum-approach-choice':
    case 'museum-lead-choice':
      return { title: 'Your choice' }
    case 'investigation':
      return { title: 'Harbor investigation' }
    case 'complete':
      return { title: 'Harbor scene complete' }
    case 'museum-explore':
      return { title: 'Tide gallery' }
    case 'museum-model':
      return { title: 'Tide reconstruction' }
    case 'museum-complete':
      return { title: 'Chapter One complete' }
    default:
      return { title: state.phase.startsWith('museum-') ? 'Hall of Waters' : 'At the harbor' }
  }
}
