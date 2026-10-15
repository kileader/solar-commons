import { ArrowRight, Pause, Play, Volume2 } from 'lucide-react'
import { useRef } from 'react'
import { useAutoScroll } from '../hooks/useAutoScroll'
import { readingTime, useAutoAdvance } from '../hooks/useAutoAdvance'
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
  const body = useRef<HTMLDivElement>(null)
  useAutoScroll(
    body,
    line.id + line.text,
    auto,
    paused,
    audio.voiceState,
    audio.progress,
    readingTime(line.text, reading.readingSpeed),
  )
  useAutoAdvance(line, auto, paused, audio.voiceState, reading, onAdvance)
  return (
    <div className="dialogue-body">
      <div
        ref={body}
        className="dialogue-text scrollable-passage"
        role="region"
        aria-label={`${line.speaker} dialogue`}
        tabIndex={0}
        aria-live="polite"
        aria-atomic="true"
      >
        <p className={line.speaker === 'Narrator' ? 'narration' : ''}>{line.text}</p>
      </div>
      <div className="dialogue-buttons">
        <button
          className="voice-replay"
          onClick={() => {
            if (body.current) body.current.scrollTop = 0
            onReplay()
          }}
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
        <button className="continue-button" onClick={onAdvance}>
          <span>Continue</span>
          <span className="continue-arrow">
            <ArrowRight size={23} />
          </span>
        </button>
      </div>
    </div>
  )
}
