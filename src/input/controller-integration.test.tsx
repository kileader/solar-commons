// @vitest-environment jsdom
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../App'
import type { AudioStatus } from '../audio/HarborAudio'

// These tests exercise real UI/reducer/controller wiring; sound rendering is browser-verified.
vi.mock('../audio/HarborAudio', () => ({
  HarborAudio: class {
    constructor(private report: (status: AudioStatus) => void) {}
    configure() {}
    unlock() {
      this.report({ state: 'running', peak: 0 })
    }
    setForeground() {}
    setSpeaking() {}
    setCognitive() {}
    play() {}
    dispose() {}
  },
}))

let root: Root
let container: HTMLDivElement
let controller: Gamepad | null
let time: number
let frames: Map<number, FrameRequestCallback>
let frameId: number
let focused: boolean

function buttons(pressed: number[] = []) {
  return Array.from({ length: 17 }, (_, index) => ({
    pressed: pressed.includes(index),
    touched: pressed.includes(index),
    value: pressed.includes(index) ? 1 : 0,
  }))
}
function connect() {
  controller = {
    index: 0,
    id: 'test-pad',
    connected: true,
    mapping: 'standard',
    axes: [0, 0, 0, 0],
    buttons: buttons(),
  } as unknown as Gamepad
  tick()
}
function tick(milliseconds = 20) {
  time += milliseconds
  act(() => {
    const pending = [...frames.values()]
    frames.clear()
    pending.forEach((callback) => callback(time))
  })
}
function press(index: number) {
  controller = { ...controller!, buttons: buttons() }
  tick()
  controller = { ...controller!, buttons: buttons([index]) }
  tick()
}
function text() {
  return container.querySelector('.dialogue-text')?.textContent
}

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
  frames = new Map()
  frameId = 0
  time = 0
  controller = null
  focused = true
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    frames.set(++frameId, callback)
    return frameId
  })
  vi.stubGlobal('cancelAnimationFrame', (id: number) => frames.delete(id))
  Object.defineProperty(navigator, 'getGamepads', { configurable: true, value: () => [controller] })
  vi.spyOn(document, 'hasFocus').mockImplementation(() => focused)
  vi.stubGlobal('matchMedia', () => ({
    matches: false,
    addEventListener() {},
    removeEventListener() {},
  }))
  Object.defineProperty(window, 'matchMedia', { configurable: true, value: globalThis.matchMedia })
  vi.spyOn(HTMLElement.prototype, 'getClientRects').mockImplementation(function (
    this: HTMLElement,
  ) {
    const dialog = this.closest('dialog')
    return (dialog && !dialog.open ? [] : [{ width: 100, height: 30 }]) as unknown as DOMRectList
  })
  Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
    configurable: true,
    value: () => {},
  })
  Object.defineProperty(HTMLDialogElement.prototype, 'showModal', {
    configurable: true,
    value: function (this: HTMLDialogElement) {
      this.open = true
      this.querySelector<HTMLButtonElement>('button')?.focus()
    },
  })
  Object.defineProperty(HTMLDialogElement.prototype, 'close', {
    configurable: true,
    value: function (this: HTMLDialogElement) {
      this.open = false
    },
  })
  localStorage.clear()
  container = document.createElement('div')
  document.body.append(container)
  root = createRoot(container)
  act(() => root.render(<App />))
  tick()
})

afterEach(() => {
  act(() => root.unmount())
  expect(frames.size).toBe(0)
  container.remove()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('gamepad scene integration', () => {
  it('advances exactly one real dialogue line while A is held', () => {
    connect()
    expect(text()).toContain('harbor terraces')
    press(0)
    expect(text()).toContain('feel where you’re looking')
    tick(3000)
    expect(text()).toContain('feel where you’re looking')
    press(0)
    expect(text()).toContain('Twelve years')
  })
  it('navigates choices, inspects evidence, and closes it without advancing the story', () => {
    connect()
    for (let i = 0; i < 4; i++) press(0)
    expect(container.querySelectorAll('.story-choice')).toHaveLength(2)
    tick()
    press(13)
    expect(document.activeElement?.textContent).toContain('Let me see the harbor')
    press(0)
    expect(text()).toContain('Show me how you see')
    press(0)
    press(0)
    tick()
    expect(container.querySelectorAll('.hotspot')).toHaveLength(3)
    press(0)
    expect(container.querySelector('dialog[open]')?.getAttribute('aria-labelledby')).toBe(
      'evidence-title',
    )
    expect(container.querySelector('.scene-progress')?.textContent).toBe('1 of 3 examined')
    press(1)
    expect(container.querySelector('dialog[open]')).toBeNull()
    expect(container.querySelector('.scene-progress')?.textContent).toBe('1 of 3 examined')
  })
  it('toggles perception and notes, and adjusts real volume controls in settings', () => {
    connect()
    press(2)
    expect(container.querySelector('.perception-toggle')?.getAttribute('aria-pressed')).toBe('true')
    press(3)
    expect(container.querySelector('dialog[open]')?.getAttribute('aria-labelledby')).toBe(
      'notes-title',
    )
    press(1)
    press(9)
    const master = container.querySelector<HTMLInputElement>('input[aria-label="Master volume"]')!
    master.focus()
    press(15)
    expect(master.value).toBe('80')
    press(14)
    expect(master.value).toBe('75')
    press(1)
    expect(container.querySelector('dialog[open]')).toBeNull()
  })
  it('ignores background input and held input on focus return or reconnect', () => {
    connect()
    focused = false
    press(0)
    expect(text()).toContain('harbor terraces')
    focused = true
    tick()
    expect(text()).toContain('harbor terraces')
    press(0)
    expect(text()).toContain('feel where you’re looking')
    controller = null
    tick()
    expect(container.querySelector('main')?.getAttribute('data-controller-state')).toBe('waiting')
    controller = {
      index: 0,
      id: 'test-pad',
      connected: true,
      mapping: 'standard',
      axes: [0, 0, 0, 0],
      buttons: buttons([0]),
    } as unknown as Gamepad
    tick()
    expect(text()).toContain('feel where you’re looking')
  })
})
