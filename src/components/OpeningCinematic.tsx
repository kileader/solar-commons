import { useCallback, useEffect, useRef, useState } from 'react'
import { Pause, Play, RotateCcw, SkipForward, Volume2, VolumeX, X } from 'lucide-react'
import { OpeningAudio } from '../audio/OpeningAudio'
import { loadAudioPreferences, saveAudioPreferences } from '../audio/preferences'
import {
  consentPressedImage,
  consentPressTime,
  openingCamera,
  openingDuration,
  openingOpacity,
  openingPosition,
  openingShots,
  openingVideo,
} from '../content/opening'
import { useGamepad } from '../hooks/useGamepad'
import { useMotion } from '../hooks/useMotion'
import { adjustControl, moveFocus, visibleControls } from '../input/focus'
import './opening-cinematic.css'

type Playback = 'ready' | 'playing' | 'paused' | 'finishing'
const clamp = (n: number) => Math.max(0, Math.min(1, n))
function heldGamepadButton() {
  try {
    return [...(navigator.getGamepads?.() ?? [])].some(
      (pad) => pad?.connected && pad.buttons.some((button) => button.pressed || button.value > 0.5),
    )
  } catch {
    return false // A denied gamepad API must not prevent keyboard/touch completion.
  }
}

/** Light follows the painted paths; it never adds a second avatar or claims neural measurements. */
function Attention({ shot, local }: { shot: string; local: number }) {
  if (!['consent', 'kite', 'threshold', 'shared'].includes(shot)) return null
  const shared = shot === 'shared'
  const threshold = shot === 'threshold'
  const alignment = shared ? clamp(local / 3) : 0
  const phase = local * 2.4
  const cyan = 0.45 + (0.55 * (Math.sin(phase) + 1)) / 2
  const gold = 0.45 + (0.55 * (Math.sin(phase + (1 - alignment) * 1.7) + 1)) / 2
  const paths = shared
    ? ['M440 289 C650 448 870 350 1126 366', 'M434 357 C660 540 900 408 1126 413']
    : threshold
      ? ['M70 900 C175 650 425 500 600 347', 'M733 520 C930 600 1210 740 1600 735']
      : ['M940 383 C1190 440 1320 195 1560 177', 'M720 578 C970 795 1260 670 1565 502']
  const points = shared
    ? [
        [1126, 366],
        [1126, 413],
      ]
    : threshold
      ? [
          [600, 347],
          [733, 520],
        ]
      : [
          [1560, 177],
          [1565, 502],
        ]
  if (shot === 'consent') {
    const pulse = clamp((local - 0.85) / 0.12) * (1 - clamp((local - 1.05) / 1.6))
    return (
      <svg className="opening-effects" viewBox="0 0 1672 941" aria-hidden="true">
        <ellipse
          cx="474"
          cy="600"
          rx={87 + pulse * 28}
          ry={25 + pulse * 10}
          fill="none"
          stroke="#acffe2"
          strokeWidth="4"
          opacity={pulse * 0.8}
        />
      </svg>
    )
  }
  return (
    <svg className="opening-effects" viewBox="0 0 1672 941" aria-hidden="true">
      {paths.map((path, i) => (
        <g key={path} opacity={i ? gold : cyan} stroke={i ? '#ffd894' : '#9ffff0'} fill="none">
          <path d={path} strokeWidth="5" opacity="0.18" />
          <path
            d={path}
            pathLength="1"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="0.075 0.925"
            strokeDashoffset={-((local * 0.18 + i * (1 - alignment) * 0.25) % 1)}
          />
          {i === 0 ? (
            <circle cx={points[i][0]} cy={points[i][1]} r={12 + cyan * 7} strokeWidth="2" />
          ) : (
            <path
              d="M0 -17 L17 0 L0 17 L-17 0Z"
              transform={`translate(${points[i][0]} ${points[i][1]}) scale(${0.8 + gold * 0.3})`}
              strokeWidth="2"
            />
          )}
        </g>
      ))}
      {threshold && (
        <g
          fill="none"
          stroke="#b8f3d9"
          strokeWidth="1.5"
          strokeDasharray="9 16"
          opacity={clamp(local / 3) * 0.4}
        >
          <path
            d="M855 236 L1170 122 L1490 235 L1490 695 L1170 818 L855 682Z"
            pathLength="1"
            strokeDasharray="0.006 0.012"
            strokeDashoffset={-local * 0.004}
          />
          <path d="M1170 122 V818 M855 682 L1170 542 L1490 695" />
        </g>
      )}
    </svg>
  )
}

