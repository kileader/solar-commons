// @vitest-environment jsdom
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../App'
import { clues } from '../content/harbor'
import type { AudioStatus } from '../audio/HarborAudio'
import recordedScript from '../../dialogue/script.json'
import { quietIndexApproaches } from '../content/quietIndex'

const passageCue = vi.hoisted(() => vi.fn())

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
    setPassage = passageCue
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
  passageCue.mockClear()
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
  it.each(clues)(
    'speaks only the displayed character passage in $id evidence, including when reopened',
    (clue) => {
      vi.useFakeTimers()
      try {
        const clips: HTMLMediaElement[] = []
        const visibleAtPlay: (string | null | undefined)[] = []
        vi.mocked(HTMLMediaElement.prototype.play).mockImplementation(function (
          this: HTMLMediaElement,
        ) {
          clips.push(this)
          visibleAtPlay.push(container.querySelector('dialog[open] .reader-text')?.textContent)
          return Promise.resolve()
        })
        const click = (selector: string) =>
          act(() => container.querySelector<HTMLButtonElement>(selector)!.click())
        const select = (id: string) =>
          act(() => {
            const control = container.querySelector<HTMLSelectElement>('dialog[open] select')!
            control.value = id
            control.dispatchEvent(new Event('change', { bubbles: true }))
          })
        for (let i = 0; i < 4; i++) click('.continue-button')
        click('.story-choice')
        click('.continue-button')
        click('.continue-button')
        const before = clips.length
        click(`.hotspot-${clue.id}`)
        expect(clips).toHaveLength(before)
        select('modeled')
        select('uncertain')
        expect(clips).toHaveLength(before)
        const [mara, kite] = clue.dialogue
        select(mara.id)
        const first = clips.at(-1)!
        expect(first.src).toContain(mara.id)
        expect(visibleAtPlay.at(-1)).toBe(mara.text)
        const staleEnd = first.onended!
        act(() => first.dispatchEvent(new Event('ended')))
        act(() => vi.advanceTimersByTime(60000))
        expect(clips).toHaveLength(before + 1)
        // Enabling Auto after a line ends waits the normal gap, then shows Kite before speaking.
        click('dialog[open] [aria-label="Autoplay reading"]')
        act(() => vi.advanceTimersByTime(999))
        expect(clips).toHaveLength(before + 1)
        act(() => vi.advanceTimersByTime(1))
        expect(clips.at(-1)!.src).toContain(kite.id)
        expect(visibleAtPlay.at(-1)).toBe(kite.text)
        select('observed')
        expect(container.querySelector('main')?.dataset.voiceLine).toBe('')
        const after = clips.length
        act(() => staleEnd.call(first, new Event('ended')))
        act(() => vi.advanceTimersByTime(60000))
        expect(clips).toHaveLength(after)
        click('[aria-label="Close evidence"]')
        const beforeReopen = clips.length
        click(`.hotspot-${clue.id}`)
        expect(clips).toHaveLength(beforeReopen)
        expect(container.querySelector<HTMLSelectElement>('dialog[open] select')!.value).toBe(
          'observed',
        )
      } finally {
        vi.useRealTimers()
      }
    },
  )

  it.each(clues)('retains the $id schematic while paging through its evidence', (clue) => {
    const click = (selector: string) => {
      act(() => container.querySelector<HTMLButtonElement>(selector)!.click())
      tick()
    }
    for (let i = 0; i < 4; i++) click('.continue-button')
    click('.story-choice')
    click('.continue-button')
    click('.continue-button')
    click(`.hotspot-${clue.id}`)
    const diagram = container.querySelector('dialog[open] .evidence-diagram')!
    expect(diagram).toBeTruthy()
    expect(diagram.getAttribute('role')).toBe('img')
    expect(diagram.getAttribute('aria-label')).toBe(clue.subtitle)
    expect(container.querySelector('.evidence-figure figcaption')?.textContent).toBe(clue.subtitle)
    expect(container.querySelector('dialog[open] .reader-heading')?.textContent).toBe(
      clue.observation.label,
    )
    click('dialog[open] [aria-label="Next page"]')
    expect(container.querySelector('dialog[open] .reader-heading')?.textContent).toBe(
      clue.model.label,
    )
    expect(container.querySelector('dialog[open] .evidence-diagram')).toBe(diagram)
    expect(container.querySelector('main')?.dataset.phase).toBe('investigation')
    expect(container.querySelector('.scene-progress')?.textContent).toBe('1 of 3 examined')
  })

  it('keeps the current step and choices available without scrolling or selecting one', () => {
    const scroll = vi.spyOn(HTMLElement.prototype, 'scrollIntoView')
    const click = (selector: string) => {
      act(() => container.querySelector<HTMLButtonElement>(selector)!.click())
      tick()
    }
    expect(container.querySelector('.scene-status')?.textContent).toContain('At the harbor')
    for (let i = 0; i < 4; i++) click('.continue-button')
    expect(container.querySelector('.scene-status')?.textContent).toContain('Your choice')
    expect(scroll).not.toHaveBeenCalled()
    expect(container.querySelector('.scene-jump')).toBeNull()
    expect(document.activeElement).toBe(container.querySelector('.story-choice'))
    expect(container.querySelectorAll('.story-choice')).toHaveLength(2)
    click('[aria-label^="Open field notes"]')
    expect(container.querySelector('dialog[open] .modal-step')?.textContent).toContain(
      'Your choice',
    )
    click('[aria-label="Close field notes"]')
    expect(container.querySelectorAll('.story-choice')).toHaveLength(2)
    click('.story-choice')
    click('.continue-button')
    click('.continue-button')
    expect(container.querySelector('.scene-status')?.textContent).toContain('0/3 readings')
    click('.hotspot')
    expect(container.querySelector('.scene-status')?.textContent).toContain('1/3 readings')
    expect(container.querySelector('dialog[open] .modal-step')?.textContent).toContain(
      'Harbor investigation',
    )
    click('[aria-label="Close evidence"]')
    expect(scroll).not.toHaveBeenCalled()
    expect(container.querySelector('.scene-progress')?.textContent).toBe('1 of 3 examined')
  })

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
        const line = recordedScript.find((line) => line.text === text())
        expect(line, 'The displayed passage has an authored recording').toBeTruthy()
        expectSpeaker(line!.speaker)
        clickButton('.continue-button')
      }
    }
    function expectSpeaker(speaker: string) {
      expect(container.querySelector('.speaker-name')!.textContent).toBe(
        speaker === 'Narrator' ? 'NARRATION' : speaker,
      )
      expect(!!container.querySelector('.companion-portrait')).toBe(speaker !== 'Narrator')
      if (speaker !== 'Narrator')
        expect(
          container.querySelector(`.companion-portrait.speaker-${speaker.toLowerCase()}`),
        ).toBeTruthy()
    }
    function selectReading(id: string) {
      const select = container.querySelector<HTMLSelectElement>('dialog[open] select')!
      act(() => {
        select.value = id
        select.dispatchEvent(new Event('change', { bubbles: true }))
      })
      tick()
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
    expectSpeaker('Narrator')
    expect(container.querySelector('.chapter-complete-badge')).toBeNull()
    clickText('Visit the Hall of Waters')
    expect(latestClip().src).toContain('museum-arrival-0')
    finishLines()
    clickButton(`.story-choice:nth-child(${route.approach + 1})`)
    expect(latestClip().src).toContain(route.approach === 0 ? 'museum-memory-0' : 'museum-signal-0')
    finishLines()
    expectSpeaker('Narrator')
    clickButton('[aria-label="Listen to the gallery description"]')
    expect(latestClip().src).toContain('museum-gallery')
    endClip()
    expect(
      container.querySelector('[aria-label="Stop reading the gallery description"]'),
    ).toBeNull()
    clickText('Read the history wall')
    expect(container.querySelector('dialog[open]')?.textContent).toContain('Whose ending?')
    expect(container.querySelector('dialog[open] .modal-step')?.textContent).toContain(
      'Tide gallery',
    )
    // Each recording has a visible passage; Auto off never queues hidden paragraphs.
    selectReading('section-0')
    clickButton('[aria-label="Listen to Before the water"]')
    expect(latestClip().src).toContain('exhibit-0-heading')
    const readingClip = latestClip()
    focused = false
    act(() => window.dispatchEvent(new Event('blur')))
    endClip()
    expect(latestClip()).toBe(readingClip)
    expect(readingClip.src).toContain('exhibit-0-heading')
    focused = true
    act(() => window.dispatchEvent(new Event('focus')))
    selectReading('section-0-0')
    clickButton('[aria-label="Listen to Before the water, passage 1"]')
    expect(latestClip().src).toContain('exhibit-0-0')
    endClip()
    selectReading('section-0-1')
    clickButton('[aria-label="Listen to Before the water, passage 2"]')
    expect(latestClip().src).toContain('exhibit-0-1')
    endClip()
    expect(
      container.querySelector('[aria-label="Stop reading Before the water, passage 2"]'),
    ).toBeNull()
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval'] })
    try {
      // Optional Auto turns to the next recording only after its passage is on screen.
      selectReading('section-0')
      clickButton('[aria-label="Autoplay reading"]')
      clickButton('[aria-label="Listen to Before the water"]')
      endClip()
      act(() => vi.advanceTimersByTime(999))
      expect(latestClip().src).toContain('exhibit-0-heading')
      act(() => vi.advanceTimersByTime(1))
      expect(latestClip().src).toContain('exhibit-0-0')
      expect(container.querySelector<HTMLSelectElement>('dialog[open] select')!.value).toBe(
        'section-0-0',
      )
      expect(container.querySelector('dialog[open] .reader-text')!.textContent).toContain(
        'Before the Unbinding, Larkhaven’s pumps',
      )
      clickButton('[aria-label="Autoplay reading"]')
    } finally {
      vi.useRealTimers()
    }
    selectReading('introduction')
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
      clickText('Leave the model for now')
      expectSpeaker('Narrator')
      expect(container.querySelector('.chapter-complete-badge')).toBeNull()
      expect(container.querySelector('.scene-status')!.textContent).toBe('Museum visit paused')
      clickText('Revisit the tide model')
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
    expectSpeaker('Narrator')
    expect(container.querySelector('.chapter-complete-badge')!.textContent).toContain(
      'Chapter One complete',
    )
    expect(container.querySelector('.chapter-end-note')!.textContent).toContain(
      'nocturnal district',
    )
    expect(container.querySelector('.next-lead')!.textContent).toMatch(/^Investigation focus:/)
    expect(container.querySelector('.museum-actions')!.textContent).toContain(
      'Continue to The Quiet Index',
    )
    clickButton('.record-button')
    clickButton('[aria-label="Listen to the handover record"]')
    expect(latestClip().src).toContain('refuge-record')
    clickButton('[aria-label="Stop reading the handover record"]')
    clickButton('[aria-label="Close handover record"]')
    clickButton('[aria-label="Listen to the chapter epilogue"]')
    expect(latestClip().src).toContain('museum-completion')
    expectSpeaker('Narrator')
    clickText('Review field notes')
    expect(container.querySelectorAll('dialog[open] select option')).toHaveLength(7)
    selectReading('approach')
    expect(container.querySelector('dialog[open]')!.textContent).toContain(route.note)
    selectReading('refuge')
    expect(container.querySelector('.notes-modal .reader-text')!.textContent).toContain(
      'Ferry clear. Refuge held from within.',
    )
    selectReading('lead')
    expect(container.querySelector('dialog[open] .reader-heading')!.textContent).toContain(
      'Next step:',
    )
  })

  it.each(quietIndexApproaches)(
    'plays the recorded $id encounter with real controls, passage sounds, and retained notes',
    (approach) => {
      const clips = vi.mocked(HTMLMediaElement.prototype.play)
      const chapterClips: { clip: HTMLAudioElement; url: string }[] = []
      clips.mockImplementation(function (this: HTMLMediaElement) {
        if (this instanceof HTMLAudioElement && this.src.includes('/qi-'))
          chapterClips.push({ clip: this, url: this.src })
        return Promise.resolve()
      })
      const click = (selector: string) => {
        const button = container.querySelector<HTMLButtonElement>(selector)
        expect(button, selector).toBeTruthy()
        act(() => button!.click())
        tick()
      }
      const clickText = (label: string) => {
        const button = [...container.querySelectorAll<HTMLButtonElement>('button')].find(
          (button) =>
            button.textContent?.includes(label) &&
            (!button.closest('dialog') || button.closest('dialog')!.open),
        )
        expect(button, label).toBeTruthy()
        act(() => button!.click())
        tick()
      }
      const finish = () => {
        let count = 0
        while (
          container.querySelector('.continue-button') ||
          container.querySelector('main')?.dataset.phase === 'qi-intro-shot'
        ) {
          if (++count > 100) throw new Error('UI failed to reach a choice or chapter ending')
          if (
            container.querySelector('main')?.dataset.phase === 'qi-intro-shot' &&
            !container.querySelector('.continue-button')
          ) {
            clickText('Skip introduction')
            continue
          }
          click('.continue-button')
        }
      }
      finish()
      click('.story-choice')
      finish()
      for (const clue of clues) {
        click(`.hotspot-${clue.id}`)
        click('[aria-label="Close evidence"]')
      }
      clickText('Decide together')
      click('.story-choice')
      finish()
      clickText('Visit the Hall of Waters')
      finish()
      click('.story-choice')
      finish()
      clickText('Follow the written dawn account')
      finish()
      click('.story-choice')
      finish()
      clickText('Continue to The Quiet Index')
      expect(container.querySelector('main')?.dataset.phase).toBe('qi-arrival')
      expect(container.querySelector('h1')?.textContent).toBe('The Quiet Index')
      expect(container.querySelector('.harbor-background')?.getAttribute('src')).toContain(
        'nocturnal_canal.webp',
      )
      expect(chapterClips.at(-1)?.url).toContain('qi-arrival-01.mp3')
      expect(passageCue).toHaveBeenLastCalledWith('qi-arrival-01')
      const before = clips.mock.instances.filter(
        (element) => element instanceof HTMLAudioElement,
      ).length
      if (approach.id === 'analysis') {
        vi.useFakeTimers()
        try {
          click('.auto-toggle')
          const first = chapterClips.at(-1)!.clip
          act(() => first.dispatchEvent(new Event('playing')))
          act(() => vi.advanceTimersByTime(60000))
          expect(container.querySelector('main')?.dataset.voiceLine).toBe('qi-arrival-01')
          act(() => first.dispatchEvent(new Event('ended')))
          act(() => vi.advanceTimersByTime(999))
          expect(container.querySelector('main')?.dataset.voiceLine).toBe('qi-arrival-01')
          act(() => vi.advanceTimersByTime(1))
          expect(container.querySelector('main')?.dataset.voiceLine).toBe('qi-arrival-02')
          click('.auto-toggle')
        } finally {
          vi.useRealTimers()
        }
      }
      let count = 0
      while (!container.querySelector('.ilex-portrait')) {
        if (++count > 12) throw new Error('Ilex portrait did not appear')
        if (container.querySelector('main')?.dataset.phase === 'qi-intro-shot') {
          connect()
          press(1)
          expect(container.querySelector('main')?.dataset.voiceLine).toBe('qi-intro-01')
          tick(3000)
          expect(container.querySelector('main')?.dataset.voiceLine).toBe('qi-intro-01')
          continue
        }
        click('.continue-button')
      }
      expect(container.querySelector('.ilex-portrait')?.getAttribute('src')).toContain(
        'ilex_dialogue_avatar.png',
      )
      expect(container.querySelector('.harbor-background')?.getAttribute('src')).toContain(
        'quiet_index.webp',
      )
      expect(container.querySelector('.speaker-name')?.textContent).toBe('Ilex')
      const beforeInspection = container.querySelector('main')?.dataset.voiceLine
      click('.perception-toggle')
      expect(container.querySelector('.cognitive-scene .cognitive-sketch')).toBeTruthy()
      expect(container.querySelector('.cognitive-scene')?.textContent).toContain(
        'A voice, with boundaries',
      )
      // Preserve the manually sampled controller frames while advancing dialogue timers.
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
      try {
        click('.auto-toggle')
        if (approach.id === 'empathy') {
          connect()
          act(() => container.querySelector<HTMLButtonElement>('.cognitive-focus')!.focus())
          press(0)
        } else click('.cognitive-focus')
        expect(container.querySelector('dialog[open] .reader-text')?.textContent).toContain(
          'Interpretation',
        )
        expect(container.querySelector('dialog[open] .reader-text')?.textContent).toContain(
          'Still uncertain',
        )
        expect(passageCue).toHaveBeenLastCalledWith(null)
        act(() => vi.advanceTimersByTime(60000))
        expect(container.querySelector('main')?.dataset.voiceLine).toBe(beforeInspection)
        click('[aria-label="Close shared traces"]')
        expect(passageCue).toHaveBeenLastCalledWith(beforeInspection)
        click('.auto-toggle')
      } finally {
        vi.useRealTimers()
      }
      click('.perception-toggle')
      expect(container.querySelector('.cognitive-scene')).toBeNull()
      finish()
      expect(container.querySelectorAll('.story-choice')).toHaveLength(3)
      expect(container.querySelector('.archive-waveform')?.textContent).toContain(
        'Illustrative waveform',
      )
      vi.useFakeTimers()
      try {
        act(() =>
          document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', bubbles: true })),
        )
        act(() => vi.advanceTimersByTime(60000))
        expect(container.querySelector('main')?.dataset.phase).toBe('qi-approach-choice')
        act(() =>
          document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', bubbles: true })),
        )
      } finally {
        vi.useRealTimers()
      }
      const index = quietIndexApproaches.indexOf(approach)
      if (approach.id === 'empathy') {
        connect()
        act(() => container.querySelector<HTMLButtonElement>('.story-choice')!.focus())
        press(15)
        expect(document.activeElement?.textContent).toContain('Empathy')
        press(0)
      } else {
        act(() =>
          document.body.dispatchEvent(
            new KeyboardEvent('keydown', { key: String(index + 1), bubbles: true }),
          ),
        )
      }
      expect(container.querySelector('main')?.dataset.voiceLine).toBe(`qi-${approach.id}-01`)
      while (container.querySelector('main')?.dataset.voiceLine !== 'qi-play-04')
        click('.continue-button')
      expect(container.querySelector('.speaker-name')?.textContent).toBe(
        'Unknown speaker (recording)',
      )
      expect(container.querySelector('.companion-portrait')).toBeNull()
      expect(text()).toContain('She can hear you')
      expect(container.querySelector<HTMLButtonElement>('.voice-replay')!.disabled).toBe(false)
      expect(chapterClips.at(-1)?.url).toContain('qi-play-04.mp3')
      expect(passageCue).toHaveBeenLastCalledWith('qi-play-04')
      const excerpt = chapterClips.at(-1)!.clip
      click('.voice-replay')
      expect(excerpt.onended).toBeNull()
      expect(excerpt.getAttribute('src')).toBeNull()
      expect(chapterClips.at(-1)?.url).toContain('qi-play-04.mp3')
      expect(
        clips.mock.instances.filter((element) => element instanceof HTMLAudioElement).length,
      ).toBeGreaterThan(before)
      finish()
      expect(container.querySelector('main')?.dataset.phase).toBe('qi-complete')
      expect(passageCue).toHaveBeenLastCalledWith(null)
      for (const id of ['qi-intro-05', 'qi-record-01', 'qi-play-03', 'qi-play-05', 'qi-end-04'])
        expect(passageCue).toHaveBeenCalledWith(id)
      for (const other of quietIndexApproaches.filter((choice) => choice.id !== approach.id))
        expect(chapterClips.some(({ url }) => url.includes(`/qi-${other.id}-`))).toBe(false)
      expect(container.querySelector('.chapter-complete-badge')?.textContent).toContain(
        'Chapter Two complete',
      )
      expect(container.querySelector('.quiet-index-summary')?.textContent).toContain(
        `Your approach: ${approach.label}`,
      )
      expect(container.querySelector('.next-lead')?.textContent).toContain(
        'Follow the listening line.',
      )
      clickText('Review field notes')
      const options = [...container.querySelectorAll<HTMLOptionElement>('dialog[open] option')].map(
        (option) => option.value,
      )
      expect(options).toContain('approach')
      expect(options).toContain(`qi-${approach.id}`)
      expect(options).toContain('qi-excerpt')
      click('[aria-label="Close field notes"]')
      clickText('Revisit the Hall of Waters')
      expect(container.querySelector('main')?.dataset.phase).toBe('museum-complete')
      clickText('Continue to The Quiet Index')
      expect(container.querySelector('main')?.dataset.phase).toBe('qi-arrival')
    },
  )

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
    expect(container.querySelector('.speaker-name')!.textContent).toBe('YOUR CHOICE')
    expect(container.querySelector('.companion-portrait')).toBeNull()
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
