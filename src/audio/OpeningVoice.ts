import { openingPosition } from '../content/opening'
import { recordingFor } from './dialogueAssets'
import type { AudioPreferences } from './preferences'

/** Follow the cinematic clock, including seeks and pauses; never extend its timeline. */
export class OpeningVoice {
  private clip: HTMLAudioElement | null = null
  private key: string | null = null
  private playing = false
  private failed = false
  private attempt = 0

  constructor(private create: (url: string) => HTMLAudioElement = (url) => new Audio(url)) {}

  sync(time: number, playing: boolean, preferences: AudioPreferences, seek = false) {
    const { shot, local } = openingPosition(time)
    const offset = shot.caption ? local - shot.caption.delay : -1
    const key = offset >= 0 && shot.caption ? `opening-${shot.id}` : null
    if (key !== this.key) {
      this.dispose()
      this.key = key
      const url = key ? recordingFor({ id: key }) : undefined
      if (url) {
        try {
          this.clip = this.create(url)
        } catch {
          this.failed = true
          return
        }
        const current = this.clip
        current.onerror = () => {
          if (this.clip === current) this.failed = true
        }
      }
    }
    const clip = this.clip
    if (!clip) return
    clip.volume = preferences.master * preferences.voice
    const audible = playing && !preferences.muted && preferences.voiceEnabled && clip.volume > 0
    if (!audible) {
      this.pause()
      return
    }
    if (seek || !this.playing) {
      if (Number.isFinite(clip.duration) && offset >= clip.duration) {
        clip.pause()
        this.playing = false
        return
      }
      try {
        clip.currentTime = Math.max(0, offset)
      } catch {
        /* Metadata still loading. */
      }
      if (!this.failed) {
        this.playing = true
        const attempt = ++this.attempt
        void clip.play().catch(() => {
          if (this.clip === clip && this.playing && this.attempt === attempt) this.failed = true
        })
      }
    }
  }

  pause() {
    this.attempt++
    this.clip?.pause()
    this.playing = false
  }

  dispose() {
    if (this.clip) {
      this.clip.onerror = null
      this.clip.pause()
      this.clip.removeAttribute('src')
      this.clip.load()
    }
    this.clip = null
    this.key = null
    this.playing = false
    this.failed = false
    this.attempt++
  }
}
