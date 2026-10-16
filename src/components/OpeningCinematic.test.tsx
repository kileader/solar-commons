// @vitest-environment jsdom
import { act, StrictMode, useEffect } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Startup from '../Startup'
import { audioStorageKey } from '../audio/preferences'
import type { SceneState } from '../state/scene'

const calls = vi.hoisted(() => ({
  mount: vi.fn(),
  input: vi.fn(),
  configure: vi.fn(),
  unlock: vi.fn(),
  pause: vi.fn(),
  dispose: vi.fn(),
  seek: vi.fn(),
  update: vi.fn(),
}))
vi.mock('../audio/OpeningAudio', () => ({
  OpeningAudio: class {
    configure = calls.configure
    unlock = calls.unlock
    pause = calls.pause
    dispose = calls.dispose
    seek = calls.seek
    update = calls.update
  },
}))
vi.mock('./StudioSplash', () => ({
  StudioSplash: ({ onComplete }: { onComplete: () => void }) => (
    <button onClick={onComplete}>Leave studio</button>
  ),
}))
vi.mock('../App', () => ({
  default: function Harbor({ initialState }: { initialState: SceneState }) {
    useEffect(() => {
      calls.mount(initialState)
      document.addEventListener('keydown', calls.input)
      document.addEventListener('click', calls.input)
      return () => {
        document.removeEventListener('keydown', calls.input)
        document.removeEventListener('click', calls.input)
      }
    }, [])
    return <p>First harbor line</p>
  },
}))

