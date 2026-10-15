import { useCallback, useEffect, useRef, useState } from 'react'
import { HarborAudio, type AudioStatus, type SoundCue } from '../audio/HarborAudio'
import { localEnglishVoices, VoicePlayback, type VoiceState } from '../audio/VoicePlayback'
import {
  loadAudioPreferences,
  normalizeAudioPreferences,
  saveAudioPreferences,
  type AudioPreferences,
} from '../audio/preferences'
import type { DialogueLine } from '../content/harbor'
import { introLines } from '../content/harbor'
import { recordingFor } from '../audio/dialogueAssets'

export function useAudio(lines: readonly DialogueLine[], paused: boolean, cognitive: boolean) {
  const [preferences, setPreferences] = useState(loadAudioPreferences)
  const [status, setStatus] = useState<AudioStatus>({ state: 'locked', peak: 0 })
  const [voice, setVoice] = useState<{ key: string; state: VoiceState }>({ key: '', state: 'idle' })
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [foreground, setForeground] = useState(() => !document.hidden)
  const [replay, setReplay] = useState(0)
  const audio = useRef<HarborAudio | null>(null)
  const speech = useRef<VoicePlayback | null>(null)
  const preferencesRef = useRef(preferences)
  const linesRef = useRef(lines)
  linesRef.current = lines
  const speechKey = JSON.stringify(lines.map((line) => [line.id, line.text]))
  const speechKeyRef = useRef(speechKey)
  speechKeyRef.current = speechKey
  const localVoiceKey = preferences.deviceVoiceFallback
    ? voices.map((voice) => voice.voiceURI).join('|')
    : ''

  useEffect(() => {
    const engine = new HarborAudio(setStatus)
    audio.current = engine
    engine.configure(preferencesRef.current)
    const service = 'speechSynthesis' in window ? window.speechSynthesis : null
    const player = new VoicePlayback(
      service,
      (text) => new SpeechSynthesisUtterance(text),
      (state) => {
        setVoice({ key: speechKeyRef.current, state })
        engine.setSpeaking(state === 'speaking')
      },
      { find: recordingFor, create: (url) => new Audio(url) },
    )
    speech.current = player
    const refreshVoices = () => setVoices(service ? localEnglishVoices(service.getVoices()) : [])
    refreshVoices()
    service?.addEventListener('voiceschanged', refreshVoices)
    const setActive = () => {
      const active = !document.hidden && document.hasFocus()
      setForeground(active)
      engine.setForeground(active)
      if (!active) player.stop()
    }
    document.addEventListener('visibilitychange', setActive)
    window.addEventListener('blur', setActive)
    window.addEventListener('focus', setActive)
    return () => {
      service?.removeEventListener('voiceschanged', refreshVoices)
      document.removeEventListener('visibilitychange', setActive)
      window.removeEventListener('blur', setActive)
      window.removeEventListener('focus', setActive)
      player.stop()
      engine.dispose()
      if (audio.current === engine) audio.current = null
      if (speech.current === player) speech.current = null
    }
  }, [])

  useEffect(() => {
    preferencesRef.current = preferences
    audio.current?.configure(preferences)
    saveAudioPreferences(preferences)
  }, [preferences])
  useEffect(() => {
    audio.current?.setCognitive(cognitive)
  }, [cognitive])
  useEffect(() => {
    if (paused || !foreground || status.state !== 'running') {
      speech.current?.stop()
      return
    }
    speech.current?.say(linesRef.current, preferences)
    return () => speech.current?.stop()
  }, [speechKey, paused, foreground, status.state, preferences, localVoiceKey, replay])

  const unlock = useCallback(() => audio.current?.unlock(), [])
  const play = useCallback((cue: SoundCue) => audio.current?.play(cue), [])
  const update = useCallback((patch: Partial<AudioPreferences>) => {
    setPreferences((previous) => normalizeAudioPreferences({ ...previous, ...patch }))
  }, [])
  const toggle = useCallback(() => {
    unlock()
    update({ muted: status.state === 'running' ? !preferencesRef.current.muted : false })
  }, [unlock, update, status.state])
  const replayVoice = useCallback(() => {
    unlock()
    setReplay((value) => value + 1)
  }, [unlock])
  const testVoice = useCallback(() => {
    unlock()
    speech.current?.say(
      [introLines.find((line) => line.speaker === 'Kite')!],
      preferencesRef.current,
    )
  }, [unlock])
  const hasVoice =
    lines.some((line) => !!recordingFor(line)) ||
    (preferences.deviceVoiceFallback && voices.length > 0)
  const voiceActive =
    !paused &&
    foreground &&
    status.state === 'running' &&
    preferences.voiceEnabled &&
    !preferences.muted &&
    preferences.master * preferences.voice > 0
  return {
    preferences,
    status,
    voiceState: !voiceActive
      ? ('idle' as const)
      : voice.key === speechKey
        ? voice.state
        : ('loading' as const),
    foreground,
    hasVoice,
    voices,
    unlock,
    play,
    update,
    toggle,
    replayVoice,
    testVoice,
    ready: status.state === 'running',
  }
}
