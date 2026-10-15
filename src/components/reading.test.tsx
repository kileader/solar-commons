// @vitest-environment jsdom
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { PagedReader } from './PagedReader'
import { DialogueReader } from './DialogueReader'
import { defaultReadingPreferences } from '../reading/preferences'
import type { useAudio } from '../hooks/useAudio'

let root: Root
let container: HTMLDivElement
let height: number
beforeEach(() => {
  vi.useFakeTimers()
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) =>
    setTimeout(() => callback(performance.now()), 16),
  )
  vi.stubGlobal('cancelAnimationFrame', clearTimeout)
  height = 62
  vi.spyOn(HTMLParagraphElement.prototype, 'clientWidth', 'get').mockReturnValue(200)
  vi.spyOn(HTMLParagraphElement.prototype, 'clientHeight', 'get').mockImplementation(() => height)
  vi.spyOn(HTMLParagraphElement.prototype, 'getBoundingClientRect').mockImplementation(function (
    this: HTMLParagraphElement,
  ) {
    return { height: Math.ceil((this.textContent?.length ?? 0) / 20) * 20 } as DOMRect
  })
  container = document.createElement('div')
  document.body.append(container)
  root = createRoot(container)
})
afterEach(() => {
  act(() => root.unmount())
  container.remove()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  vi.useRealTimers()
})
function click(selector: string) {
  act(() => container.querySelector<HTMLButtonElement>(selector)!.click())
}
const text =
  'The tide rose above the gate. Nobody answered the shore station. The refuge lamp remained lit after the last ferry.'

it('keeps a requested page turn when a resize arrives before React commits it', () => {
  act(() => root.render(<PagedReader entries={[{ id: 'a', title: 'Testimony', text }]} />))
  const first = container.querySelector('.reader-text')!.textContent
  act(() => {
    container.querySelector<HTMLButtonElement>('[aria-label="Next page"]')!.click()
    window.dispatchEvent(new Event('resize'))
    vi.runOnlyPendingTimers()
  })
  expect(container.querySelector('.reader-text')!.textContent).not.toBe(first)
  expect(container.querySelector('[aria-label="Previous page"]')?.hasAttribute('disabled')).toBe(
    false,
  )
})

it('turns every exhibit page, jumps sections, and preserves the reading position on resize', () => {
  const changed = vi.fn()
  act(() =>
    root.render(
      <PagedReader
        entries={[
          { id: 'a', title: 'Testimony', text },
          { id: 'b', title: 'Source', text: 'An incomplete handover log.' },
        ]}
        onSectionChange={changed}
      />,
    ),
  )
  let collected = ''
  while (container.querySelector('.reader-heading')?.textContent === 'Testimony') {
    collected += container.querySelector('.reader-text')!.textContent
    click('[aria-label="Next page"]')
  }
  expect(collected).toBe(text)
  expect(changed).toHaveBeenCalledTimes(1)
  height = 42
  act(() => {
    window.dispatchEvent(new Event('resize'))
    vi.runOnlyPendingTimers()
  })
  expect(container.querySelector('select')?.value).toBe('b')
  expect(container.querySelector('.reader-text')?.textContent).toBe('An incomplete handover log.')
  const select = container.querySelector('select')!
  act(() => {
    select.value = 'a'
    select.dispatchEvent(new Event('change', { bubbles: true }))
  })
  expect(container.querySelector('.reader-text')?.textContent).toBe(
    text.slice(0, 40).replace(/\s+\S*$/, ' '),
  )
})

it('keeps one recorded line in one scrollable passage and waits for its ending plus the Auto gap', () => {
  const advance = vi.fn()
  const replay = vi.fn()
  const audio = {
    voiceState: 'speaking',
    ready: true,
    hasVoice: true,
    preferences: { voiceEnabled: true, muted: false, master: 1, voice: 1 },
  } as ReturnType<typeof useAudio>
  const render = () =>
    root.render(
      <DialogueReader
        line={{ id: 'test', speaker: 'Kite', text }}
        audio={audio}
        reading={defaultReadingPreferences}
        auto={true}
        paused={false}
        onToggleAuto={() => {}}
        onReplay={replay}
        onAdvance={advance}
      />,
    )
  act(render)
  expect(container.querySelector('.scrollable-passage')!.textContent).toBe(text)
  expect(container.querySelector('.page-back')).toBeNull()
  expect(container.querySelector('.continue-button')!.textContent).toBe('Continue')
  for (let i = 0; i < 10; i++) act(() => vi.advanceTimersByTime(10000))
  expect(container.querySelector('.dialogue-text')!.textContent).toContain('last ferry.')
  expect(advance).not.toHaveBeenCalled()
  expect(replay).not.toHaveBeenCalled()
  audio.voiceState = 'ended'
  act(render)
  act(() => vi.advanceTimersByTime(999))
  expect(advance).not.toHaveBeenCalled()
  act(() => vi.advanceTimersByTime(1))
  expect(advance).toHaveBeenCalledTimes(1)
})

it('gives separate recordings separate pages without splitting either passage', () => {
  const changed = vi.fn()
  const first = { id: 'a', speaker: 'Mara' as const, text }
  const second = { id: 'b', speaker: 'Kite' as const, text: 'An incomplete handover log.' }
  act(() =>
    root.render(
      <PagedReader
        entries={[
          { id: first.id, title: first.speaker, text: first.text, voiceLine: first },
          { id: second.id, title: second.speaker, text: second.text, voiceLine: second },
        ]}
        onVoiceLine={changed}
      />,
    ),
  )
  expect(changed).toHaveBeenLastCalledWith(first)
  expect(container.querySelector('.reader-text')!.textContent).toBe(first.text)
  expect(container.querySelector('.page-buttons [role="status"]')!.textContent).toBe('1 / 2')
  click('[aria-label="Next page"]')
  expect(changed).toHaveBeenLastCalledWith(second)
  expect(container.querySelector('.reader-text')!.textContent).toBe(second.text)
})
