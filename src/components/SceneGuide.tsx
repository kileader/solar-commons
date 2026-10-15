import type { SceneState } from '../state/scene'

export function sceneGuide(state: SceneState) {
  switch (state.phase) {
    case 'entry-choice':
    case 'decision':
    case 'museum-approach-choice':
    case 'museum-lead-choice':
    case 'qi-approach-choice':
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
      return { title: state.museumLeadId ? 'Chapter One complete' : 'Museum visit paused' }
    case 'qi-arrival':
      return { title: 'Larkhaven after dark' }
    case 'qi-playback':
      return { title: 'The refuge excerpt' }
    case 'qi-complete':
      return { title: 'Chapter Two complete' }
    default:
      return {
        title: state.phase.startsWith('qi-')
          ? 'The Quiet Index'
          : state.phase.startsWith('museum-')
            ? 'Hall of Waters'
            : 'At the harbor',
      }
  }
}
