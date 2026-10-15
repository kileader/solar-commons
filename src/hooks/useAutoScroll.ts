import { useEffect, useLayoutEffect, useRef, type RefObject } from 'react'
import type { VoiceProgress, VoiceState } from '../audio/VoicePlayback'

/** Scroll only the current passage. This never advances a scene or starts a voice. */
export function useAutoScroll<T extends HTMLElement>(
  body: RefObject<T | null>,
  key: string,
  enabled: boolean,
  paused: boolean,
  voiceState: VoiceState,
  progress: VoiceProgress | null | undefined,
  readingDuration: number,
) {
  const playback = useRef({ voiceState, progress, received: 0 })
  useEffect(() => {
    playback.current = { voiceState, progress, received: performance.now() }
  }, [voiceState, progress])
  useLayoutEffect(() => {
    if (body.current) body.current.scrollTop = 0
  }, [body, key])
  useEffect(() => {
    const element = body.current
    if (!element || !enabled || paused) return
    let frame = 0
    let previous = performance.now()
    let elapsed = 0
    let manual = false
    const interrupt = () => {
      manual = true
    }
    const keydown = (event: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End'].includes(event.key))
        interrupt()
    }
    const tick = (now: number) => {
      const current = playback.current
      if (current.voiceState !== 'loading') elapsed += Math.max(0, now - previous)
      previous = now
      if (!manual) {
        const duration = current.progress?.duration || readingDuration / 1000
        const time =
          current.progress && current.progress.duration > 0
            ? current.progress.time +
              (current.voiceState === 'speaking' ? Math.max(0, now - current.received) / 1000 : 0)
            : elapsed / 1000
        const lead = Math.min(1.5, duration * 0.12)
        const tail = Math.min(0.5, duration * 0.05)
        const fraction =
          current.voiceState === 'ended'
            ? 1
            : current.voiceState === 'loading'
              ? 0
              : Math.max(0, Math.min(1, (time - lead) / Math.max(0.1, duration - lead - tail)))
        element.scrollTop = Math.max(0, element.scrollHeight - element.clientHeight) * fraction
      }
      frame = requestAnimationFrame(tick)
    }
    element.addEventListener('wheel', interrupt, { passive: true })
    element.addEventListener('touchstart', interrupt, { passive: true })
    element.addEventListener('keydown', keydown)
    frame = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(frame)
      element.removeEventListener('wheel', interrupt)
      element.removeEventListener('touchstart', interrupt)
      element.removeEventListener('keydown', keydown)
    }
  }, [body, key, enabled, paused, readingDuration])
}
