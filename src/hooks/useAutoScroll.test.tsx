// @vitest-environment jsdom
import { act, useRef } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { useAutoScroll } from './useAutoScroll'
import type { VoiceProgress, VoiceState } from '../audio/VoicePlayback'

let root: Root
let container: HTMLDivElement
let frames: Map<number, FrameRequestCallback>
let frameId: number
let now: number
let enabled: boolean
let paused: boolean
let voiceState: VoiceState
let progress: VoiceProgress | null
let passage: string

function Reader() {
  const body = useRef<HTMLDivElement>(null)
  useAutoScroll(body, passage, enabled, paused, voiceState, progress, 10000)
  return <div ref={body}>{passage}</div>
}
const render = () => act(() => root.render(<Reader />))
const element = () => container.firstElementChild as HTMLDivElement
function tick(ms: number) {
  now += ms
  act(() => {
    const pending = [...frames.values()]
    frames.clear()
    pending.forEach((callback) => callback(now))
  })
}

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
  frames = new Map()
  frameId = now = 0
  enabled = true
  paused = false
  voiceState = 'speaking'
  progress = { time: 0, duration: 20 }
  passage = 'One complete recording'
  vi.spyOn(performance, 'now').mockImplementation(() => now)
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    frames.set(++frameId, callback)
    return frameId
  })
  vi.stubGlobal('cancelAnimationFrame', (id: number) => frames.delete(id))
  vi.spyOn(HTMLElement.prototype, 'scrollHeight', 'get').mockReturnValue(1000)
  vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(200)
  container = document.createElement('div')
  document.body.append(container)
  root = createRoot(container)
})
afterEach(() => {
  act(() => root.unmount())
  expect(frames.size).toBe(0)
  container.remove()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

it('scrolls gently by recording time and reaches the bottom before advancing', () => {
  render()
  tick(1000)
  expect(element().scrollTop).toBe(0)
  tick(4000)
  const early = element().scrollTop
  expect(early).toBeGreaterThan(0)
  expect(early).toBeLessThan(200)
  tick(5000)
  expect(element().scrollTop).toBeGreaterThan(early)
  expect(element().scrollTop).toBeLessThan(800)
  voiceState = 'ended'
  progress = { time: 20, duration: 20 }
  render()
  tick(16)
  expect(element().scrollTop).toBe(800)
  expect(document.documentElement.scrollTop).toBe(0)
})

it('waits while loading and uses reading speed for unvoiced passages', () => {
  voiceState = 'loading'
  progress = null
  render()
  tick(60000)
  expect(element().scrollTop).toBe(0)
  voiceState = 'idle'
  render()
  tick(5000)
  expect(element().scrollTop).toBeGreaterThan(0)
  expect(element().scrollTop).toBeLessThan(800)
  tick(5000)
  expect(element().scrollTop).toBe(800)
})

it.each(['wheel', 'touchstart', 'keydown'])(
  'lets %s scrolling take over until Auto is toggled',
  (type) => {
    render()
    tick(5000)
    element().dispatchEvent(
      type === 'keydown' ? new KeyboardEvent(type, { key: 'PageDown' }) : new Event(type),
    )
    element().scrollTop = 123
    tick(5000)
    expect(element().scrollTop).toBe(123)
    enabled = false
    render()
    expect(frames.size).toBe(0)
    tick(5000)
    expect(element().scrollTop).toBe(123)
    enabled = true
    render()
    tick(16)
    expect(element().scrollTop).toBeGreaterThan(123)
  },
)

it('pauses animation for a panel and resets a new passage to its start', () => {
  render()
  tick(5000)
  const position = element().scrollTop
  paused = true
  render()
  expect(frames.size).toBe(0)
  tick(5000)
  expect(element().scrollTop).toBe(position)
  paused = false
  passage = 'Next recording'
  voiceState = 'loading'
  progress = null
  render()
  expect(element().scrollTop).toBe(0)
})
