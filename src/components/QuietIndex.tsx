import { ArrowRight, BookOpen, RotateCcw } from 'lucide-react'
import { quietIndexApproaches, quietIndexNotes } from '../content/quietIndex'
import { museumContent } from '../content/museum'
import type { SceneState } from '../state/scene'
import { PagedPassage } from './PagedPassage'

/** An authored illustration, not a measurement or a reconstruction of real audio. */
export function ArchiveWaveform({ playback }: { playback: boolean }) {
  return (
    <figure className="archive-waveform">
      <figcaption>
        {playback ? 'Lower refuge · recovered excerpt' : 'Restricted research access'}
      </figcaption>
      <svg viewBox="0 0 460 70" aria-hidden="true">
        <path d="M0 35H460" className="wave-baseline" />
        {Array.from({ length: 92 }, (_, i) => {
          const height = i > 53 && i < 63 ? 2 : 3 + ((i * 17 + i * i) % 29)
          return <path key={i} d={`M${i * 5 + 2} ${35 - height}v${height * 2}`} />
        })}
      </svg>
      <p>Illustrative waveform · restoration artifacts and gaps remain</p>
    </figure>
  )
}

export function QuietIndexCompletion({
  state,
  onNotes,
  onReplay,
  onMuseum,
}: {
  state: SceneState
  onNotes: () => void
  onReplay: () => void
  onMuseum: () => void
}) {
  const approach = quietIndexApproaches.find((choice) => choice.id === state.quietIndexApproach)
  const note = state.quietIndexApproach ? quietIndexNotes[state.quietIndexApproach] : null
  const lead = museumContent.leads.find((choice) => choice.id === state.museumLeadId)
  return (
    <div className="museum-summary quiet-index-summary">
      <h2>A line left open.</h2>
      <PagedPassage
        text={[
          `Your approach: ${approach?.label}. ${note?.title}${note?.title.endsWith('?') ? '' : '.'} ${note?.text}`,
          'Who was “she”? The clicks offer no certain answer. Neither the recording’s participants nor its connection to the harbor structure are established.',
          'You’ve reached the end of the current playable story. The next investigation remains yours to follow.',
        ].join('\n\n')}
      />
      <strong className="next-lead">Next investigation: {lead?.label}</strong>
      <div className="museum-actions">
        <button className="replay-button" onClick={onNotes}>
          <BookOpen size={17} /> Review field notes
        </button>
        <button className="text-action" onClick={onReplay}>
          <RotateCcw size={16} /> Replay The Quiet Index
        </button>
        <button className="text-action" onClick={onMuseum}>
          Revisit the Hall of Waters <ArrowRight size={17} />
        </button>
      </div>
    </div>
  )
}
