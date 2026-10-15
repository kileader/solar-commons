// @vitest-environment jsdom
import { act, StrictMode } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useAutoAdvance, readingTime } from './useAutoAdvance'
import { defaultReadingPreferences as preferences } from '../reading/preferences'
import type { DialogueLine } from '../content/harbor'
import type { VoiceState } from '../audio/VoicePlayback'

const first: DialogueLine = { id: 'first', speaker: 'Mara', text: 'One short line.' }
let root: Root, container: HTMLDivElement
let props: { line: DialogueLine | null; enabled: boolean; paused: boolean; voice: VoiceState }
const advance = vi.fn()
function Harness() {
  useAutoAdvance(props.line, props.enabled, props.paused, props.voice, preferences, advance)
  return null
}
const render = (patch: Partial<typeof props> = {}) => {
  props = { ...props, ...patch }
  act(() =>
    root.render(
      <StrictMode>
        <Harness />
      </StrictMode>,
    ),
  )
}
const tick = (ms: number) => act(() => vi.advanceTimersByTime(ms))
beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
  vi.useFakeTimers()
  advance.mockClear()
  vi.spyOn(document, 'hidden', 'get').mockReturnValue(false)
  vi.spyOn(document, 'hasFocus').mockReturnValue(true)
  container = document.createElement('div')
  document.body.append(container)
  root = createRoot(container)
  props = { line: first, enabled: true, paused: false, voice: 'loading' }
})
afterEach(() => {
  act(() => root.unmount())
  expect(vi.getTimerCount()).toBe(0)
  container.remove()
  vi.useRealTimers()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})
describe('VN auto advance', () => {
  it('waits through loading and speech, then exactly one second after the end', () => {
    render()
    tick(60000)
    render({ voice: 'speaking' })
    tick(60000)
    expect(advance).not.toHaveBeenCalled()
    render({ voice: 'ended' })
    tick(999)
    expect(advance).not.toHaveBeenCalled()
    tick(1)
    expect(advance).toHaveBeenCalledTimes(1)
    tick(10000)
    expect(advance).toHaveBeenCalledTimes(1)
  })
  it('gives unvoiced or failed text a minimum dwell and scales for longer passages', () => {
    render({ voice: 'unavailable' })
    tick(3499)
    expect(advance).not.toHaveBeenCalled()
    tick(1)
    expect(advance).toHaveBeenCalledTimes(1)
    const long = 'word '.repeat(100).trim()
    expect(readingTime(long, 200)).toBe(30000)
    render({ line: { ...first, text: long }, voice: 'error' })
    tick(30999)
    expect(advance).toHaveBeenCalledTimes(1)
    tick(1)
    expect(advance).toHaveBeenCalledTimes(2)
  })
  it('cancels the old timer on manual advance or voice replay', () => {
    render({ voice: 'ended' })
    tick(900)
    render({ line: { ...first, id: 'next' }, voice: 'loading' })
    tick(10000)
    expect(advance).not.toHaveBeenCalled()
    render({ voice: 'ended' })
    tick(900)
    render({ voice: 'loading' })
    tick(10000)
    expect(advance).not.toHaveBeenCalled()
  })
  it('waits for all choices, panels and investigations, and stops when Auto is off', () => {
    render({ voice: 'ended' })
    tick(900)
    render({ paused: true })
    tick(10000)
    render({ paused: false, line: null })
    tick(10000)
    render({ line: first, enabled: false })
    tick(10000)
    expect(advance).not.toHaveBeenCalled()
  })
  it('continues the current delay in a hidden or unfocused browser', () => {
    render({ voice: 'ended' })
    tick(900)
    vi.spyOn(document, 'hidden', 'get').mockReturnValue(true)
    tick(100)
    expect(advance).toHaveBeenCalledTimes(1)
    vi.spyOn(document, 'hidden', 'get').mockReturnValue(false)
    render({ line: { ...first, id: 'second' } })
    vi.spyOn(document, 'hasFocus').mockReturnValue(false)
    tick(1000)
    expect(advance).toHaveBeenCalledTimes(2)
  })
})
