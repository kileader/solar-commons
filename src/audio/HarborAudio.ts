import { defaultAudioPreferences, type AudioPreferences } from './preferences'

export type SoundCue =
  | 'focus'
  | 'advance'
  | 'choice'
  | 'confirm'
  | 'back'
  | 'open'
  | 'evidence'
  | 'thermal'
  | 'archive'
  | 'discovery'
  | 'perception-on'
  | 'perception-off'
  | 'signal'
  | 'ending'
  | 'restart'
  | 'slider'
export interface AudioStatus {
  state: 'locked' | 'running' | 'suspended' | 'unsupported' | 'error'
  peak: number
}

/** Original, continuous harbor score. No sample downloads or external audio services. */
export class HarborAudio {
  private context: AudioContext | null = null
  private master: GainNode | null = null
  private music: GainNode | null = null
  private effects: GainNode | null = null
  private analyser: AnalyserNode | null = null
  private filter: BiquadFilterNode | null = null
  private sample: Float32Array<ArrayBuffer> | null = null
  private timer: ReturnType<typeof setInterval> | null = null
  private preferences = { ...defaultAudioPreferences }
  private disposed = false
  private scoreStarted = false
  private nextChord = 0
  private nextBell = 0
  private chordIndex = 0
  private bellIndex = 0
  private lastCue = new Map<SoundCue, number>()
  private ducked = false
  private foreground = true
  private cognitive = false
  private onStateChange = () => this.report()

  constructor(private onStatus: (status: AudioStatus) => void) {}

  configure(preferences: AudioPreferences) {
    this.preferences = preferences
    if (!this.context || !this.master || !this.music || !this.effects) return
    this.ramp(this.master.gain, preferences.muted ? 0 : preferences.master, 0.08)
    this.ramp(this.music.gain, preferences.music * (this.ducked ? 0.3 : 1), 0.5)
    this.ramp(this.effects.gain, preferences.effects, 0.08)
  }

  unlock() {
    if (this.disposed) return
    if (!this.context) {
      if (!window.AudioContext) {
        this.onStatus({ state: 'unsupported', peak: 0 })
        return
      }
      try {
        const ctx = new AudioContext()
        this.context = ctx
        this.master = ctx.createGain()
        this.music = ctx.createGain()
        this.effects = ctx.createGain()
        this.analyser = ctx.createAnalyser()
        this.analyser.fftSize = 1024
        this.sample = new Float32Array(1024)
        const compressor = ctx.createDynamicsCompressor()
        compressor.threshold.value = -16
        compressor.knee.value = 18
        compressor.ratio.value = 3
        this.filter = ctx.createBiquadFilter()
        this.filter.type = 'lowpass'
        this.filter.frequency.value = this.cognitive ? 1200 : 2400
        this.filter.Q.value = 0.4
        this.music.connect(this.filter).connect(this.master)
        this.effects.connect(this.master)
        this.master.connect(compressor).connect(this.analyser).connect(ctx.destination)
        ctx.addEventListener('statechange', this.onStateChange)
        this.configure(this.preferences)
        this.startScore()
      } catch {
        this.onStatus({ state: 'error', peak: 0 })
        return
      }
    }
    void this.context
      .resume()
      .then(() => {
        if (this.disposed) return
        this.startTimer()
        this.report()
      })
      .catch(() => this.onStatus({ state: 'suspended', peak: 0 }))
    this.report()
  }

  setForeground(foreground: boolean) {
    this.foreground = foreground
    if (!foreground) {
      if (this.timer) clearInterval(this.timer)
      this.timer = null
      void this.context?.suspend().catch(() => {})
      this.onStatus({ state: this.context ? 'suspended' : 'locked', peak: 0 })
    } else if (this.context) this.unlock()
  }

  setSpeaking(speaking: boolean) {
    this.ducked = speaking
    if (this.music)
      this.ramp(
        this.music.gain,
        this.preferences.music * (speaking ? 0.3 : 1),
        speaking ? 0.18 : 0.8,
      )
  }

  setCognitive(active: boolean) {
    this.cognitive = active
    if (this.filter) this.ramp(this.filter.frequency, active ? 1200 : 2400, 1.2)
  }

