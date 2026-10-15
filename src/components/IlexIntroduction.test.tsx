// @vitest-environment jsdom
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { IlexIntroduction } from './IlexIntroduction'

vi.mock('../hooks/useGamepad', () => ({ useGamepad: () => 'waiting' }))
let root: Root
let container: HTMLDivElement
let finished: () => void

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
  vi.useFakeTimers()
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue()
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {})
  container = document.createElement('div')
  document.body.append(container)
  root = createRoot(container)
  finished = vi.fn()
})
afterEach(() => {
  act(() => root.unmount())
  container.remove()
  vi.useRealTimers()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})
const render = async (reduced = false) => {
  await act(async () => root.render(<IlexIntroduction reduced={reduced} onComplete={finished} />))
}

it('plays the supplied single muted shot and completes once when it ends', async () => {
  await render()
  const video = container.querySelector('video')!
  expect(video.src).toContain('media/quiet-index/ilex-intro.mp4')
  expect(video.muted).toBe(true)
  expect(video.loop).toBe(false)
  act(() => video.dispatchEvent(new Event('playing')))
  act(() => vi.advanceTimersByTime(8000))
  expect(container.querySelector('video')).toBe(video)
  act(() => {
    video.dispatchEvent(new Event('ended'))
    video.dispatchEvent(new Event('ended'))
  })
  expect(finished).toHaveBeenCalledTimes(1)
})

it('offers a playable still without starting video when reduced motion is selected', async () => {
  await render(true)
  expect(container.querySelector('video')).toBeNull()
  expect(HTMLMediaElement.prototype.play).not.toHaveBeenCalled()
  expect(container.textContent).toContain('Reduced motion')
  act(() => container.querySelector<HTMLButtonElement>('.continue-button')!.click())
  expect(finished).toHaveBeenCalledOnce()
})

it.each(['error', 'timeout', 'rejected'] as const)(
  'falls back to a still on %s without skipping the introduction',
  async (failure) => {
    if (failure === 'rejected')
      vi.mocked(HTMLMediaElement.prototype.play).mockRejectedValue(new Error('Autoplay blocked'))
    await render()
    if (failure === 'error')
      act(() => container.querySelector('video')!.dispatchEvent(new Event('error')))
    if (failure === 'timeout') act(() => vi.advanceTimersByTime(8000))
    expect(container.querySelector('video')).toBeNull()
    expect(container.querySelector('img')?.src).toContain('ilex-intro-poster.webp')
    expect(finished).not.toHaveBeenCalled()
    act(() => container.querySelector<HTMLButtonElement>('.continue-button')!.click())
    expect(finished).toHaveBeenCalledOnce()
  },
)

it('pauses with Space and skips with Escape while ignoring held-key repeats', async () => {
  await render()
  const video = container.querySelector('video')!
  Object.defineProperty(video, 'paused', { configurable: true, value: false })
  act(() => video.dispatchEvent(new Event('playing')))
  act(() => document.body.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true })))
  expect(HTMLMediaElement.prototype.pause).toHaveBeenCalled()
  act(() =>
    document.body.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, repeat: true }),
    ),
  )
  expect(finished).not.toHaveBeenCalled()
  act(() =>
    document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })),
  )
  expect(finished).toHaveBeenCalledOnce()
})
