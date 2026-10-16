import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { HarborAudio } from './HarborAudio'
import { defaultAudioPreferences } from './preferences'

class Param {
  value = 0
  setValueAtTime = vi.fn((value: number) => {
    this.value = value
  })
  linearRampToValueAtTime = vi.fn((value: number) => {
    this.value = value
  })
  exponentialRampToValueAtTime = vi.fn()
  cancelAndHoldAtTime = vi.fn()
  setTargetAtTime = vi.fn()
}

class Node extends EventTarget {
  gain = new Param()
  frequency = new Param()
  detune = new Param()
  Q = new Param()
  threshold = new Param()
  knee = new Param()
  ratio = new Param()
  pan = new Param()
  connect = vi.fn((target: Node) => target)
  disconnect = vi.fn()
  start = vi.fn()
  stop = vi.fn()
  getFloatTimeDomainData = vi.fn((samples: Float32Array) => samples.fill(0))
  onended: (() => void) | null = null
  finish() {
    this.onended?.()
    this.dispatchEvent(new Event('ended'))
  }
}

class Context extends EventTarget {
  static latest: Context
  state = 'running'
  currentTime = 10
  sampleRate = 1000
  destination = new Node()
  gains: Node[] = []
  sources: Node[] = []
  constructor() {
    super()
    Context.latest = this
  }
  resume = vi.fn().mockResolvedValue(undefined)
  close = vi.fn().mockResolvedValue(undefined)
  createGain() {
    const node = new Node()
    this.gains.push(node)
    return node
  }
  createOscillator() {
    const node = new Node()
    this.sources.push(node)
    return node
  }
  createBufferSource() {
    return this.createOscillator()
  }
  createBuffer(_channels: number, length: number) {
    const samples = new Float32Array(length)
    return { getChannelData: () => samples }
  }
  createAnalyser() {
    return new Node()
  }
  createDynamicsCompressor() {
    return new Node()
  }
  createBiquadFilter() {
    return new Node()
  }
  createStereoPanner() {
    return new Node()
  }
}

let engine: HarborAudio
beforeEach(() => {
  vi.useFakeTimers()
  vi.stubGlobal('window', { AudioContext: Context })
  vi.stubGlobal('AudioContext', Context)
  engine = new HarborAudio(vi.fn())
})
afterEach(() => {
  engine.dispose()
  vi.useRealTimers()
  vi.unstubAllGlobals()
})
async function unlock() {
  engine.unlock()
  await Promise.resolve()
  return Context.latest
}

describe('passage sound lifecycle', () => {
  it('cancels sounding and future sources on a skip or pause without stopping the score', async () => {
    const ctx = await unlock()
    const score = [...ctx.sources]
    const originalStops = score.map((node) => node.stop.mock.calls.length)
    engine.setPassage('qi-arrival-01')
    const passage = ctx.sources.slice(score.length)
    expect(passage.some((node) => node.start.mock.calls[0][0] > ctx.currentTime + 3)).toBe(true)
    engine.setPassage(null)
    for (const node of passage) expect(node.stop).toHaveBeenLastCalledWith(10.04)
    score.forEach((node, index) => expect(node.stop).toHaveBeenCalledTimes(originalStops[index]))
    engine.setPassage('qi-intro-05')
    const guestLink = ctx.sources.slice(score.length + passage.length)
    expect(guestLink.length).toBeGreaterThan(0)
    engine.dispose()
    for (const node of guestLink) expect(node.stop).toHaveBeenLastCalledWith(10.04)
    expect(ctx.close).toHaveBeenCalled()
  })

  it('routes cues through master and effects, independently of voice and music volume', async () => {
    engine.configure({
      ...defaultAudioPreferences,
      master: 0.4,
      effects: 0.3,
      music: 0,
      voiceEnabled: false,
    })
    const ctx = await unlock()
    const gainCount = ctx.gains.length
    const sourceCount = ctx.sources.length
    engine.setPassage('qi-play-04')
    expect(ctx.sources.length).toBeGreaterThan(sourceCount)
    expect(ctx.gains[gainCount].connect).toHaveBeenCalledWith(ctx.gains[2])
    expect(ctx.gains[0].gain.value).toBe(0.4)
    expect(ctx.gains[1].gain.value).toBe(0)
    expect(ctx.gains[2].gain.value).toBe(0.3)
    engine.setSpeaking(true)
    expect(ctx.gains[2].gain.value).toBe(0.3)
  })

  it('waits for unlock and respects mute, effects zero, and suspended audio', async () => {
    engine.setPassage('qi-intro-05')
    const ctx = await unlock()
    const before = ctx.sources.length
    engine.setPassage('qi-intro-04')
    expect(ctx.sources).toHaveLength(before)
    engine.configure({ ...defaultAudioPreferences, muted: true })
    engine.setPassage('qi-intro-05')
    engine.configure({ ...defaultAudioPreferences, effects: 0 })
    engine.setPassage('qi-intro-05')
    engine.configure(defaultAudioPreferences)
    ctx.state = 'suspended'
    engine.setPassage('qi-intro-05')
    expect(ctx.sources).toHaveLength(before)
    ctx.state = 'running'
    engine.setPassage('qi-intro-05')
    expect(ctx.sources.length).toBeGreaterThan(before)
  })

  it('does not duplicate cues and disconnects their bus after every source finishes', async () => {
    const ctx = await unlock()
    const gainCount = ctx.gains.length
    const sourceCount = ctx.sources.length
    engine.setPassage('qi-play-05')
    const passage = ctx.sources.slice(sourceCount)
    const bus = ctx.gains[gainCount]
    engine.setPassage('qi-play-05')
    expect(ctx.sources).toHaveLength(sourceCount + passage.length)
    for (const node of passage) node.finish()
    expect(bus.disconnect).toHaveBeenCalledOnce()
    const stopCounts = passage.map((node) => node.stop.mock.calls.length)
    engine.setPassage(null)
    passage.forEach((node, index) => expect(node.stop).toHaveBeenCalledTimes(stopCounts[index]))
  })
})