let root: Root, container: HTMLDivElement
let frames: Map<number, FrameRequestCallback>, nextId: number, now: number
let pads: Gamepad[]
let reduced = false
function tick(ms = 20) {
  act(() => {
    now += ms
    const pending = [...frames.values()]
    frames.clear()
    pending.forEach((callback) => callback(now))
  })
}
function click(text: string) {
  const button = [...container.querySelectorAll('button')].find(
    (b) => b.textContent?.trim() === text,
  )
  expect(button, text).toBeTruthy()
  act(() => button!.click())
}
function key(type: string, code: string, repeat = false) {
  const event = new KeyboardEvent(type, {
    code,
    key: code === 'Space' ? ' ' : code,
    bubbles: true,
    cancelable: true,
    repeat,
  })
  act(() => document.dispatchEvent(event))
  return event
}
function controller(pressed: number[] = []) {
  pads = [
    {
      id: 'test-pad',
      index: 0,
      connected: true,
      mapping: 'standard',
      axes: [0, 0, 0, 0],
      buttons: Array.from({ length: 17 }, (_, i) => ({
        pressed: pressed.includes(i),
        value: pressed.includes(i) ? 1 : 0,
        touched: false,
      })),
    } as unknown as Gamepad,
  ]
  tick()
}
const opening = () => container.querySelector('.opening')!
const position = () => Number(container.querySelector<HTMLInputElement>('.opening-progress')!.value)

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
  vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] })
  vi.clearAllMocks()
  frames = new Map()
  nextId = 0
  now = 0
  pads = []
  reduced = false
  localStorage.clear()
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    frames.set(++nextId, callback)
    return nextId
  })
  vi.stubGlobal('cancelAnimationFrame', (id: number) => frames.delete(id))
  vi.stubGlobal('matchMedia', () => ({
    matches: reduced,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }))
  vi.spyOn(document, 'hasFocus').mockReturnValue(true)
  vi.spyOn(document, 'hidden', 'get').mockReturnValue(false)
  vi.spyOn(performance, 'now').mockImplementation(() => now)
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue()
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {})
  Object.defineProperty(HTMLDialogElement.prototype, 'showModal', {
    configurable: true,
    value: function (this: HTMLDialogElement) {
      this.open = true
    },
  })
  Object.defineProperty(HTMLDialogElement.prototype, 'close', {
    configurable: true,
    value: function (this: HTMLDialogElement) {
      this.open = false
    },
  })
  Object.defineProperty(navigator, 'getGamepads', { configurable: true, value: () => pads })
  container = document.createElement('div')
  document.body.append(container)
  root = createRoot(container)
  act(() => root.render(<Startup />))
  click('Leave studio')
})
afterEach(() => {
  act(() => root.unmount())
  expect(vi.getTimerCount()).toBe(0)
  vi.useRealTimers()
  container.remove()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('cinematic startup and lifecycle', () => {
  it('keeps controller navigation and Back inside chapter selection', () => {
    vi.spyOn(HTMLElement.prototype, 'getClientRects').mockReturnValue([
      { width: 100, height: 30 },
    ] as unknown as DOMRectList)
    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
      configurable: true,
      value: vi.fn(),
    })
    controller()
    controller([13])
    expect(document.activeElement?.getAttribute('aria-label')).toBe('Choose a chapter')
    controller()
    controller([0])
    expect(container.querySelector('dialog[open]')).toBeTruthy()
    controller()
    controller([13])
    expect(document.activeElement?.textContent).toContain('Hall of Waters')
    controller()
    controller([0])
    expect(container.querySelector('[aria-label="Harbor outcome"]')).toBeTruthy()
    controller()
    controller([1])
    tick()
    expect(container.querySelector('dialog[open]')).toBeNull()
    expect(opening().getAttribute('data-playback')).toBe('ready')
    expect(calls.mount).not.toHaveBeenCalled()
  })
  it('starts a chosen chapter with explicit context only after held input is released', () => {
    click('Chapters')
    act(() => container.querySelectorAll<HTMLButtonElement>('.chapter-option')[3].click())
    const select = (label: string, value: string) =>
      act(() => {
        const control = [...container.querySelectorAll<HTMLSelectElement>('select')].find(
          (control) => control.closest('label')?.textContent?.includes(label),
        )!
        control.value = value
        control.dispatchEvent(new Event('change', { bubbles: true }))
      })
    select('Harbor outcome', 'handshake')
    select('Museum lead', 'voices')
    key('keydown', 'Enter')
    click('Start The Quiet Index')
    tick()
    expect(calls.mount).not.toHaveBeenCalled()
    key('keyup', 'Enter')
    tick()
    expect(calls.mount).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({
        phase: 'qi-arrival',
        lineIndex: 0,
        endingChoiceId: 'handshake',
        museumLeadId: 'voices',
        quietIndexApproach: null,
      }),
    )
    expect(calls.input).not.toHaveBeenCalled()
    expect(calls.dispose).toHaveBeenCalledTimes(1)
  })
  it('closes chapter selection without skipping the opening or starting sound', () => {
    click('Chapters')
    expect(key('keydown', 'Escape').defaultPrevented).toBe(false)
    act(() =>
      container
        .querySelector('dialog[open]')!
        .dispatchEvent(new Event('cancel', { cancelable: true })),
    )
    key('keyup', 'Escape')
    tick()
    expect(container.querySelector('dialog[open]')).toBeNull()
    expect(opening().getAttribute('data-playback')).toBe('ready')
    expect(calls.mount).not.toHaveBeenCalled()
    expect(calls.unlock).not.toHaveBeenCalled()
  })
  it('waits for a sound gesture, plays every shot, then mounts the harbor exactly once', () => {
    tick(10000)
    expect(opening().getAttribute('data-playback')).toBe('ready')
    expect(calls.unlock).not.toHaveBeenCalled()
    expect(calls.mount).not.toHaveBeenCalled()
    click('Begin with sound')
    tick(0)
    for (const [ms, shot] of [
      [3200, 'consent'],
      [3000, 'kite'],
      [4000, 'threshold'],
      [6000, 'shared'],
      [6000, 'mara'],
      [3000, 'city'],
      [5000, 'harbor'],
    ] as const) {
      tick(ms)
      expect(opening().getAttribute('data-shot')).toBe(shot)
    }
    tick(3800)
    tick()
    expect(calls.mount).toHaveBeenCalledTimes(1)
    expect(calls.dispose).toHaveBeenCalledTimes(1)
    expect(container.textContent).toBe('First harbor line')
    tick(5000)
    expect(calls.mount).toHaveBeenCalledTimes(1)
  })
  it('freezes the clock and media only when explicitly paused', () => {
    click('Watch silently')
    tick(0)
    tick(4100)
    click('Pause')
    tick(5000)
    expect(position()).toBeCloseTo(4.1)
    expect(calls.pause).toHaveBeenCalled()
    click('Resume')
    tick(0)
    tick(2000)
    expect(position()).toBeCloseTo(6.1)
    act(() => window.dispatchEvent(new Event('blur')))
    tick(1000)
    expect(position()).toBeCloseTo(7.1)
    expect(opening().getAttribute('data-playback')).toBe('playing')
    expect(JSON.parse(localStorage.getItem(audioStorageKey)!).muted).toBe(true)
  })
  it('keeps the cinematic clock and sound in sync without animation frames in a hidden tab', () => {
    click('Begin with sound')
    tick(0)
    tick(4100)
    const pauses = calls.pause.mock.calls.length
    vi.spyOn(document, 'hasFocus').mockReturnValue(false)
    vi.spyOn(document, 'hidden', 'get').mockReturnValue(true)
    act(() => {
      window.dispatchEvent(new Event('blur'))
      document.dispatchEvent(new Event('visibilitychange'))
      now += 2000
      vi.advanceTimersByTime(2000)
    })
    expect(position()).toBeCloseTo(6.1)
    expect(calls.update).toHaveBeenLastCalledWith(6.1)
    expect(calls.pause).toHaveBeenCalledTimes(pauses)
    expect(opening().getAttribute('data-playback')).toBe('playing')
    vi.spyOn(document, 'hidden', 'get').mockReturnValue(false)
    vi.spyOn(document, 'hasFocus').mockReturnValue(true)
    act(() => window.dispatchEvent(new Event('focus')))
    tick(1000)
    expect(position()).toBeCloseTo(7.1)
    vi.spyOn(document, 'hidden', 'get').mockReturnValue(true)
    click('Pause')
    act(() => {
      now += 5000
      vi.advanceTimersByTime(5000)
    })
    expect(position()).toBeCloseTo(7.1)
    click('Resume')
    tick(0)
    act(() => {
      now += 28000
      vi.advanceTimersByTime(28000)
    })
    expect(calls.mount).toHaveBeenCalledTimes(1)
    expect(container.textContent).toBe('First harbor line')
    expect(vi.getTimerCount()).toBe(0)
    expect(frames.size).toBe(0)
  })
  it('consumes Escape and held keys until release before mounting gameplay', () => {
    key('keydown', 'Escape')
    tick()
    key('keydown', 'Escape', true)
    tick()
    expect(calls.mount).not.toHaveBeenCalled()
    expect(key('keyup', 'Escape').defaultPrevented).toBe(true)
    tick()
    expect(calls.mount).toHaveBeenCalledTimes(1)
    expect(calls.input).not.toHaveBeenCalled()
    key('keydown', 'Enter')
    expect(calls.input).toHaveBeenCalledTimes(1)
  })
  it('consumes skip clicks and waits for held controller buttons through release', () => {
    controller([0]) // A held from the preceding presentation must not start this one.
    expect(opening().getAttribute('data-playback')).toBe('ready')
    controller([])
    controller([1])
    tick()
    expect(calls.mount).not.toHaveBeenCalled()
    controller([])
    expect(calls.mount).toHaveBeenCalledTimes(1)
    expect(calls.input).not.toHaveBeenCalled()
  })
  it('does not send a skip pointer gesture or its synthetic click into the harbor', () => {
    const skip = [...container.querySelectorAll('button')].find((b) =>
      b.textContent?.includes('Skip'),
    )!
    act(() => {
      skip.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }))
      skip.dispatchEvent(new MouseEvent('pointerup', { bubbles: true }))
      skip.click()
    })
    expect(calls.mount).not.toHaveBeenCalled()
    tick()
    expect(calls.mount).toHaveBeenCalledTimes(1)
    expect(calls.input).not.toHaveBeenCalled()
  })
  it('lets controller confirmation toggle the focused reduced-motion checkbox', () => {
    const checkbox = container.querySelector<HTMLInputElement>('input[type="checkbox"]')!
    act(() => checkbox.focus())
    controller([])
    controller([0])
    expect(checkbox.checked).toBe(true)
    expect(opening().getAttribute('data-playback')).toBe('ready')
  })
  it('uses stills and no camera or attention animation under system reduced motion', () => {
    act(() => root.unmount())
    reduced = true
    root = createRoot(container)
    act(() => root.render(<Startup />))
    click('Leave studio')
    click('Watch silently')
    tick(0)
    tick(18000)
    expect(opening().classList.contains('opening-reduced')).toBe(true)
    expect(container.querySelector('.opening-effects')).toBeNull()
    expect(
      [...container.querySelectorAll<HTMLElement>('.opening-camera')].every(
        (el) => el.style.transform === 'none',
      ),
    ).toBe(true)
    expect(HTMLMediaElement.prototype.play).not.toHaveBeenCalled()
  })
  it('continues on the matching still when video fails, with captions and Skip intact', () => {
    click('Begin with sound')
    const clip = container.querySelector('video')!
    act(() => clip.dispatchEvent(new Event('error')))
    expect(clip.style.opacity).toBe('0')
    tick(0)
    tick(4200)
    expect(container.textContent).toContain('A little wider, then.')
    click('Skip')
    tick()
    expect(calls.mount).toHaveBeenCalledTimes(1)
  })
  it('applies saved master/effects levels to the embedded clip and keeps mute changes paused', () => {
    act(() => root.unmount())
    localStorage.setItem(
      audioStorageKey,
      JSON.stringify({ master: 0.4, effects: 0.5, muted: true }),
    )
    root = createRoot(container)
    act(() => root.render(<Startup />))
    click('Leave studio')
    const clip = container.querySelector('video')!
    expect(clip.muted).toBe(true)
    expect(clip.volume).toBeCloseTo(0.2)
    click('Begin with sound')
    expect(clip.muted).toBe(false)
    click('Sound')
    const unlocks = calls.unlock.mock.calls.length
    click('Mute sound')
    expect(clip.muted).toBe(true)
    expect(calls.unlock).toHaveBeenCalledTimes(unlocks)
    expect(opening().getAttribute('data-playback')).toBe('paused')
  })
  it('disposes media and every polling frame on Strict Mode unmount', () => {
    act(() =>
      root.render(
        <StrictMode>
          <Startup />
        </StrictMode>,
      ),
    )
    click('Leave studio')
    click('Begin with sound')
    tick()
    act(() => root.unmount())
    expect(frames.size).toBe(0)
    expect(calls.dispose).toHaveBeenCalled()
    expect(calls.mount).not.toHaveBeenCalled()
    tick(40000)
    expect(frames.size).toBe(0)
  })
})
