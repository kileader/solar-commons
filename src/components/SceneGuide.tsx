import { ArrowDown } from 'lucide-react'
import { floodStages } from '../content/museum'
import { canConclude, type SceneState } from '../state/scene'

export function sceneGuide(state: SceneState) {
  switch (state.phase) {
    case 'entry-choice':
    case 'decision':
    case 'museum-approach-choice':
    case 'museum-lead-choice':
      return {
        title: 'Your choice',
        detail: 'Choose a path to continue.',
        action: 'Show choices',
        target: '.choice-block',
      }
    case 'investigation':
      return {
        title: 'Harbor investigation',
        detail: `${state.inspected.length} of 3 readings recorded${canConclude(state) ? ' · Ready to decide.' : '.'}`,
        action: canConclude(state) ? 'Show next step' : 'Show readings',
        target: canConclude(state) ? '.investigation-actions' : '.hotspots',
      }
    case 'complete':
      return {
        title: 'Harbor scene complete',
        detail: 'The Hall of Waters is open to explore.',
        action: 'Show next steps',
        target: '.museum-actions',
      }
    case 'museum-explore':
      return {
        title: 'Tide gallery',
        detail: 'Choose an activity. History is optional.',
        action: 'Show options',
        target: '.museum-actions',
      }
    case 'museum-model':
      return {
        title: 'Tide reconstruction',
        detail: `${floodStages[state.floodStage]} · Gate ${state.gateOpen ? 'open' : 'closed'}`,
        action: 'Show controls',
        target: '.model-timeline',
      }
    case 'museum-complete':
      return {
        title: 'Chapter One complete',
        detail: 'Review your lead or revisit the exhibits.',
        action: 'Show next steps',
        target: '.museum-actions',
      }
    default:
      return {
        title: state.phase.startsWith('museum-') ? 'Hall of Waters' : 'At the harbor',
        detail: 'Read or listen to the conversation.',
        action: 'Show dialogue',
        target: '.dialogue-stage',
      }
  }
}

export function jumpToScene(target: string) {
  const section = document.querySelector<HTMLElement>(target)
  if (!section) return
  const control =
    section.querySelector<HTMLElement>(
      '.continue-button, .story-choice, .hotspot, .model-moment, .replay-button',
    ) ?? section.querySelector<HTMLElement>('button:not(:disabled)')
  control?.focus({ preventScroll: true })
  section.scrollIntoView({ block: 'start', behavior: 'auto' })
}

export function SceneGuide({
  guide,
  auto,
}: {
  guide: ReturnType<typeof sceneGuide>
  auto: boolean
}) {
  return (
    <>
      <div className="current-step" role="status" aria-label="Current step" aria-atomic="true">
        <strong>{guide.title}</strong>
        <span>
          {auto ? 'Auto on · ' : ''}
          {guide.detail}
        </span>
      </div>
      <button className="scene-jump" onClick={() => jumpToScene(guide.target)}>
        {guide.action} <ArrowDown size={17} />
      </button>
    </>
  )
}
