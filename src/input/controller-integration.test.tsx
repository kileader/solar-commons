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
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue()
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {})
  vi.spyOn(HTMLMediaElement.prototype, 'load').mockImplementation(() => {})
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

describe('scene input integration', () => {
  it('keeps voice and Auto running across focus changes without restarting a recording', () => {
    vi.useFakeTimers()
    try {
      const clips: HTMLMediaElement[] = []
      vi.mocked(HTMLMediaElement.prototype.play).mockImplementation(function (
        this: HTMLMediaElement,
      ) {
        clips.push(this)
        return Promise.resolve()
      })
      const hidden = vi.spyOn(document, 'hidden', 'get').mockReturnValue(false)
      const wait = (ms: number) => act(() => vi.advanceTimersByTime(ms))
      act(() => container.querySelector<HTMLButtonElement>('.auto-toggle')!.click())
      const first = clips.at(-1)!
      act(() => first.dispatchEvent(new Event('playing')))
      expect(container.querySelector('main')?.dataset.voiceState).toBe('speaking')
      vi.mocked(HTMLMediaElement.prototype.pause).mockClear()
      focused = false
      act(() => window.dispatchEvent(new Event('blur')))
      hidden.mockReturnValue(true)
      act(() => document.dispatchEvent(new Event('visibilitychange')))
      wait(60000)
      expect(container.querySelector('main')?.dataset.voiceState).toBe('speaking')
      expect(HTMLMediaElement.prototype.pause).not.toHaveBeenCalled()
      expect(clips).toHaveLength(1)
      expect(first.src).toContain('arrival')
      act(() => first.dispatchEvent(new Event('ended')))
      wait(999)
      expect(text()).toContain('harbor terraces')
      wait(1)
      expect(text()).toContain('feel where you’re looking')
      expect(clips).toHaveLength(2)
      const second = clips.at(-1)!
      act(() => second.dispatchEvent(new Event('playing')))
      hidden.mockReturnValue(false)
      focused = true
      act(() => {
        document.dispatchEvent(new Event('visibilitychange'))
        window.dispatchEvent(new Event('focus'))
      })
      expect(clips).toHaveLength(2)
      expect(second.src).toContain('integration')
      expect(container.querySelector('main')?.dataset.voiceState).toBe('speaking')
      // Focus changes during the gap must not restart its countdown either.
      act(() => second.dispatchEvent(new Event('ended')))
      wait(900)
      focused = false
      act(() => window.dispatchEvent(new Event('blur')))
      wait(100)
      expect(text()).toContain('Twelve years')
      act(() => container.querySelector<HTMLButtonElement>('.auto-toggle')!.click())
    } finally {
      vi.useRealTimers()
    }
  })

  it('autoplays recorded lines after the gap and waits for choices and evidence input', () => {
    vi.useFakeTimers()
    try {
      const clips: HTMLMediaElement[] = []
      vi.mocked(HTMLMediaElement.prototype.play).mockImplementation(function (
        this: HTMLMediaElement,
      ) {
        clips.push(this)
        return Promise.resolve()
      })
      const click = (selector: string) =>
        act(() => container.querySelector<HTMLButtonElement>(selector)!.click())
      const wait = (ms: number) => act(() => vi.advanceTimersByTime(ms))
      const end = () => act(() => clips.at(-1)!.dispatchEvent(new Event('ended')))
      click('.auto-toggle')
      expect(container.querySelector('main')?.dataset.voiceState).toBe('loading')
      wait(60000)
      expect(text()).toContain('harbor terraces')
      for (let i = 0; i < 4; i++) {
        end()
        wait(999)
        expect(container.querySelector('.story-choice')).toBeNull()
        wait(1)
      }
      expect(container.querySelectorAll('.story-choice')).toHaveLength(2)
      wait(60000)
      expect(container.querySelectorAll('.story-choice')).toHaveLength(2)
      click('.story-choice')
      end()
      wait(1000)
      end()
      wait(1000)
      expect(container.querySelectorAll('.hotspot')).toHaveLength(3)
      wait(60000)
      expect(container.querySelectorAll('.hotspot')).toHaveLength(3)
      click('.hotspot')
      end()
      end()
      wait(60000)
      expect(container.querySelector('dialog[open]')).toBeTruthy()
    } finally {
      vi.useRealTimers()
    }
  })
  it('cancels Auto while settings are open and resumes the same line when closed', () => {
    vi.useFakeTimers()
    try {
      const clips: HTMLMediaElement[] = []
      vi.mocked(HTMLMediaElement.prototype.play).mockImplementation(function (
        this: HTMLMediaElement,
      ) {
        clips.push(this)
        return Promise.resolve()
      })
      act(() => container.querySelector<HTMLButtonElement>('.auto-toggle')!.click())
      act(() => clips.at(-1)!.dispatchEvent(new Event('ended')))
      act(() => vi.advanceTimersByTime(900))
      act(() => container.querySelector<HTMLButtonElement>('[aria-label="Open settings"]')!.click())
      act(() => vi.advanceTimersByTime(60000))
      expect(text()).toContain('harbor terraces')
      act(() =>
        container.querySelector<HTMLButtonElement>('[aria-label="Close settings"]')!.click(),
      )
      expect(container.querySelector('main')?.dataset.voiceState).toBe('loading')
      act(() => clips.at(-1)!.dispatchEvent(new Event('ended')))
      act(() => vi.advanceTimersByTime(1000))
      expect(text()).toContain('feel where you’re looking')
      act(() => container.querySelector<HTMLButtonElement>('.auto-toggle')!.click())
    } finally {
      vi.useRealTimers()
    }
  })
  it.each([
    { approach: 0, reading: true, note: 'Names after the last ferry', lead: 1 },
    { approach: 1, reading: false, note: 'A line held from below', lead: 0 },
  ])('plays the museum through its real UI (approach $approach, reading $reading)', (route) => {
    const clips: HTMLMediaElement[] = []
    const playedUrls: string[] = []
    vi.mocked(HTMLMediaElement.prototype.play).mockImplementation(function (
      this: HTMLMediaElement,
    ) {
      clips.push(this)
      playedUrls.push(this.src)
      return Promise.resolve()
    })
    const latestClip = () => clips.at(-1)!
    const endClip = () => act(() => latestClip().dispatchEvent(new Event('ended')))
    function clickButton(selector: string) {
      const button = container.querySelector<HTMLButtonElement>(selector)
      expect(button, selector).toBeTruthy()
      act(() => button!.click())
      tick()
    }
    function clickText(label: string) {
      const button = [...container.querySelectorAll<HTMLButtonElement>('button')].find(
        (button) =>
          button.textContent?.includes(label) &&
          (!button.closest('dialog') || button.closest('dialog')!.open),
      )
      expect(button, label).toBeTruthy()
      act(() => button!.click())
      tick()
    }
    function finishLines() {
      let count = 0
      while (container.querySelector('.continue-button')) {
        if (++count > 30) throw new Error('UI failed to reach a choice')
        clickButton('.continue-button')
      }
    }
    finishLines()
    clickButton('.story-choice')
    finishLines()
    for (const clue of ['geometry', 'thermal', 'archive']) {
      clickButton(`.hotspot-${clue}`)
      clickButton('[aria-label="Close evidence"]')
    }
    clickText('Decide together')
    clickButton('.story-choice:nth-child(2)')
    finishLines()
    clickText('Visit the Hall of Waters')
    expect(latestClip().src).toContain('museum-arrival-0')
    finishLines()
    clickButton(`.story-choice:nth-child(${route.approach + 1})`)
    expect(latestClip().src).toContain(route.approach === 0 ? 'museum-memory-0' : 'museum-signal-0')
    finishLines()
    clickButton('[aria-label="Listen to the gallery description"]')
    expect(latestClip().src).toContain('museum-gallery')
    endClip()
    expect(
      container.querySelector('[aria-label="Stop reading the gallery description"]'),
    ).toBeNull()
    clickText('Read the history wall')
    expect(container.querySelector('dialog[open]')?.textContent).toContain('Whose ending?')
    // Exhibit narration is opt-in, sequential, and never advances the scene.
    clickButton('[aria-label="Listen to Before the water"]')
    expect(latestClip().src).toContain('exhibit-0-heading')
    const readingClip = latestClip()
    focused = false
    act(() => window.dispatchEvent(new Event('blur')))
    endClip()
    expect(latestClip().src).toContain('exhibit-0-0')
    expect(readingClip.src).toContain('exhibit-0-heading')
    focused = true
    act(() => window.dispatchEvent(new Event('focus')))
    endClip()
    expect(latestClip().src).toContain('exhibit-0-1')
    endClip()
    expect(container.querySelector('[aria-label="Stop reading Before the water"]')).toBeNull()
    clickButton('[aria-label="Listen to the exhibit introduction"]')
    const abandonedClip = latestClip()
    const abandonedEnd = abandonedClip.onended!
    clickButton('[aria-label="Close history exhibit"]')
    const afterClose = clips.length
    act(() => abandonedEnd.call(abandonedClip, new Event('ended')))
    expect(clips).toHaveLength(afterClose)
    if (route.reading) clickText('Follow the written dawn account')
    else {
      clickText('Try the tide model')
      finishLines()
      clickButton('[aria-label="Listen to the flood explanation"]')
      expect(latestClip().src).toContain('model-0-closed')
      clickButton('.gate-control')
      expect(
        container.querySelector('[aria-label="Stop reading the flood explanation"]'),
      ).toBeNull()
      clickButton('[aria-label="Listen to the flood explanation"]')
      expect(latestClip().src).toContain('model-0-open')
      connect()
      press(15)
      press(15)
      expect(document.activeElement?.textContent).toContain('Dawn')
      press(0)
      expect(container.querySelector('.model-moment[aria-pressed="true"]')?.textContent).toContain(
        'Dawn',
      )
      clickButton('[aria-label="Listen to the flood explanation"]')
      expect(latestClip().src).toContain('model-2-closed')
      clickButton('.lamp-discovery')
    }
    expect(latestClip().src).toContain(
      route.reading ? 'museum-discovery-0--v1' : 'museum-discovery-0--v3',
    )
    finishLines()
    expect(playedUrls.at(-1)).toContain(
      route.approach === 0 ? 'museum-discovery-11--v1' : 'museum-discovery-11--v2',
    )
    clickButton(`.story-choice:nth-child(${route.lead + 1})`)
    finishLines()
    expect(container.querySelector('.museum-summary')?.textContent).toContain(
      'The city left a line open.',
    )
    clickButton('[aria-label="Listen to the handover record"]')
    expect(latestClip().src).toContain('refuge-record')
    clickButton('[aria-label="Stop reading the handover record"]')
    clickButton('[aria-label="Listen to the chapter epilogue"]')
    expect(latestClip().src).toContain('museum-completion')
    clickText('Review field notes')
    const notes = container.querySelector('dialog[open]')!.textContent
    expect(notes).toContain(route.note)
    expect(notes).toContain('Ferry clear. Refuge held from within.')
    expect(notes).toContain('Next step:')
    expect(container.querySelectorAll('.note-list article')).toHaveLength(7)
  })

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
  it('shows narration without a character portrait and restores each actual speaker', () => {
    connect()
    expect(container.querySelector('.speaker-name')?.textContent).toBe('NARRATION')
    expect(container.querySelector('.companion-portrait')).toBeNull()
    expect(container.querySelector('.dialogue-text .narration')).toBeTruthy()
    press(0)
    expect(container.querySelector('.speaker-name')?.textContent).toBe('Mara')
    expect(container.querySelector('.companion-portrait .mara-portrait')).toBeTruthy()
    press(0)
    expect(container.querySelector('.speaker-name')?.textContent).toBe('Kite')
    expect(container.querySelector('.companion-portrait .kite-portrait')).toBeTruthy()
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
    const soundSection = [
      ...container.querySelectorAll<HTMLButtonElement>('.settings-sections button'),
    ].find((button) => button.textContent === 'Sound')!
    soundSection.focus()
    press(0)
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