export function OpeningCinematic({ onComplete }: { onComplete: () => void }) {
  const [playback, setPlayback] = useState<Playback>('ready')
  const playbackRef = useRef<Playback>('ready')
  const [time, setTime] = useState(0)
  const timeRef = useRef(0)
  const lastFrame = useRef<number | null>(null)
  const [preferences, setPreferences] = useState(loadAudioPreferences)
  const [soundOpen, setSoundOpen] = useState(false)
  const [videoFailed, setVideoFailed] = useState(false)
  const [audioNotice, setAudioNotice] = useState('')
  const root = useRef<HTMLElement>(null)
  const video = useRef<HTMLVideoElement>(null)
  const audio = useRef<OpeningAudio | null>(null)
  const keys = useRef(new Set<string>())
  const pointers = useRef(new Set<number>())
  const { reduced, manualReduced, setManualReduced, systemReduced } = useMotion()
  const { shot, local, index } = openingPosition(time)

  const changePlayback = useCallback((next: Playback) => {
    playbackRef.current = next
    lastFrame.current = null
    setPlayback(next)
  }, [])
  const finish = useCallback(() => {
    changePlayback('finishing')
    video.current?.pause()
    audio.current?.pause()
  }, [changePlayback])

  useEffect(() => {
    const engine = new OpeningAudio()
    audio.current = engine
    return () => {
      engine.dispose()
      audio.current = null
    }
  }, [])

  useEffect(() => {
    saveAudioPreferences(preferences)
    audio.current?.configure(preferences)
    if (video.current) {
      video.current.muted = preferences.muted
      video.current.volume = preferences.master * preferences.effects
    }
  }, [preferences])

  const start = (silent?: boolean) => {
    if (playbackRef.current === 'finishing') return
    if (silent !== undefined) {
      const next = { ...preferences, muted: silent }
      setPreferences(next)
      audio.current?.configure(next)
    }
    audio.current?.unlock()
    changePlayback('playing')
    setSoundOpen(false)
  }
  const pause = useCallback(() => {
    if (playbackRef.current !== 'playing') return
    changePlayback('paused')
    video.current?.pause()
    audio.current?.pause()
  }, [changePlayback])
  const seek = (next: number) => {
    const bounded = Math.max(0, Math.min(openingDuration - 0.05, next))
    timeRef.current = bounded
    lastFrame.current = null
    setTime(bounded)
    audio.current?.seek(bounded)
    if (video.current && bounded < 3) {
      try {
        video.current.currentTime = bounded
      } catch {
        /* Metadata is still loading. */
      }
    }
  }
  const toggleSound = () => {
    if (playbackRef.current === 'playing') audio.current?.unlock()
    setPreferences((p) => ({ ...p, muted: !p.muted }))
  }

  // One clock owns the camera, captions, light and sound cues. Background tabs pause.
  useEffect(() => {
    let frame = 0
    let completed = false
    const tick = (now: number) => {
      if (playbackRef.current === 'finishing') {
        const heldPad = heldGamepadButton()
        if (!keys.current.size && !pointers.current.size && !heldPad && !completed) {
          completed = true
          onComplete()
          return
        }
      } else if (playbackRef.current === 'playing') {
        if (lastFrame.current !== null) {
          const next = Math.min(
            openingDuration,
            timeRef.current + Math.max(0, now - lastFrame.current) / 1000,
          )
          timeRef.current = next
          setTime(next)
          audio.current?.update(next)
          if (next === openingDuration) finish()
        }
        lastFrame.current = now
      }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [finish, onComplete])

  useEffect(() => {
    const hidden = () => {
      if (document.hidden) pause()
    }
    window.addEventListener('blur', pause)
    document.addEventListener('visibilitychange', hidden)
    return () => {
      window.removeEventListener('blur', pause)
      document.removeEventListener('visibilitychange', hidden)
    }
  }, [pause])

  useEffect(() => {
    const element = video.current
    if (!element) return
    let cancelled = false
    if (playback === 'playing' && shot.id === 'room' && !reduced && !videoFailed) {
      try {
        element.currentTime = timeRef.current
      } catch {
        /* Still loading. */
      }
      void element.play().catch(() => {
        if (cancelled) return
        // A rejected autoplay request gets a still, never a blocked opening.
        setVideoFailed(true)
        setAudioNotice('The opening clip could not play. Continuing with its still image.')
      })
    } else element.pause()
    return () => {
      cancelled = true
      element.pause()
    }
  }, [playback, shot.id, reduced, videoFailed])

  // Consume completion through key/pointer release and the resulting synthetic click.
  // Gameplay has no listeners or audio until this component unmounts.
  const handlers = useRef({ start, pause, finish })
  handlers.current = { start, pause, finish }
  useEffect(() => {
    const consume = (event: Event) => {
      event.preventDefault()
      event.stopImmediatePropagation()
    }
    const down = (event: KeyboardEvent) => {
      keys.current.add(event.code)
      if (playbackRef.current === 'finishing') {
        consume(event)
        return
      }
      if (event.code === 'Escape') {
        consume(event)
        handlers.current.finish()
      } else if (
        event.code === 'Space' &&
        !(event.target instanceof HTMLElement && event.target.closest('button,input,select,a'))
      ) {
        consume(event)
        if (!event.repeat) {
          if (playbackRef.current === 'playing') handlers.current.pause()
          else handlers.current.start()
        }
      }
    }
    const up = (event: KeyboardEvent) => {
      keys.current.delete(event.code)
      if (playbackRef.current === 'finishing') consume(event)
    }
    const pointerDown = (event: PointerEvent) => {
      pointers.current.add(event.pointerId)
      if (playbackRef.current === 'finishing') consume(event)
    }
    const pointerUp = (event: PointerEvent) => {
      pointers.current.delete(event.pointerId)
      if (playbackRef.current === 'finishing') consume(event)
    }
    const click = (event: Event) => {
      if (playbackRef.current === 'finishing') consume(event)
    }
    const blur = () => {
      keys.current.clear()
      pointers.current.clear()
    }
    document.addEventListener('keydown', down, true)
    document.addEventListener('keyup', up, true)
    document.addEventListener('pointerdown', pointerDown, true)
    document.addEventListener('pointerup', pointerUp, true)
    document.addEventListener('pointercancel', pointerUp, true)
    document.addEventListener('click', click, true)
    window.addEventListener('blur', blur)
    return () => {
      document.removeEventListener('keydown', down, true)
      document.removeEventListener('keyup', up, true)
      document.removeEventListener('pointerdown', pointerDown, true)
      document.removeEventListener('pointerup', pointerUp, true)
      document.removeEventListener('pointercancel', pointerUp, true)
      document.removeEventListener('click', click, true)
      window.removeEventListener('blur', blur)
    }
  }, [])

  useGamepad(
    (action) => {
      if (playbackRef.current === 'finishing') return
      if (action === 'back') finish()
      else if (action === 'mute') toggleSound()
      else if (action === 'replay') seek(0)
      else if (action === 'confirm') {
        const active = document.activeElement
        if (
          (active instanceof HTMLButtonElement ||
            (active instanceof HTMLInputElement && active.type === 'checkbox')) &&
          root.current?.contains(active)
        )
          active.click()
        else if (playbackRef.current === 'playing') pause()
        else start()
      } else if (['up', 'down', 'left', 'right'].includes(action) && root.current) {
        const direction = action === 'up' || action === 'left' ? -1 : 1
        const active = document.activeElement
        if (
          (action === 'left' || action === 'right') &&
          active instanceof HTMLElement &&
          root.current.contains(active) &&
          adjustControl(active, direction)
        )
          return
        moveFocus(visibleControls(root.current), direction)
      }
    },
    () => {},
  )

  const ready = playback === 'ready'
  const caption = shot.caption && local >= shot.caption.delay ? shot.caption : null
  const pressed = clamp((time - consentPressTime) / 0.09)
  return (
    <section
      ref={root}
      className={`opening ${reduced ? 'opening-reduced' : ''} ${ready ? 'opening-ready' : ''}`}
      aria-label="Solar Commons opening cinematic"
      data-playback={playback}
      data-shot={shot.id}
    >
      <div className="opening-artboard" role="img" aria-label={shot.description}>
        {openingShots.map((plate, i) => (
          <div
            key={plate.id}
            className={`opening-plate opening-${plate.id}`}
            style={{ opacity: openingOpacity(i, time), zIndex: i }}
            aria-hidden="true"
          >
            <div
              className="opening-camera"
              style={{ transform: openingCamera(plate, time, reduced) }}
            >
              <img
                src={plate.image}
                alt=""
                draggable={false}
                fetchPriority={i < 2 ? 'high' : 'auto'}
              />
              {plate.id === 'room' && (
                <video
                  ref={video}
                  src={openingVideo}
                  poster={plate.image}
                  preload="auto"
                  playsInline
                  muted={preferences.muted}
                  disablePictureInPicture
                  style={{ opacity: !reduced && !videoFailed && !ready ? 1 : 0 }}
                  onError={() => setVideoFailed(true)}
                  aria-hidden="true"
                />
              )}
              {plate.id === 'consent' && (
                <img
                  src={consentPressedImage}
                  alt=""
                  draggable={false}
                  style={{ opacity: pressed }}
                />
              )}
              {!reduced && openingOpacity(i, time) > 0 && (
                <Attention shot={plate.id} local={time - plate.start} />
              )}
              {!reduced && plate.id === 'shared' && (
                <div
                  className="opening-merge-light"
                  style={{ opacity: Math.sin(clamp((time - 16) / 2) * Math.PI) * 0.28 }}
                />
              )}
              {!reduced && plate.id === 'city' && (
                <div
                  className="opening-sunlight"
                  style={{
                    opacity: clamp((time - 25) / 2) * 0.15,
                    transform: `translateX(${clamp((time - 25) / 5) * 8}%)`,
                  }}
                />
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="opening-vignette" aria-hidden="true" />
      <header className="opening-brand">
        <span className="opening-brand-mark" aria-hidden="true">
          ◇
        </span>{' '}
        SOLAR COMMONS <span className="opening-chapter">PROLOGUE</span>
      </header>
      {ready ? (
        <div className="opening-invitation">
          <p className="opening-eyebrow">MARA & KITE</p>
          <h1>
            A shared
            <br /> point of view.
          </h1>
          <p>
            Twelve years together.
            <br /> Today, a little closer.
          </p>
          <div className="opening-start-actions">
            <button className="opening-primary" onClick={() => start(false)}>
              <Play size={19} /> Begin with sound
            </button>
            <button onClick={() => start(true)}>Watch silently</button>
          </div>
          <small>A 34-second opening · headphones welcome</small>
        </div>
      ) : (
        <>
          <div className="opening-caption" aria-live="polite" aria-atomic="true">
            {caption && (
              <div key={shot.id}>
                <span>{caption.speaker}</span>
                <p>“{caption.text}”</p>
              </div>
            )}
          </div>
          {(shot.id === 'threshold' || shot.id === 'shared') && (
            <p className="opening-perception-note">
              {shot.id === 'threshold'
                ? 'Dashed contours · partial model'
                : 'Rendered workspace · shared attention'}
            </p>
          )}
          {shot.id === 'harbor' && (
            <div
              className="opening-destination"
              style={{ opacity: clamp(local / 1.2) * (1 - clamp((local - 2.8) / 1)) }}
            >
              <span>LARKHAVEN</span>
              <h2>The Harbor</h2>
            </div>
          )}
        </>
      )}
      <footer className="opening-footer">
        {!ready && (
          <input
            className="opening-progress"
            type="range"
            aria-label="Opening playback position"
            min="0"
            max={openingDuration}
            step="0.1"
            value={time}
            aria-valuetext={`${Math.floor(time)} of ${openingDuration} seconds. ${shot.title}`}
            onChange={(event) => seek(Number(event.target.value))}
          />
        )}
        <div className="opening-controls">
          {!ready && (
            <>
              <button
                onClick={() => (playback === 'playing' ? pause() : start())}
                disabled={playback === 'finishing'}
              >
                {playback === 'playing' ? <Pause size={18} /> : <Play size={18} />}
                {playback === 'playing' ? 'Pause' : 'Resume'}
              </button>
              {playback === 'paused' && (
                <button onClick={() => seek(0)} aria-label="Restart opening">
                  <RotateCcw size={18} />
                  <span className="opening-optional">Restart</span>
                </button>
              )}
              <button
                onClick={() => {
                  pause()
                  setSoundOpen((open) => !open)
                }}
                aria-expanded={soundOpen}
                aria-controls="opening-sound"
              >
                {preferences.muted ? <VolumeX size={18} /> : <Volume2 size={18} />} Sound
              </button>
            </>
          )}
          <label className="opening-motion">
            <input
              type="checkbox"
              checked={reduced}
              disabled={systemReduced}
              onChange={() => setManualReduced(!manualReduced)}
            />{' '}
            Reduced motion
          </label>
          <button className="opening-skip" onClick={finish}>
            Skip <SkipForward size={17} />
          </button>
        </div>
        {soundOpen && (
          <div id="opening-sound" className="opening-sound-panel">
            <div>
              <strong>Sound</strong>
              <button aria-label="Close sound controls" onClick={() => setSoundOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <button onClick={toggleSound}>
              {preferences.muted ? 'Enable sound' : 'Mute sound'}
            </button>
            {(['master', 'music', 'effects'] as const).map((channel) => (
              <label key={channel}>
                {channel === 'effects'
                  ? 'Effects & clip'
                  : channel[0].toUpperCase() + channel.slice(1)}
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={preferences[channel]}
                  onChange={(event) =>
                    setPreferences((p) => ({ ...p, [channel]: Number(event.target.value) }))
                  }
                />
              </label>
            ))}
          </div>
        )}
      </footer>
      <span className="opening-sr" role="status">
        {audioNotice}
        {playback === 'paused' ? ' Opening paused.' : ''}
      </span>
      <span className="opening-sr">
        Space to pause or resume. Escape to skip. Gamepad A activates a focused button, B skips, and
        the directional pad moves focus.
      </span>
      <span className="opening-sr">
        Shot {index + 1} of {openingShots.length}
      </span>
    </section>
  )
}
