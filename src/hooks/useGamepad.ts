import { useEffect, useRef, useState } from 'react'
import { GamepadSampler, type GamepadAction } from '../input/gamepad'

export type ControllerStatus = 'waiting' | 'connected' | 'unsupported-mapping' | 'unavailable'

export function useGamepad(
  onAction: (action: GamepadAction) => void,
  onScroll: (amount: number) => void,
) {
  const [status, setStatus] = useState<ControllerStatus>('waiting')
  const handlers = useRef({ onAction, onScroll })
  handlers.current = { onAction, onScroll }
  useEffect(() => {
    if (!navigator.getGamepads) {
      setStatus('unavailable')
      return
    }
    const sampler = new GamepadSampler()
    let frame = 0,
      identity = '',
      lastStatus: ControllerStatus = 'waiting',
      wasActive = true
    const updateStatus = (next: ControllerStatus) => {
      if (next !== lastStatus) {
        lastStatus = next
        setStatus(next)
      }
    }
    const tick = (now: number) => {
      try {
        const pads = [...navigator.getGamepads()].filter((pad): pad is Gamepad => !!pad?.connected)
        const pad = pads.find((pad) => pad.mapping === 'standard')
        updateStatus(pad ? 'connected' : pads.length ? 'unsupported-mapping' : 'waiting')
        const active = !document.hidden && document.hasFocus()
        const nextIdentity = pad ? `${pad.index}:${pad.id}` : ''
        if (identity !== nextIdentity || active !== wasActive) sampler.reset()
        identity = nextIdentity
        wasActive = active
        if (pad && active) {
          for (const action of sampler.sample(pad, now)) handlers.current.onAction(action)
          const scroll = pad.axes[3] ?? 0
          if (Number.isFinite(scroll) && Math.abs(scroll) > 0.25)
            handlers.current.onScroll(scroll * 9)
        }
      } catch {
        updateStatus('unavailable')
      }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [])
  return status
}
