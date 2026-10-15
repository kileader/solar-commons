import { useEffect, useRef } from 'react'
import type { DialogueLine } from '../content/harbor'
import type { VoiceState } from '../audio/VoicePlayback'
import type { ReadingPreferences } from '../reading/preferences'

export function readingTime(text: string, wordsPerMinute: number) {
  return Math.max(2500, (text.trim().split(/\s+/).length * 60000) / wordsPerMinute)
}

/** Advance a displayed voice line or optional reading, never a story choice or model control. */
export function useAutoAdvance(
  line: DialogueLine | null,
  enabled: boolean,
  paused: boolean,
  voiceState: VoiceState,
  preferences: ReadingPreferences,
  advance: () => void,
) {
  const action = useRef(advance)
  action.current = advance
  const key = line ? `${line.id}:${line.text}` : null
  const text = line?.text ?? ''
  useEffect(() => {
    if (!key || !enabled || paused || voiceState === 'loading' || voiceState === 'speaking') return
    const delay =
      preferences.autoDelay * 1000 +
      (voiceState === 'ended' ? 0 : readingTime(text, preferences.readingSpeed))
    const timer = window.setTimeout(() => action.current(), delay)
    return () => window.clearTimeout(timer)
  }, [key, text, enabled, paused, voiceState, preferences.autoDelay, preferences.readingSpeed])
}
