import type { DialogueLine, Speaker } from '../content/harbor'
import type { AudioPreferences } from './preferences'

export type VoiceState = 'idle' | 'loading' | 'speaking' | 'ended' | 'unavailable' | 'error'
export type SpeechService = Pick<SpeechSynthesis, 'getVoices' | 'speak' | 'cancel'>

export function localEnglishVoices(voices: readonly SpeechSynthesisVoice[]) {
  return voices.filter((voice) => voice.localService && /^en(?:[-_]|$)/i.test(voice.lang))
}

export function chooseLocalVoice(
  voices: readonly SpeechSynthesisVoice[],
  speaker: Speaker,
  preferredURI: string,
) {
  const local = localEnglishVoices(voices)
  const selected = local.find((voice) => voice.voiceURI === preferredURI)
  if (selected) return selected
  const names =
    speaker === 'Kite' ? /david|mark|daniel|george|james/i : /zira|jenny|samantha|hazel|aria/i
  return (
    local.find((voice) => names.test(voice.name)) ??
    local.find((voice) => voice.default) ??
    local[0] ??
    null
  )
}

/** Generation guards ensure a canceled line can never enqueue the rest of its old scene. */
export class VoicePlayback {
  private generation = 0
  private utterance: SpeechSynthesisUtterance | null = null
  private clip: HTMLAudioElement | null = null

  constructor(
    private service: SpeechService | null,
    private createUtterance: (text: string) => SpeechSynthesisUtterance,
    private onState: (state: VoiceState) => void,
    private recordings?: {
      find: (line: DialogueLine) => string | undefined
      create: (url: string) => HTMLAudioElement
    },
  ) {}

  stop() {
    this.generation++
    if (this.clip) {
      this.clip.onplaying = this.clip.onended = this.clip.onerror = null
      this.clip.pause()
      this.clip.removeAttribute('src')
      this.clip.load()
      this.clip = null
    }
    if (this.utterance) {
      this.utterance.onstart = this.utterance.onend = this.utterance.onerror = null
      this.utterance = null
    }
    this.service?.cancel()
    this.onState('idle')
  }

  say(lines: readonly DialogueLine[], preferences: AudioPreferences) {
    this.stop()
    const volume = preferences.muted ? 0 : preferences.master * preferences.voice
    if (!preferences.voiceEnabled || volume === 0 || lines.length === 0) return
    const generation = this.generation
    const speakAt = (index: number) => {
      if (generation !== this.generation) return
      const line = lines[index]
      if (!line) {
        this.utterance = null
        this.onState('ended')
        return
      }
      this.onState('loading')
      const fallback = () => {
        if (!preferences.deviceVoiceFallback) this.onState('unavailable')
        else this.speakLocal(line, preferences, volume, generation, () => speakAt(index + 1))
      }
      const url = this.recordings?.find(line)
      if (url) {
        let clip: HTMLAudioElement
        try {
          clip = this.recordings!.create(url)
        } catch {
          fallback()
          return
        }
        this.clip = clip
        clip.volume = volume
        clip.onplaying = () => {
          if (generation === this.generation && this.clip === clip) this.onState('speaking')
        }
        clip.onended = () => {
          if (generation !== this.generation || this.clip !== clip) return
          clip.onplaying = clip.onended = clip.onerror = null
          this.clip = null
          speakAt(index + 1)
        }
        const fail = () => {
          if (generation !== this.generation || this.clip !== clip) return
          clip.onplaying = clip.onended = clip.onerror = null
          clip.pause()
          this.clip = null
          fallback()
        }
        clip.onerror = fail
        try {
          void clip.play().catch(fail)
        } catch {
          fail()
        }
      } else fallback()
    }
    speakAt(0)
  }

  private speakLocal(
    line: DialogueLine,
    preferences: AudioPreferences,
    volume: number,
    generation: number,
    next: () => void,
  ) {
    const voice = chooseLocalVoice(
      this.service?.getVoices() ?? [],
      line.speaker,
      preferences.voiceURI,
    )
    if (!voice) {
      this.onState('unavailable')
      return
    }
    const utterance = this.createUtterance(line.text)
    utterance.voice = voice
    utterance.lang = voice.lang
    utterance.volume = volume
    utterance.rate = line.speaker === 'Narrator' ? 0.92 : line.speaker === 'Kite' ? 0.97 : 1
    utterance.pitch = line.speaker === 'Kite' ? 0.88 : 1
    this.utterance = utterance
    utterance.onstart = () => {
      if (generation === this.generation) this.onState('speaking')
    }
    utterance.onend = () => {
      if (generation === this.generation) next()
    }
    utterance.onerror = (event) => {
      if (generation !== this.generation) return
      this.utterance = null
      this.onState(event.error === 'canceled' || event.error === 'interrupted' ? 'idle' : 'error')
    }
    try {
      this.service!.speak(utterance)
    } catch {
      this.utterance = null
      this.onState('error')
    }
  }
}