  play(cue: SoundCue) {
    const ctx = this.context
    if (
      !ctx ||
      ctx.state !== 'running' ||
      this.preferences.muted ||
      !this.foreground ||
      !this.effects ||
      this.preferences.effects === 0
    )
      return
    const now = ctx.currentTime
    const cooldown = cue === 'focus' ? 0.09 : cue === 'slider' ? 0.1 : 0.035
    if (now - (this.lastCue.get(cue) ?? -10) < cooldown) return
    this.lastCue.set(cue, now)
    const note = (
      hz: number,
      duration = 0.16,
      level = 0.07,
      delay = 0,
      end = hz,
      type: OscillatorType = 'sine',
    ) => this.tone(this.effects!, hz, duration, level, now + delay, end, type)
    switch (cue) {
      case 'focus':
        note(880, 0.06, 0.018)
        break
      case 'slider':
        note(660, 0.065, 0.025)
        break
      case 'advance':
        this.air(this.effects, 0.13, 0.018, now, 1500)
        note(523.25, 0.12, 0.035)
        break
      case 'choice':
        note(392, 0.23, 0.075)
        note(587.33, 0.38, 0.06, 0.1)
        break
      case 'confirm':
        note(523.25, 0.19, 0.065)
        note(783.99, 0.29, 0.05, 0.08)
        break
      case 'back':
        note(440, 0.16, 0.045, 0, 330)
        break
      case 'open':
        note(659.25, 0.27, 0.05)
        note(880, 0.25, 0.025, 0.06)
        break
      case 'evidence':
        note(640, 0.7, 0.065, 0, 600)
        note(640, 0.65, 0.023, 0.26, 600)
        break
      case 'thermal':
        note(293.66, 0.55, 0.075)
        note(440, 0.65, 0.038, 0.13)
        break
      case 'archive':
        this.air(this.effects, 0.28, 0.032, now, 900)
        note(739.99, 0.33, 0.055)
        break
      case 'discovery':
        ;[392, 523.25, 783.99].forEach((hz, i) => note(hz, 0.75, 0.05, i * 0.11))
        break
      case 'perception-on':
        this.air(this.effects, 0.8, 0.035, now, 1800)
        ;[261.63, 523.25, 1046.5].forEach((hz, i) => note(hz, 0.65, 0.044, i * 0.1, hz * 1.015))
        break
      case 'perception-off':
        note(523.25, 0.5, 0.055, 0, 261.63)
        this.air(this.effects, 0.35, 0.018, now, 600)
        break
      case 'signal':
        ;[0, 0.24, 0.48].forEach((delay) => note(1174.66, 0.3, 0.055, delay))
        break
      case 'ending':
        ;[261.63, 392, 493.88, 587.33].forEach((hz, i) => note(hz, 1.8, 0.045, i * 0.08))
        break
      case 'restart':
        note(587.33, 0.24, 0.05)
        note(392, 0.4, 0.045, 0.13)
        break
    }
  }

  dispose() {
    this.disposed = true
    if (this.timer) clearInterval(this.timer)
    this.context?.removeEventListener('statechange', this.onStateChange)
    void this.context?.close().catch(() => {})
    this.context = null
  }

  private ramp(param: AudioParam, target: number, duration: number) {
    if (!this.context) return
    const now = this.context.currentTime
    if (typeof param.cancelAndHoldAtTime === 'function') param.cancelAndHoldAtTime(now)
    else {
      const heldValue = param.value
      param.cancelScheduledValues(now)
      param.setValueAtTime(heldValue, now)
    }
    param.linearRampToValueAtTime(target, now + duration)
  }

  private startTimer() {
    if (this.timer || !this.foreground) return
    this.timer = setInterval(() => {
      this.schedule()
      this.report()
    }, 250)
  }

  private report() {
    if (this.disposed) return
    let peak = 0
    if (this.context?.state === 'running' && this.analyser && this.sample) {
      this.analyser.getFloatTimeDomainData(this.sample)
      for (const sample of this.sample) peak = Math.max(peak, Math.abs(sample))
    }
    this.onStatus({
      state: this.context?.state === 'running' ? 'running' : this.context ? 'suspended' : 'locked',
      peak,
    })
  }

