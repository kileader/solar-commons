import { useEffect, useRef, useState } from 'react'
import logo from '../../studio/phicid_logo.png'
import './studio-splash.css'

export const SPLASH_DURATION = 2400

export function StudioSplash({ onComplete }: { onComplete: () => void }) {
  const [loaded, setLoaded] = useState(false)
  const complete = useRef<() => void>(() => {})

  useEffect(() => {
    let finished = false
    let disposed = false
    let frame = 0
    let transition = 0
    const keys = new Set<string>()
    const pointers = new Set<number>()
    const previous = new Map<number, boolean[]>()

    // Keep consuming the gesture through release and its synthetic click. The
    // harbor mounts on the next frame, with no chance to reuse the skip input.
    const enter = () => {
      if (finished && !keys.size && !pointers.size && !transition) {
        transition = requestAnimationFrame(() => {
          if (!disposed) onComplete()
        })
      }
    }
    const finish = () => {
      finished = true
      enter()
    }
    complete.current = finish
    const hold = () => {
      cancelAnimationFrame(transition)
      transition = 0
    }
    const consume = (event: Event) => {
      event.preventDefault()
      event.stopImmediatePropagation()
    }
    const keyDown = (event: KeyboardEvent) => {
      consume(event)
      hold()
      keys.add(event.code)
      if (!event.repeat) finish()
    }
    const keyUp = (event: KeyboardEvent) => {
      consume(event)
      keys.delete(event.code)
      enter()
    }
    const pointerDown = (event: PointerEvent) => {
      consume(event)
      hold()
      pointers.add(event.pointerId)
      finish()
    }
    const pointerUp = (event: PointerEvent) => {
      consume(event)
      pointers.delete(event.pointerId)
      enter()
    }
    const poll = () => {
      if (disposed) return
      if (document.hasFocus() && document.visibilityState === 'visible') {
        const pads = navigator.getGamepads?.() ?? []
        const present = new Set<number>()
        for (const pad of pads) {
          if (!pad?.connected) continue
          present.add(pad.index)
          const pressed = pad.buttons.map((button) => button.pressed)
          const last = previous.get(pad.index)
          if (last && pressed.some((value, index) => value && !last[index])) finish()
          previous.set(pad.index, pressed)
        }
        for (const index of previous.keys()) if (!present.has(index)) previous.delete(index)
      } else {
        previous.clear()
      }
      frame = requestAnimationFrame(poll)
    }
    const blur = () => {
      keys.clear()
      pointers.clear()
      enter()
    }
    document.addEventListener('keydown', keyDown, true)
    document.addEventListener('keyup', keyUp, true)
    document.addEventListener('pointerdown', pointerDown, true)
    document.addEventListener('pointerup', pointerUp, true)
    document.addEventListener('pointercancel', pointerUp, true)
    document.addEventListener('click', consume, true)
    document.addEventListener('contextmenu', consume, true)
    window.addEventListener('blur', blur)
    frame = requestAnimationFrame(poll)

    return () => {
      disposed = true
      cancelAnimationFrame(frame)
      cancelAnimationFrame(transition)
      document.removeEventListener('keydown', keyDown, true)
      document.removeEventListener('keyup', keyUp, true)
      document.removeEventListener('pointerdown', pointerDown, true)
      document.removeEventListener('pointerup', pointerUp, true)
      document.removeEventListener('pointercancel', pointerUp, true)
      document.removeEventListener('click', consume, true)
      document.removeEventListener('contextmenu', consume, true)
      window.removeEventListener('blur', blur)
    }
  }, [onComplete])

  useEffect(() => {
    const timer = window.setTimeout(() => complete.current(), loaded ? SPLASH_DURATION : 8000)
    return () => window.clearTimeout(timer)
  }, [loaded])

  return (
    <div
      className="studio-splash"
      role="img"
      aria-label="Phicid Productions. Press any key or click to skip."
    >
      <img
        className={loaded ? 'studio-splash-logo is-loaded' : 'studio-splash-logo'}
        src={logo}
        alt=""
        draggable={false}
        onLoad={() => setLoaded(true)}
        onError={() => complete.current()}
      />
    </div>
  )
}
