// @vitest-environment jsdom
import { act, StrictMode } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Startup from './Startup'

const presentation = vi.hoisted(() => ({ mount: vi.fn(), input: vi.fn() }))
// Isolate the established studio release boundary from the cinematic's own clock.
vi.mock('./components/OpeningCinematic', async () => {
  const { useEffect } = await import('react')
  return {
    OpeningCinematic: function Opening() {
      useEffect(() => {
        presentation.mount()
        document.addEventListener('keydown', presentation.input)
        document.addEventListener('click', presentation.input)
        return () => {
          document.removeEventListener('keydown', presentation.input)
          document.removeEventListener('click', presentation.input)
        }
      }, [])
      return <button>Opening</button>
    },
  }
})
vi.mock('./App', () => ({ default: () => <button>Harbor</button> }))

let root: Root
let container: HTMLDivElement
let frames: Map<number, FrameRequestCallback>
let frameId: number
let pads: Gamepad[]
function tick() {
  act(() => {
    const pending = [...frames.values()]
    frames.clear()
    pending.forEach((callback) => callback(0))
  })
}
function load() {
  act(() => container.querySelector('img')!.dispatchEvent(new Event('load')))
}
function key(type: string, repeat = false) {
  const event = new KeyboardEvent(type, {
    code: 'Enter',
    key: 'Enter',
    repeat,
    bubbles: true,
    cancelable: true,
  })
  act(() => document.dispatchEvent(event))
  return event
}
function controller(pressed: boolean, axis = 0) {
  pads = [{ index: 0, connected: true, axes: [axis], buttons: [{ pressed }] } as unknown as Gamepad]
  tick()
}
beforeEach(() => {
  vi.useFakeTimers()
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
  presentation.mount.mockClear()
  presentation.input.mockClear()
  frames = new Map()
  frameId = 0
  pads = []
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    frames.set(++frameId, callback)
    return frameId
  })
  vi.stubGlobal('cancelAnimationFrame', (id: number) => frames.delete(id))
  vi.spyOn(document, 'hasFocus').mockReturnValue(true)
  Object.defineProperty(navigator, 'getGamepads', { configurable: true, value: () => pads })
  container = document.createElement('div')
  document.body.append(container)
  root = createRoot(container)
  act(() => root.render(<Startup />))
})
afterEach(() => {
  act(() => root.unmount())
  container.remove()
  vi.useRealTimers()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('studio startup boundary', () => {
  it('waits for the image and full presentation before mounting the opening once', () => {
    act(() => vi.advanceTimersByTime(1000))
    expect(presentation.mount).not.toHaveBeenCalled()
    load()
    act(() => vi.advanceTimersByTime(2399))
    tick()
    expect(presentation.mount).not.toHaveBeenCalled()
    act(() => vi.advanceTimersByTime(1))
    tick()
    expect(presentation.mount).toHaveBeenCalledTimes(1)
    act(() => vi.advanceTimersByTime(8000))
    tick()
    expect(presentation.mount).toHaveBeenCalledTimes(1)
  })
  it('consumes keyboard skip and held repeats through release', () => {
    expect(key('keydown').defaultPrevented).toBe(true)
    load() // Image loading must not erase an in-progress skip gesture.
    tick()
    key('keydown', true)
    tick()
    expect(presentation.mount).not.toHaveBeenCalled()
    key('keyup')
    tick()
    expect(presentation.mount).toHaveBeenCalledTimes(1)
    expect(presentation.input).not.toHaveBeenCalled()
    key('keydown')
    expect(presentation.input).toHaveBeenCalledTimes(1)
  })
  it('consumes the pointer gesture and resulting click before mounting presentation', () => {
    act(() => {
      document.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, cancelable: true }))
    })
    tick()
    expect(presentation.mount).not.toHaveBeenCalled()
    act(() => {
      document.dispatchEvent(new MouseEvent('pointerup', { bubbles: true }))
      document.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
    })
    tick()
    expect(presentation.mount).toHaveBeenCalledTimes(1)
    expect(presentation.input).not.toHaveBeenCalled()
  })
  it('ignores held controller buttons and stick drift, then skips on a fresh button', () => {
    controller(true, 0.8)
    tick()
    expect(presentation.mount).not.toHaveBeenCalled()
    controller(false, -0.8)
    expect(presentation.mount).not.toHaveBeenCalled()
    controller(true)
    tick()
    expect(presentation.mount).toHaveBeenCalledTimes(1)
  })
  it('does not leave stale polling or timers under Strict Mode or unmount', () => {
    act(() =>
      root.render(
        <StrictMode>
          <Startup />
        </StrictMode>,
      ),
    )
    load()
    act(() => root.unmount())
    act(() => vi.advanceTimersByTime(10000))
    tick()
    expect(frames.size).toBe(0)
    expect(presentation.mount).not.toHaveBeenCalled()
  })
})