  private startScore() {
    if (!this.context || !this.music || this.scoreStarted) return
    this.scoreStarted = true
    const ctx = this.context
    // A quiet band-limited shore texture: original deterministic noise.
    const noise = ctx.createBufferSource()
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 6, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    let seed = 2701,
      brown = 0
    for (let i = 0; i < data.length; i++) {
      seed = (seed * 1664525 + 1013904223) >>> 0
      brown = (brown + ((seed / 4294967296) * 2 - 1) * 0.025) / 1.025
      data[i] = brown * 3
    }
    // Crossfade into the leading segment, then repeat from just after that segment.
    const seam = Math.floor(ctx.sampleRate * 0.1)
    for (let i = 0; i < seam; i++)
      data[data.length - seam + i] =
        data[data.length - seam + i] * (1 - i / (seam - 1)) + data[i] * (i / (seam - 1))
    noise.buffer = buffer
    noise.loop = true
    noise.loopStart = seam / ctx.sampleRate
    const shore = ctx.createBiquadFilter()
    shore.type = 'lowpass'
    shore.frequency.value = 650
    const volume = ctx.createGain()
    volume.gain.value = 0.1
    noise.connect(shore).connect(volume).connect(this.music)
    noise.start()
    const swell = ctx.createOscillator()
    swell.frequency.value = 0.055
    const swellDepth = ctx.createGain()
    swellDepth.gain.value = 0.035
    swell.connect(swellDepth).connect(volume.gain)
    swell.start()
    this.nextChord = ctx.currentTime
    this.nextBell = ctx.currentTime + 4
    this.schedule()
  }

  private schedule() {
    if (!this.context || !this.music || !this.foreground) return
    const now = this.context.currentTime
    const chords = [
      [130.81, 196, 246.94, 293.66],
      [174.61, 220, 261.63, 329.63],
      [146.83, 220, 261.63, 329.63],
      [130.81, 196, 261.63, 329.63],
    ]
    if (this.nextChord <= now + 1) {
      const start = Math.max(now, this.nextChord)
      const chord = chords[this.chordIndex++ % chords.length]
      chord.forEach((hz, index) => {
        const oscillator = this.context!.createOscillator()
        oscillator.type = index === 0 ? 'sine' : 'triangle'
        oscillator.frequency.value = hz
        oscillator.detune.value = index % 2 ? 3 : -3
        const envelope = this.context!.createGain()
        const pan = this.context!.createStereoPanner()
        pan.pan.value = (index - 1.5) * 0.23
        envelope.gain.setValueAtTime(0, start)
        envelope.gain.linearRampToValueAtTime(0.036, start + 4)
        envelope.gain.setValueAtTime(0.036, start + 21)
        envelope.gain.linearRampToValueAtTime(0, start + 29)
        oscillator.connect(envelope).connect(pan).connect(this.music!)
        oscillator.start(start)
        oscillator.stop(start + 29.1)
        oscillator.onended = () => {
          oscillator.disconnect()
          envelope.disconnect()
          pan.disconnect()
        }
      })
      this.nextChord = start + 24
    }
    if (this.nextBell <= now + 1) {
      const melody = [659.25, 783.99, 587.33, 493.88, 523.25, 659.25, 440, 587.33]
      const start = Math.max(now, this.nextBell)
      const hz = melody[this.bellIndex++ % melody.length]
      this.tone(this.music, hz, 3.4, 0.023, start)
      this.tone(this.music, hz, 2.8, 0.008, start + 0.5)
      this.nextBell = start + 6.2
    }
  }

  private tone(
    bus: AudioNode,
    frequency: number,
    duration: number,
    level: number,
    at: number,
    endFrequency = frequency,
    type: OscillatorType = 'sine',
  ) {
    if (!this.context) return
    const osc = this.context.createOscillator(),
      envelope = this.context.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(frequency, at)
    osc.frequency.exponentialRampToValueAtTime(endFrequency, at + duration)
    envelope.gain.setValueAtTime(0, at)
    envelope.gain.linearRampToValueAtTime(level, at + Math.min(0.015, duration / 5))
    envelope.gain.exponentialRampToValueAtTime(0.0001, at + duration)
    osc.connect(envelope).connect(bus)
    osc.start(at)
    osc.stop(at + duration + 0.02)
    osc.onended = () => {
      osc.disconnect()
      envelope.disconnect()
    }
  }

  private air(bus: AudioNode, duration: number, level: number, at: number, cutoff: number) {
    if (!this.context) return
    const ctx = this.context,
      source = ctx.createBufferSource()
    const buffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * duration), ctx.sampleRate)
    const samples = buffer.getChannelData(0)
    for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1
    source.buffer = buffer
    const filter = ctx.createBiquadFilter(),
      envelope = ctx.createGain()
    filter.type = 'lowpass'
    filter.frequency.value = cutoff
    envelope.gain.setValueAtTime(0, at)
    envelope.gain.linearRampToValueAtTime(level, at + duration * 0.15)
    envelope.gain.linearRampToValueAtTime(0, at + duration)
    source.connect(filter).connect(envelope).connect(bus)
    source.start(at)
    source.onended = () => {
      source.disconnect()
      filter.disconnect()
      envelope.disconnect()
    }
  }
}
