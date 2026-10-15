import { ArrowRight, ChevronLeft, Pause, Play, Volume2 } from 'lucide-react'
import { useTextPages } from '../hooks/useTextPages'
import { useAutoAdvance } from '../hooks/useAutoAdvance'
import type { DialogueLine } from '../content/harbor'
import type { ReadingPreferences } from '../reading/preferences'
import type { useAudio } from '../hooks/useAudio'

export function DialogueReader({
  line,
  audio,
  reading,
  auto,
  paused,
  onToggleAuto,
  onReplay,
  onAdvance,
}: {
  line: DialogueLine
  audio: ReturnType<typeof useAudio>
  reading: ReadingPreferences
  auto: boolean
  paused: boolean
  onToggleAuto: () => void
  onReplay: () => void
  onAdvance: () => void
}) {
  const pagination = useTextPages([{ id: line.id, title: line.speaker, text: line.text }])
  const next = () => (pagination.last ? onAdvance() : pagination.goTo(pagination.index + 1))
  const voice =
    (!pagination.last && audio.voiceState === 'speaking') ||
    (pagination.index > 0 && audio.voiceState === 'ended')
      ? 'unavailable'
      : audio.voiceState
  useAutoAdvance(
    {
      ...line,
      id: `${line.id}/page-${pagination.index}`,
      text: pagination.page?.text ?? line.text,
    },
    auto,
    paused,
    voice,
    reading,
    next,
  )
  return (
    <div className="dialogue-body">
      <div className="dialogue-text" aria-live="polite" aria-atomic="true">
        <p ref={pagination.body} className={line.speaker === 'Narrator' ? 'narration' : ''}>
          {pagination.page?.text ?? line.text}
        </p>
      </div>
      <div className="dialogue-buttons">
        {pagination.pages.length > 1 && (
          <>
            <button
              className="page-back"
              aria-label="Previous dialogue page"
              disabled={pagination.index === 0}
              onClick={() => pagination.goTo(pagination.index - 1)}
            >
              <ChevronLeft size={17} />
            </button>
            <span className="dialogue-page">
              {pagination.index + 1}/{pagination.pages.length}
            </span>
          </>
        )}
        <button
          className="voice-replay"
          onClick={onReplay}
          aria-label="Replay dialogue"
          disabled={
            !audio.ready ||
            !audio.hasVoice ||
            !audio.preferences.voiceEnabled ||
            audio.preferences.muted ||
            audio.preferences.master * audio.preferences.voice === 0
          }
        >
          <Volume2 size={17} />
          <span>Listen</span>
        </button>
        <button
          className="auto-toggle"
          onClick={onToggleAuto}
          aria-pressed={auto}
          aria-label="Autoplay dialogue"
        >
          {auto ? <Pause size={16} /> : <Play size={16} />}
          <span>Auto{auto ? ' on' : ''}</span>
        </button>
        <button className="continue-button" onClick={next}>
          <span>{pagination.last ? 'Continue' : 'Next page'}</span>
          <span className="continue-arrow">
            <ArrowRight size={23} />
          </span>
        </button>
      </div>
    </div>
  )
}
