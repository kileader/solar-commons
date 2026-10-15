import { useCallback, useEffect, useRef, useState } from 'react'
import { Pause, Play, ArrowRight } from 'lucide-react'
import { quietIndexArt } from '../art'
import { useGamepad } from '../hooks/useGamepad'
import { moveFocus, visibleControls } from '../input/focus'

/** Kevin's single supplied shot. A still remains playable if motion or video is unavailable. */
export function IlexIntroduction({
  reduced,
  onComplete,
}: {
  reduced: boolean
  onComplete: () => void
}) {
  const [mode, setMode] = useState<'loading' | 'playing' | 'paused' | 'still'>(
    reduced ? 'still' : 'loading',
  )
  const video = useRef<HTMLVideoElement>(null)
  const root = useRef<HTMLElement>(null)
  const completed = useRef(false)
  const finish = useCallback(() => {
    if (completed.current) return
    completed.current = true
    video.current?.pause()
    onComplete()
  }, [onComplete])

  useEffect(() => {
    const element = video.current
    if (reduced) {
      element?.pause()
      setMode('still')
      return
    }
    if (!element) return
    let cancelled = false
    const fallback = () => {
      if (!cancelled) {
        element.pause()
        setMode('still')
      }
    }
    const timer = window.setTimeout(fallback, 8000)
    const started = () => window.clearTimeout(timer)
    element.addEventListener('playing', started)
    element.play().catch(fallback)
    return () => {
      cancelled = true
      window.clearTimeout(timer)
      element.removeEventListener('playing', started)
      element.pause()
    }
  }, [reduced])

  function togglePlayback() {
    const element = video.current
    if (!element) return
    if (element.paused) element.play().catch(() => setMode('still'))
    else element.pause()
  }
  useEffect(() => {
    const keydown = (event: KeyboardEvent) => {
      if (event.repeat || event.altKey || event.ctrlKey || event.metaKey) return
      if (event.key === 'Escape') {
        event.preventDefault()
        finish()
      } else if (!(event.target instanceof Element && event.target.closest('button'))) {
        if (event.key === 'Enter') {
          event.preventDefault()
          finish()
        } else if (event.key === ' ') {
          event.preventDefault()
          if (mode === 'still') finish()
          else togglePlayback()
        }
      }
    }
    window.addEventListener('keydown', keydown)
    return () => window.removeEventListener('keydown', keydown)
  })
  useGamepad(
    (action) => {
      if (action === 'back') return finish()
      const controls = root.current ? visibleControls(root.current) : []
      if (action === 'confirm') {
        const focused = document.activeElement as HTMLElement | null
        if (focused && controls.includes(focused)) focused.click()
        else finish()
      } else if (['left', 'right', 'up', 'down'].includes(action)) {
        moveFocus(controls, action === 'left' || action === 'up' ? -1 : 1)
      }
    },
    () => {},
  )

  return (
    <main
      ref={root}
      className="ilex-introduction"
      data-phase="qi-intro-shot"
      data-playback={mode}
      aria-label="Ilex introduction"
    >
      <img
        src={quietIndexArt.introPoster}
        alt="Ilex pauses delicate restoration work at a lamplit bench, their amber eye and white-and-brass prosthetic hands visible"
      />
      {!reduced && mode !== 'still' && (
        <video
          ref={video}
          src={quietIndexArt.introVideo}
          poster={quietIndexArt.introPoster}
          playsInline
          muted
          preload="auto"
          disablePictureInPicture
          onPlaying={() => setMode('playing')}
          onPause={() => setMode((previous) => (previous === 'still' ? previous : 'paused'))}
          onEnded={finish}
          onError={() => setMode('still')}
          aria-hidden="true"
        />
      )}
      <div className="ilex-intro-heading">
        <span className="eyebrow">THE QUIET INDEX</span>
        <h1>Ilex Vale</h1>
        <p>Independent archivist</p>
      </div>
      <div className="ilex-intro-controls">
        {mode === 'still' ? (
          <p>{reduced ? 'Reduced motion · still image' : 'Still image · video unavailable'}</p>
        ) : (
          <button onClick={togglePlayback} disabled={mode === 'loading'}>
            {mode === 'paused' ? <Play size={18} /> : <Pause size={18} />}
            {mode === 'paused' ? 'Resume introduction' : 'Pause introduction'}
          </button>
        )}
        <button className={mode === 'still' ? 'continue-button' : 'text-action'} onClick={finish}>
          {mode === 'still' ? 'Continue' : 'Skip introduction'} <ArrowRight size={19} />
        </button>
      </div>
    </main>
  )
}
