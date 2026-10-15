import { defaultAudioPreferences, type AudioPreferences } from './preferences'
import { consentPressTime, openingDuration } from '../content/opening'
import { OpeningVoice } from './OpeningVoice'

const cues = [
  { time: consentPressTime, notes: [420, 840], length: 0.09, level: 0.055 },
  { time: 6.4, notes: [587.33, 880], length: 0.7, level: 0.055 },
  { time: 11.3, notes: [293.66], length: 0.6, level: 0.06 },
  { time: 12.15, notes: [440], length: 0.6, level: 0.045 },
  { time: 16.4, notes: [293.66, 440, 587.33], length: 2.2, level: 0.045 },
  { time: 19.1, notes: [587.33, 880], length: 1.3, level: 0.04 },
  { time: 22.15, notes: [293.66], length: 0.8, level: 0.035 },
  { time: 30.3, notes: [440, 659.25], length: 2, level: 0.035 },
]

/** Original local synthesis. The first shot keeps Kevin's finished, embedded audio. */
export class OpeningAudio {
  private context: AudioContext | null = null
  private master: GainNode | null = null
  private music: GainNode | null = null
  private effects: GainNode | null = null
  private bed: GainNode | null = null
  private air: GainNode | null = null
  private voices: OscillatorNode[] = []
  private transients = new Set<OscillatorNode>()
  private preferences = { ...defaultAudioPreferences }
  private previous = 0
  private disposed = false
  private playing = false
  private dialogue = new OpeningVoice()

  configure(preferences: AudioPreferences) {
    this.preferences = preferences
    const now = this.context?.currentTime ?? 0
    this.master?.gain.setTargetAtTime(preferences.muted ? 0 : preferences.master, now, 0.04)
    this.music?.gain.setTargetAtTime(preferences.music, now, 0.04)
    this.effects?.gain.setTargetAtTime(preferences.effects, now, 0.04)
    this.dialogue.sync(this.previous, this.playing, preferences)
  }

  unlock() {
    if (this.disposed) return
    this.playing = true
    this.dialogue.sync(this.previous, true, this.preferences)
    try {
      if (!this.context) {
        if (!window.AudioContext) return
        const ctx = new AudioContext()
        this.context = ctx
        this.master = ctx.createGain()
        this.music = ctx.createGain()
        this.effects = ctx.createGain()
        this.bed = ctx.createGain()
        this.air = ctx.createGain()
        const compressor = ctx.createDynamicsCompressor()
        compressor.threshold.value = -18
        compressor.ratio.value = 3
        this.music.connect(this.master)
        this.effects.connect(this.master)
        this.master.connect(compressor).connect(ctx.destination)
        this.bed.gain.value = 0
        this.bed.connect(this.music)
        // A quiet open fifth, with a third voice easing into unison at the threshold.
        for (const frequency of [146.83, 220, 151]) {
          const oscillator = ctx.createOscillator()
          oscillator.type = 'sine'
          oscillator.frequency.value = frequency
          oscillator.connect(this.bed)
          oscillator.start()
          this.voices.push(oscillator)
        }
        const buffer = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate)
        const samples = buffer.getChannelData(0)
        let smoothed = 0
        for (let i = 0; i < samples.length; i++) {
          smoothed = (smoothed + (Math.random() * 2 - 1) * 0.025) / 1.025
          samples[i] = smoothed
        }
        const source = ctx.createBufferSource()
        source.buffer = buffer
        source.loop = true
        const filter = ctx.createBiquadFilter()
        filter.type = 'lowpass'
        filter.frequency.value = 1100
        this.air.gain.value = 0
        source.connect(filter).connect(this.air).connect(this.effects)
        source.start()
        this.configure(this.preferences)
      }
      void this.context
        .resume()
        .then(() => {
          if (!this.playing && this.context?.state !== 'closed') this.pause()
        })
        .catch(() => {})
    } catch {
      // Unsupported or blocked audio must leave the silent cinematic playable.
    }
  }

  update(time: number) {
    this.dialogue.sync(time, this.playing, this.preferences)
    const ctx = this.context
    if (!ctx || ctx.state !== 'running') {
      this.previous = time
      return
    }
    const now = ctx.currentTime
    const fadeIn = Math.max(0, Math.min(1, (time - 5.5) / 3))
    const fadeOut = Math.max(0, Math.min(1, (openingDuration - time) / 1.5))
    const embodied = time >= 22 && time < 25 ? 0.35 : 1
    this.bed?.gain.setTargetAtTime(0.032 * fadeIn * fadeOut * embodied, now, 0.12)
    this.air?.gain.setTargetAtTime(time >= 3 ? 0.13 * fadeOut : 0, now, 0.15)
    const alignment = Math.max(0, Math.min(1, (time - 16) / 3))
    this.voices[2]?.frequency.setTargetAtTime(151 + (146.83 - 151) * alignment, now, 0.1)
    // Only normal clock crossings produce cues; seeking explicitly resets this cursor.
    for (const cue of cues) {
      if (cue.time > this.previous && cue.time <= time) {
        cue.notes.forEach((frequency, i) => this.tone(frequency, cue.length, cue.level, i * 0.065))
      }
    }
    this.previous = time
  }

  private tone(frequency: number, duration: number, level: number, delay: number) {
    const ctx = this.context
    if (!ctx || !this.effects) return
    const oscillator = ctx.createOscillator()
    const gain = ctx.createGain()
    const start = ctx.currentTime + delay
    oscillator.frequency.value = frequency
    gain.gain.setValueAtTime(0, start)
    gain.gain.linearRampToValueAtTime(level, start + 0.025)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)
    oscillator.connect(gain).connect(this.effects)
    this.transients.add(oscillator)
    oscillator.onended = () => {
      this.transients.delete(oscillator)
      oscillator.disconnect()
      gain.disconnect()
    }
    oscillator.start(start)
    oscillator.stop(start + duration + 0.05)
  }

  seek(time: number) {
    this.dialogue.sync(time, this.playing, this.preferences, true)
    this.previous = time
    for (const oscillator of this.transients) {
      try {
        oscillator.stop()
      } catch {
        /* Already ended. */
      }
    }
    this.transients.clear()
    this.update(time)
  }

  pause() {
    this.playing = false
    this.dialogue.pause()
    void this.context?.suspend().catch(() => {})
  }

  dispose() {
    this.disposed = true
    this.dialogue.dispose()
    this.playing = false
    void this.context?.close().catch(() => {})
    this.context = null
    this.voices = []
    this.transients.clear()
  }
}
