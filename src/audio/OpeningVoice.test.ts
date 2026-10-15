import { describe, expect, it, vi } from 'vitest'
import { OpeningVoice } from './OpeningVoice'
import { defaultAudioPreferences as preferences } from './preferences'

function setup() {
  const clips: HTMLAudioElement[] = [],
    urls: string[] = []
  const voice = new OpeningVoice((url) => {
    urls.push(url)
    const clip = {
      duration: 2.24,
      currentTime: 0,
      play: vi.fn().mockResolvedValue(undefined),
      pause: vi.fn(),
      load: vi.fn(),
      removeAttribute: vi.fn(),
    } as unknown as HTMLAudioElement
    clips.push(clip)
    return clip
  })
  return { clips, urls, voice }
}
describe('opening dialogue transport', () => {
  it('can resume after pausing a pending play request', async () => {
    const { voice, clips } = setup()
    voice.sync(3.2, true, preferences)
    let reject: (reason: Error) => void = () => {}
    vi.mocked(clips[0].play).mockReturnValueOnce(
      new Promise((_, fail) => {
        reject = fail
      }),
    )
    voice.sync(3.3, true, preferences, true)
    voice.pause()
    reject(new Error('AbortError'))
    await Promise.resolve()
    voice.sync(3.4, true, preferences)
    expect(clips[0].play).toHaveBeenCalledTimes(3)
    voice.dispose()
  })
  it('starts at the authored caption, once, and cuts over to the next recording', () => {
    const { voice, clips, urls } = setup()
    voice.sync(3.1, true, preferences)
    expect(clips).toHaveLength(0)
    voice.sync(3.2, true, preferences)
    expect(urls[0]).toContain('opening-consent')
    expect(clips[0].currentTime).toBeCloseTo(0.05)
    voice.sync(3.3, true, preferences)
    expect(clips[0].play).toHaveBeenCalledTimes(1)
    voice.sync(6.5, true, preferences)
    expect(urls[1]).toContain('opening-kite')
    expect(clips[0].pause).toHaveBeenCalled()
    expect(clips[0].removeAttribute).toHaveBeenCalledWith('src')
    voice.dispose()
    expect(clips[1].pause).toHaveBeenCalled()
  })
  it('resumes and seeks to the clock, respects voice/mute levels, and never replays an ended clip', () => {
    const { voice, clips } = setup()
    voice.sync(3.2, true, preferences)
    voice.pause()
    voice.sync(4.2, true, { ...preferences, master: 0.5, voice: 0.6 })
    expect(clips[0].currentTime).toBeCloseTo(1.05)
    expect(clips[0].volume).toBeCloseTo(0.3)
    voice.sync(3.5, true, preferences, true)
    expect(clips[0].currentTime).toBeCloseTo(0.35)
    const calls = vi.mocked(clips[0].play).mock.calls.length
    voice.sync(3.6, true, { ...preferences, muted: true })
    voice.sync(3.7, true, { ...preferences, voiceEnabled: false })
    expect(clips[0].play).toHaveBeenCalledTimes(calls)
    voice.sync(5.9, true, preferences)
    expect(clips[0].play).toHaveBeenCalledTimes(calls)
    voice.dispose()
  })
})
