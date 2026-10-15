import { useEffect, useMemo, useReducer, useState } from 'react'
import {
  ArrowRight,
  BookOpen,
  Check,
  ChevronRight,
  Eye,
  Maximize2,
  RotateCcw,
  Settings2,
  Sparkles,
  Sun,
  X,
  Volume2,
  VolumeX,
  Gamepad2,
  Play,
  Pause,
} from 'lucide-react'
import { characterArt, harborArt, museumArt } from './art'
import { approachNotes, museumApproaches, museumContent, type FloodStage } from './content/museum'
import { FloodReconstruction, HistoryExhibit, RefugeRecord } from './components/Museum'
import { ReadAloudButton, type ReadAloudControls } from './components/ReadAloudButton'
import { museumReadings } from './content/museumReadings'
import {
  clues,
  conclusionChoices,
  entryChoices,
  sceneCopy,
  sceneSubtitle,
  sceneTitle,
} from './content/harbor'
import {
  canConclude,
  getCurrentLine,
  initialSceneState,
  sceneReducer,
  type SceneEvent,
} from './state/scene'
import { Kite } from './components/Kite'
import { Modal } from './components/Modal'
import { Perception } from './components/Perception'
import { useMotion } from './hooks/useMotion'
import { useAudio } from './hooks/useAudio'
import { useGamepad } from './hooks/useGamepad'
import { adjustControl, moveFocus, visibleControls } from './input/focus'
import type { SoundCue } from './audio/HarborAudio'
import type { DialogueLine } from './content/harbor'
import { NovelSettings } from './components/NovelSettings'
import { useAutoAdvance } from './hooks/useAutoAdvance'
import {
  loadReadingPreferences,
  normalizeReadingPreferences,
  saveReadingPreferences,
  type ReadingPreferences,
} from './reading/preferences'
import './audio/audio.css'

function EvidenceDiagram({ kind }: { kind: string }) {
  return (
    <svg className="evidence-diagram" viewBox="0 0 400 105" aria-hidden="true">
      <defs>
        <pattern id={`diagram-${kind}`} width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M20 0H0V20" fill="none" stroke="currentColor" opacity=".1" />
        </pattern>
      </defs>
      <rect width="400" height="105" fill={`url(#diagram-${kind})`} />
      {kind === 'geometry' ? (
        <g fill="none" stroke="currentColor">
          <path d="M90 68 155 28 285 28 320 54 255 85 120 85Z" strokeDasharray="5 4" opacity=".6" />
          {[0, 1, 2, 3, 4, 5].map((n) => (
            <path
              key={n}
              d={`M${115 + n * 23} ${64 - n * 3}l65-33v21l-65 33Z`}
              opacity={0.4 + n * 0.1}
            />
          ))}
        </g>
      ) : kind === 'thermal' ? (
        <g fill="none" stroke="currentColor">
          <path
            d="M0 72Q50 70 80 73T135 71 190 68 220 43 247 51 270 69 320 71 400 71"
            strokeWidth="2"
          />
          <path d="M0 76H400" strokeDasharray="4 5" opacity=".35" />
          <ellipse cx="231" cy="57" rx="42" ry="27" strokeDasharray="3 4" opacity=".5" />
        </g>
      ) : (
        <g fill="none" stroke="currentColor">
          <path d="M30 32H370M30 59H370" opacity=".5" />
          <path d="M30 77H370" strokeDasharray="4 6" opacity=".4" />
          <path d="M60 32v27m55-27v27m55-27v27m55-27v27m55-27v27m55-27v27" opacity=".5" />
          <path d="m178 79 22-13 23 13-23 13Z" strokeDasharray="3 3" />
        </g>
      )}
    </svg>
  )
}

export default function App() {
  const [state, dispatch] = useReducer(sceneReducer, initialSceneState)
  const [panel, setPanel] = useState<'journal' | 'settings' | 'history' | null>(null)
  const [reading, setReading] = useState(loadReadingPreferences)
  const [auto, setAuto] = useState(false)
  const [readAloud, setReadAloud] = useState<{ id: string; lines: readonly DialogueLine[] } | null>(
    null,
  )
  const [usingGamepad, setUsingGamepad] = useState(false)
  const motion = useMotion()
  const currentLine = getCurrentLine(state)
  const activeClue = clues.find((clue) => clue.id === state.activeClueId)
  const speaker = currentLine?.speaker ?? 'Kite'
  const inMuseum = state.phase.startsWith('museum-')
  const isChoice = [
    'entry-choice',
    'decision',
    'museum-lead-choice',
    'museum-approach-choice',
  ].includes(state.phase)
  const investigated = canConclude(state)
  const choices =
    state.phase === 'entry-choice'
      ? entryChoices
      : state.phase === 'museum-lead-choice'
        ? museumContent.leads
        : state.phase === 'museum-approach-choice'
          ? museumApproaches
          : conclusionChoices
  const choiceEvent =
    state.phase === 'entry-choice'
      ? 'CHOOSE_ENTRY'
      : state.phase === 'museum-lead-choice'
        ? 'CHOOSE_LEAD'
        : state.phase === 'museum-approach-choice'
          ? 'CHOOSE_MUSEUM_APPROACH'
          : 'CHOOSE_ENDING'
  const museumLead = museumContent.leads.find((lead) => lead.id === state.museumLeadId)
  const museumBackground =
    state.phase === 'museum-arrival' && state.lineIndex === 0
      ? museumArt.exterior
      : state.phase === 'museum-approach' && state.museumApproach === 'memory'
        ? museumArt.exhibit
        : ['museum-arrival', 'museum-approach-choice', 'museum-explore'].includes(state.phase)
          ? museumArt.hall
          : museumArt.model
  const showRecord =
    state.discovered &&
    ((state.phase === 'museum-discovery' && state.lineIndex >= 6) ||
      state.phase === 'museum-complete')

  const speechLines = useMemo<readonly DialogueLine[]>(() => {
    if (readAloud) return readAloud.lines
    if (activeClue) return activeClue.dialogue
    if (currentLine) return [currentLine]
    if (state.phase === 'investigation')
      return [
        {
          id: `investigation-${investigated}`,
          speaker: 'Kite',
          text: investigated ? sceneCopy.synthesis : sceneCopy.investigation,
        },
      ]
    return []
  }, [readAloud, activeClue, currentLine, state.phase, investigated])
  const audio = useAudio(
    speechLines,
    panel !== null && !(panel === 'history' && readAloud),
    state.perception,
  )
  const canRead =
    audio.preferences.voiceEnabled &&
    !audio.preferences.muted &&
    audio.preferences.master * audio.preferences.voice > 0
  const readControls: ReadAloudControls = {
    activeId: readAloud?.id ?? null,
    canRead,
    onRead: (id, lines) => {
      audio.unlock()
      setReadAloud((previous) => (previous?.id === id ? null : { id, lines }))
    },
  }
  useEffect(() => {
    if (readAloud && (!canRead || ['ended', 'unavailable', 'error'].includes(audio.voiceState)))
      setReadAloud(null)
  }, [readAloud, canRead, audio.voiceState])
  function replayDialogue() {
    setReadAloud(null)
    audio.replayVoice()
  }
  useEffect(() => saveReadingPreferences(reading), [reading])
  function updateReading(patch: Partial<ReadingPreferences>) {
    setReading((previous) => normalizeReadingPreferences({ ...previous, ...patch }))
  }
  function toggleAuto() {
    audio.unlock()
    setAuto((previous) => !previous)
  }
  useAutoAdvance(
    currentLine,
    auto,
    panel !== null || !!activeClue || !!readAloud,
    audio.voiceState,
    reading,
    () => perform({ type: 'NEXT' }),
  )

  function perform(event: SceneEvent) {
    setReadAloud(null)
    audio.unlock()
    let cue: SoundCue = 'confirm'
    switch (event.type) {
      case 'NEXT':
        cue = 'advance'
        break
      case 'CHOOSE_ENTRY':
      case 'CHOOSE_ENDING':
      case 'CHOOSE_LEAD':
      case 'CHOOSE_MUSEUM_APPROACH':
        cue = 'choice'
        break
      case 'TOGGLE_PERCEPTION':
        cue = state.perception ? 'perception-off' : 'perception-on'
        break
      case 'OPEN_CLUE':
        cue =
          state.inspected.length === 2 && !state.inspected.includes(event.id)
            ? 'discovery'
            : event.id === 'archive'
              ? 'archive'
              : event.id === 'thermal'
                ? 'thermal'
                : 'evidence'
        break
      case 'CLOSE_CLUE':
        cue = 'back'
        break
      case 'RESTART':
        cue = 'restart'
        setAuto(false)
        break
      case 'INSPECT_LAMP':
        cue = 'discovery'
        break
      case 'VISIT_MUSEUM':
      case 'ENTER_MODEL':
        cue = 'open'
        break
      case 'SET_FLOOD_STAGE':
      case 'TOGGLE_GATE':
        cue = 'evidence'
        break
      case 'READ_HISTORY':
      case 'READ_HANDOVER':
        cue = 'archive'
        break
      case 'LEAVE_MODEL':
        cue = 'back'
        break
    }
    audio.play(cue)
    dispatch(event)
  }

  function openPanel(next: 'journal' | 'settings' | 'history') {
    setReadAloud(null)
    audio.unlock()
    if (activeClue) perform({ type: 'CLOSE_CLUE' })
    audio.play(panel === next ? 'back' : next === 'journal' ? 'archive' : 'open')
    setPanel((previous) => (previous === next ? null : next))
  }
  function readHistory() {
    perform({ type: 'READ_HISTORY' })
    openPanel('history')
  }
  function closePanel() {
    setReadAloud(null)
    audio.play('back')
    setPanel(null)
  }

  const controller = useGamepad(
    (action) => {
      setUsingGamepad(true)
      const modal = document.querySelector<HTMLDialogElement>('dialog[open]')
      if (action === 'back') {
        if (activeClue) perform({ type: 'CLOSE_CLUE' })
        else if (panel) closePanel()
        return
      }
      if (action === 'settings') {
        openPanel('settings')
        return
      }
      if (action === 'notes') {
        openPanel('journal')
        return
      }
      if (action === 'mute') {
        audio.toggle()
        return
      }
      if (action === 'perception') {
        if (!modal) perform({ type: 'TOGGLE_PERCEPTION' })
        return
      }
      if (action === 'replay') {
        if (!panel) replayDialogue()
        return
      }
      const controls = modal
        ? visibleControls(modal)
        : visibleControls(document).filter((element) =>
            element.matches(
              '.continue-button, .auto-toggle, .voice-replay, .story-choice, .hotspot, .text-action, .replay-button, .sound-toggle, .model-moment, .gate-control, .lamp-discovery',
            ),
          )
      const focused = document.activeElement as HTMLElement | null
      if (action === 'confirm') {
        const target =
          focused && controls.includes(focused)
            ? focused
            : (controls.find((element) =>
                element.matches('.continue-button, .story-choice, .hotspot, .replay-button'),
              ) ?? controls[0])
        if (target?.matches('button, input[type="checkbox"]')) {
          target.focus()
          target.click()
        }
        return
      }
      const direction = action === 'up' || action === 'left' ? -1 : 1
      if ((action === 'left' || action === 'right') && focused && adjustControl(focused, direction))
        return
      moveFocus(controls, direction)
    },
    (amount) => {
      const target = document.querySelector('dialog[open]') ?? document.scrollingElement
      target?.scrollBy({ top: amount, behavior: 'auto' })
    },
  )

  useEffect(() => {
    if (state.phase === 'complete') audio.play('ending')
    if (state.phase === 'ending' && state.endingChoiceId === 'handshake' && state.lineIndex === 1)
      audio.play('signal')
  }, [state.phase, state.endingChoiceId, state.lineIndex, audio.play])

  useEffect(() => {
    const keydown = (event: KeyboardEvent) => {
      if (
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        event.repeat ||
        document.querySelector('dialog[open]')
      )
        return
      const target = event.target as HTMLElement
      if (target.closest('input, select, textarea, [contenteditable="true"]')) return
      if (event.key.toLowerCase() === 'a') {
        event.preventDefault()
        toggleAuto()
      }
      if (event.key.toLowerCase() === 'c') {
        event.preventDefault()
        perform({ type: 'TOGGLE_PERCEPTION' })
      }
      if (event.key.toLowerCase() === 'j') {
        event.preventDefault()
        openPanel('journal')
      }
      if (
        (event.key === 'Enter' || event.key === ' ') &&
        currentLine &&
        !target.closest('button, a')
      ) {
        event.preventDefault()
        perform({ type: 'NEXT' })
      }
      if ((event.key === '1' || event.key === '2') && isChoice) {
        event.preventDefault()
        perform({
          type: choiceEvent,
          id: choices[Number(event.key) - 1].id,
        })
      }
      if (state.phase === 'museum-model' && ['1', '2', '3'].includes(event.key)) {
        event.preventDefault()
        perform({ type: 'SET_FLOOD_STAGE', stage: (Number(event.key) - 1) as FloodStage })
      }
    }
    window.addEventListener('keydown', keydown)
    return () => window.removeEventListener('keydown', keydown)
  })

  useEffect(() => {
    if (state.phase === 'intro') return
    const selector = isChoice
      ? '.story-choice'
      : state.phase === 'investigation'
        ? '.hotspot'
        : state.phase === 'complete'
          ? '.replay-button'
          : state.phase === 'museum-model'
            ? '.model-moment'
            : ['museum-explore', 'museum-complete'].includes(state.phase)
              ? '.museum-actions button'
              : '.continue-button'
    const frame = requestAnimationFrame(() =>
      document.querySelector<HTMLElement>(selector)?.focus({ preventScroll: true }),
    )
    return () => cancelAnimationFrame(frame)
  }, [state.phase])

  async function toggleFullscreen() {
    audio.unlock()
    audio.play('open')
    try {
      if (document.fullscreenElement) await document.exitFullscreen()
      else await document.documentElement.requestFullscreen()
    } catch {
      /* Browser may restrict fullscreen in an embedded preview. */
    }
  }

  return (
    <main
      className={`novel ${inMuseum ? 'museum' : ''} ${state.phase === 'museum-model' ? 'museum-model' : ''} ${state.perception ? 'cognitive' : ''} ${activeClue ? 'is-inspecting' : ''} ${reading.largeText ? 'large-text' : ''}`}
      data-motion={motion.reduced ? 'reduced' : 'full'}
      data-audio-state={audio.status.state}
      data-audio-peak={audio.status.peak.toFixed(6)}
      data-voice-state={audio.voiceState}
      data-auto={auto ? 'on' : 'off'}
      data-controller-state={controller}
      data-input={usingGamepad ? 'gamepad' : 'pointer'}
      onPointerDownCapture={(event) => {
        setUsingGamepad(false)
        if (
          event.isTrusted &&
          !audio.preferences.muted &&
          !(event.target as HTMLElement).closest('.sound-toggle')
        )
          audio.unlock()
      }}
      onKeyDownCapture={(event) => {
        setUsingGamepad(false)
        if (event.repeat && (event.key === 'Enter' || event.key === ' ')) event.preventDefault()
        if (
          event.isTrusted &&
          !audio.preferences.muted &&
          !(event.target as HTMLElement).closest('.sound-toggle') &&
          ['Enter', ' ', 'c', 'C', '1', '2', 'j', 'J'].includes(event.key)
        )
          audio.unlock()
      }}
      onClickCapture={(event) => {
        if ((event.target as HTMLElement).matches('input[type="checkbox"]')) audio.play('confirm')
      }}
      onFocusCapture={(event) => {
        if ((event.target as HTMLElement).matches('button, input, select')) audio.play('focus')
      }}
      onPointerOver={(event) => {
        const button = (event.target as HTMLElement).closest('button')
        if (
          button &&
          !(event.relatedTarget instanceof Node && button.contains(event.relatedTarget))
        )
          audio.play('focus')
      }}
      onPointerMove={(event) => {
        if (motion.reduced || event.pointerType !== 'mouse') return
        const rect = event.currentTarget.getBoundingClientRect()
        event.currentTarget.style.setProperty(
          '--look-x',
          `${(event.clientX / rect.width - 0.5) * 10}px`,
        )
        event.currentTarget.style.setProperty(
          '--look-y',
          `${(event.clientY / rect.height - 0.5) * 6}px`,
        )
      }}
      onPointerLeave={(event) => {
        event.currentTarget.style.setProperty('--look-x', '0px')
        event.currentTarget.style.setProperty('--look-y', '0px')
      }}
    >
      <div
        className="scene-art"
        role="img"
        aria-label={
          inMuseum
            ? 'Hall of Waters: sunlit galleries, planted glass roofs, and a brass model of the city'
            : harborArt.description
        }
      >
        <img
          className="harbor-background"
          key={inMuseum ? museumBackground : 'harbor'}
          src={inMuseum ? museumBackground : harborArt.background}
          alt=""
          style={{ objectPosition: harborArt.focalPoint }}
          fetchPriority="high"
        />
        <div className="water-light" />
        <div className="sunlight" />
        <div className="scene-vignette" />
        <div className="atmosphere">
          {Array.from({ length: 8 }, (_, i) => (
            <i
              key={i}
              style={{
                left: `${12 + i * 11}%`,
                top: `${22 + ((i * 17) % 42)}%`,
                animationDelay: `-${i * 3}s`,
              }}
            />
          ))}
        </div>
        <svg className="foreground-frond" viewBox="0 0 340 280" aria-hidden="true">
          <g fill="#123e34">
            <path d="M-20 300Q85 143 262 69Q143 186-20 300Z" />
            {[0, 1, 2, 3, 4].map((i) => (
              <g key={i} transform={`translate(${i * 44} ${-i * 34})`}>
                <path d="M8 274Q-4 179 20 159Q63 180 49 239Z" />
                <path d="M28 249Q93 186 128 206Q100 261 28 267Z" />
              </g>
            ))}
          </g>
        </svg>
      </div>

      <header className="topbar">
        <a href="#scene" className="wordmark" aria-label="Solar Commons, jump to scene">
          <span className="brand-mark">
            <Sun size={23} strokeWidth={1.4} />
          </span>
          <span>SOLAR COMMONS</span>
        </a>
        <nav className="scene-tools" aria-label="Scene controls">
          <button
            className="tool-button journal-button"
            onClick={() => openPanel('journal')}
            aria-label={`Open field notes, ${state.inspected.length} clues recorded`}
          >
            <BookOpen size={18} />
            <span className="desktop-label">Field notes</span>
            <span className="mobile-label">Notes</span>
            {state.inspected.length > 0 && <i className="note-count">{state.inspected.length}</i>}
          </button>
          <button
            className="tool-button icon-button"
            onClick={() => openPanel('settings')}
            aria-label="Open settings"
            title="Settings"
          >
            <Settings2 size={18} />
          </button>
          <button
            className="tool-button icon-button fullscreen-button"
            onClick={toggleFullscreen}
            aria-label="Toggle fullscreen"
            title="Fullscreen"
          >
            <Maximize2 size={17} />
          </button>
        </nav>
      </header>

      <section
        id="scene"
        className="scene-view"
        aria-label={inMuseum ? 'Hall of Waters scene' : 'Harbor scene'}
      >
        <div className="location-heading">
          <div className="eyebrow">
            <span />
            CHAPTER ONE
          </div>
          <h1>{inMuseum ? museumContent.museumCopy.title : sceneTitle}</h1>
          <p>{inMuseum ? museumContent.museumCopy.subtitle : sceneSubtitle}</p>
        </div>
        <button
          className="perception-toggle"
          aria-pressed={state.perception}
          onClick={() => perform({ type: 'TOGGLE_PERCEPTION' })}
        >
          <span className="perception-icon">
            <Eye size={19} />
          </span>
          <span>
            Cognitive Perception
            <small>{state.perception ? 'On · shared sight' : 'Off · natural sight'}</small>
          </span>
          <i className="toggle-indicator" />
        </button>
        {!inMuseum && <Perception active={state.perception} />}
        {inMuseum && state.perception && state.phase !== 'museum-model' && (
          <p className="museum-attention">Shared attention · the worn brass rim</p>
        )}
        {showRecord && <RefugeRecord reading={readControls} />}
        {state.phase === 'museum-model' && (
          <FloodReconstruction
            state={state}
            perform={perform}
            onReadHistory={readHistory}
            reading={readControls}
          />
        )}
        {!inMuseum &&
          state.endingChoiceId === 'handshake' &&
          (state.phase === 'complete' || (state.phase === 'ending' && state.lineIndex >= 1)) && (
            <div className="optical-emission" aria-hidden="true">
              <span />
              <span />
              <span />
              <small>Observed · delayed light</small>
            </div>
          )}
        {state.phase === 'investigation' && (
          <div className="hotspots" aria-label="Investigation locations">
            {clues.map((clue, index) => (
              <button
                key={clue.id}
                className={`hotspot hotspot-${clue.id} ${state.inspected.includes(clue.id) ? 'is-read' : ''}`}
                style={{ left: `${clue.position.x}%`, top: `${clue.position.y}%` }}
                onClick={() => perform({ type: 'OPEN_CLUE', id: clue.id })}
                aria-label={`Examine ${clue.title}${state.inspected.includes(clue.id) ? ', recorded' : ''}`}
              >
                <span className="hotspot-target">
                  {state.inspected.includes(clue.id) ? (
                    <Check size={16} />
                  ) : (
                    <span className="marker-number">{index + 1}</span>
                  )}
                </span>
                <span className="hotspot-label">{sceneCopy.clueLabels[clue.id]}</span>
              </button>
            ))}
          </div>
        )}
      </section>

      {state.phase !== 'museum-model' && (
        <section
          className={`dialogue-stage ${isChoice ? 'has-choices' : ''} ${speaker === 'Narrator' ? 'is-narration' : ''}`}
          aria-label="Story and player choices"
        >
          {speaker !== 'Narrator' && (
            <div
              className={`companion-portrait speaker-${speaker.toLowerCase()} ${audio.voiceState === 'speaking' && !readAloud ? 'is-speaking' : ''}`}
            >
              <div className="portrait-orbit" />
              <div className="portrait-disc" />
              {speaker === 'Mara' ? (
                <img
                  className="mara-portrait"
                  src={characterArt.mara}
                  alt="Mara, a coastal researcher with dark curly hair, an ivory jacket, and a mint-lit temple module"
                />
              ) : (
                <Kite active={state.perception} compact />
              )}
              <span className="portrait-caption">{speaker === 'Mara' ? 'MARA' : 'KITE'}</span>
            </div>
          )}
          <div className="dialogue-card">
            <div className="dialogue-topline">
              <span className="speaker-name">
                <i />
                {speaker === 'Narrator' ? 'NARRATION' : speaker}
              </span>
              <span className="scene-progress">
                {state.phase === 'investigation'
                  ? `${state.inspected.length} of 3 examined`
                  : state.phase === 'complete'
                    ? 'Scene complete'
                    : isChoice
                      ? 'Your choice'
                      : ''}
              </span>
            </div>
            {currentLine && (
              <div className="dialogue-body">
                <div className="dialogue-text" aria-live="polite" aria-atomic="true">
                  <p key={currentLine.id} className={speaker === 'Narrator' ? 'narration' : ''}>
                    {currentLine.text}
                  </p>
                </div>
                <div className="dialogue-buttons">
                  <button
                    className="voice-replay"
                    onClick={replayDialogue}
                    disabled={
                      !audio.ready ||
                      !audio.hasVoice ||
                      !audio.preferences.voiceEnabled ||
                      audio.preferences.muted ||
                      audio.preferences.master * audio.preferences.voice === 0
                    }
                    aria-label="Replay dialogue"
                    title={
                      audio.hasVoice
                        ? 'Listen to this dialogue again'
                        : 'No recording or enabled fallback voice for this line'
                    }
                  >
                    <Volume2 size={17} />
                    <span>Listen</span>
                  </button>
                  <button
                    className="auto-toggle"
                    onClick={toggleAuto}
                    aria-pressed={auto}
                    aria-label="Autoplay dialogue"
                    title="Auto: wait for the voice, then continue. A to toggle."
                  >
                    {auto ? <Pause size={16} /> : <Play size={16} />}
                    <span>Auto{auto ? ' on' : ''}</span>
                  </button>
                  <button className="continue-button" onClick={() => perform({ type: 'NEXT' })}>
                    <span>Continue</span>
                    <span className="continue-arrow">
                      <ArrowRight size={23} />
                    </span>
                  </button>
                </div>
              </div>
            )}
            {isChoice && (
              <div className="choice-block" key={state.phase}>
                {auto && <p className="auto-wait">Auto is waiting for your choice.</p>}
                <p className="choice-prompt">
                  {state.phase === 'entry-choice'
                    ? sceneCopy.openingPrompt
                    : state.phase === 'museum-lead-choice'
                      ? museumContent.museumCopy.leadPrompt
                      : state.phase === 'museum-approach-choice'
                        ? 'What catches your attention?'
                        : sceneCopy.decisionPrompt}
                </p>
                <div className="choice-list">
                  {choices.map((choice, index) => (
                    <button
                      className="story-choice"
                      key={choice.id}
                      onClick={() =>
                        perform({
                          type: choiceEvent,
                          id: choice.id,
                        })
                      }
                    >
                      <span className="choice-number">0{index + 1}</span>
                      <span>
                        <strong>{choice.label}</strong>
                        <small>{choice.detail}</small>
                      </span>
                      <ChevronRight size={19} />
                    </button>
                  ))}
                </div>
              </div>
            )}
            {state.phase === 'investigation' && (
              <div className="investigation-body">
                <p>{investigated ? sceneCopy.synthesis : sceneCopy.investigation}</p>
                <div className="investigation-actions">
                  <span className="reading-dots">
                    {clues.map((clue) => (
                      <i
                        key={clue.id}
                        className={state.inspected.includes(clue.id) ? 'filled' : ''}
                      />
                    ))}
                    <small>
                      {investigated ? 'All readings recorded' : 'Select a marker to investigate'}
                    </small>
                  </span>
                  {investigated ? (
                    <button
                      className="text-action"
                      onClick={() => perform({ type: 'MAKE_DECISION' })}
                    >
                      Decide together <ArrowRight size={19} />
                    </button>
                  ) : (
                    <button
                      className="text-action"
                      onClick={() => perform({ type: 'TOGGLE_PERCEPTION' })}
                    >
                      <Eye size={17} />
                      {state.perception ? 'Return to natural sight' : 'Open shared perception'}
                    </button>
                  )}
                </div>
              </div>
            )}
            {state.phase === 'complete' && (
              <div className="complete-body">
                <div>
                  <span className="eyebrow">END OF THE FIRST SCENE</span>
                  <h2>{sceneCopy.completionTitle}</h2>
                  <p>
                    {state.endingChoiceId === 'handshake'
                      ? sceneCopy.handshakeCompletion
                      : sceneCopy.surveyCompletion}
                  </p>
                </div>
                <div className="museum-actions">
                  <button
                    className="replay-button"
                    onClick={() => perform({ type: 'VISIT_MUSEUM' })}
                  >
                    Visit the Hall of Waters <ArrowRight size={18} />
                  </button>
                  <button className="text-action" onClick={() => perform({ type: 'RESTART' })}>
                    <RotateCcw size={16} /> Return to the harbor
                  </button>
                </div>
              </div>
            )}
            {state.phase === 'museum-explore' && (
              <div className="museum-summary">
                <span className="eyebrow">THE TIDE GALLERY</span>
                <p>{museumContent.museumCopy.explore}</p>
                <ReadAloudButton
                  reading={readControls}
                  id="gallery"
                  lines={[museumReadings.gallery]}
                  label="the gallery description"
                />
                <div className="museum-actions">
                  <button
                    className="replay-button"
                    onClick={() => perform({ type: 'ENTER_MODEL' })}
                  >
                    Try the tide model <ArrowRight size={18} />
                  </button>
                  <button
                    className="text-action"
                    onClick={() => perform({ type: 'READ_HANDOVER' })}
                  >
                    Follow the written dawn account <ArrowRight size={17} />
                  </button>
                  <button className="text-action" onClick={readHistory}>
                    <BookOpen size={17} /> Read the history wall <small>Optional</small>
                  </button>
                </div>
              </div>
            )}
            {state.phase === 'museum-complete' && (
              <div className="museum-summary">
                <span className="eyebrow">END OF CHAPTER ONE</span>
                <h2>
                  {state.discovered
                    ? museumContent.museumCopy.completionTitle
                    : 'Two waters. An unfinished account.'}
                </h2>
                <p>
                  {state.discovered
                    ? museumContent.museumCopy.completion
                    : museumReadings.leaveEarly.text}
                </p>
                <ReadAloudButton
                  reading={readControls}
                  id="completion"
                  lines={[state.discovered ? museumReadings.completion : museumReadings.leaveEarly]}
                  label="the chapter epilogue"
                />
                {museumLead && (
                  <strong className="next-lead">Your next step: {museumLead.label}</strong>
                )}
                <div className="museum-actions">
                  <button
                    className="replay-button"
                    onClick={() => perform({ type: 'ENTER_MODEL' })}
                  >
                    Revisit the tide model <ArrowRight size={17} />
                  </button>
                  <button className="text-action" onClick={() => openPanel('journal')}>
                    <BookOpen size={17} /> Review field notes
                  </button>
                  <button className="text-action" onClick={readHistory}>
                    Read the history wall
                  </button>
                  {!state.discovered && (
                    <button
                      className="text-action"
                      onClick={() => perform({ type: 'READ_HANDOVER' })}
                    >
                      Follow the written dawn account
                    </button>
                  )}
                  <button className="text-action" onClick={() => perform({ type: 'RESTART' })}>
                    <RotateCcw size={16} /> Return to the harbor
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      <footer className="scene-footer">
        <button
          className="sound-toggle"
          onClick={audio.toggle}
          disabled={audio.status.state === 'unsupported'}
          aria-label={
            !audio.ready ? 'Enable sound' : audio.preferences.muted ? 'Unmute sound' : 'Mute sound'
          }
        >
          {audio.preferences.muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          <span>
            {audio.status.state === 'unsupported'
              ? 'Sound unavailable'
              : !audio.ready
                ? 'Enable sound'
                : audio.preferences.muted
                  ? 'Sound off'
                  : 'Sound on'}
          </span>
        </button>
        <span>
          {controller === 'connected' ? (
            <>
              <Gamepad2 size={15} />
              Controller connected
            </>
          ) : (
            sceneCopy.footer
          )}
        </span>
      </footer>

      <Modal
        open={!!activeClue}
        onClose={() => perform({ type: 'CLOSE_CLUE' })}
        titleId="evidence-title"
        className="evidence-modal"
      >
        {activeClue && (
          <>
            <div className="modal-topline">
              <span className="eyebrow">
                <Sparkles size={14} />
                Evidence {clues.indexOf(activeClue) + 1} of 3
              </span>
              <button
                className="close-button"
                onClick={() => perform({ type: 'CLOSE_CLUE' })}
                aria-label="Close evidence"
              >
                <X size={20} />
              </button>
            </div>
            <h2 id="evidence-title">{activeClue.title}</h2>
            <p className="modal-subtitle">{activeClue.subtitle}</p>
            <EvidenceDiagram kind={activeClue.id} />
            <div className="evidence-readings">
              <section className="evidence-reading observed">
                <h3>
                  <i />
                  {activeClue.observation.label}
                </h3>
                <strong>{activeClue.observation.value}</strong>
                <p>{activeClue.observation.detail}</p>
              </section>
              <section className="evidence-reading modeled">
                <h3>
                  <i />
                  {activeClue.model.label}
                </h3>
                <strong>{activeClue.model.value}</strong>
                <p>{activeClue.model.detail}</p>
              </section>
            </div>
            <div className="uncertainty">
              <span>What remains uncertain</span>
              <p>{activeClue.contradiction}</p>
            </div>
            <div className="evidence-dialogue">
              {activeClue.dialogue.map((line) => (
                <p key={line.id}>
                  <span>{line.speaker}</span>
                  {line.text}
                </p>
              ))}
            </div>
            <button className="modal-done" onClick={() => perform({ type: 'CLOSE_CLUE' })}>
              <Check size={16} />
              Saved to field notes
              <span>
                Return to the harbor <ArrowRight size={17} />
              </span>
            </button>
          </>
        )}
      </Modal>

      <Modal
        open={panel === 'journal'}
        onClose={closePanel}
        titleId="notes-title"
        className="notes-modal"
      >
        <div className="modal-topline">
          <span className="eyebrow">
            <BookOpen size={14} />
            Mara + Kite
          </span>
          <button className="close-button" onClick={closePanel} aria-label="Close field notes">
            <X size={20} />
          </button>
        </div>
        <h2 id="notes-title">Field notes</h2>
        <p className="modal-subtitle">{sceneCopy.notesSubtitle}</p>
        {state.inspected.length === 0 ? (
          <div className="empty-notes">
            <span>01</span>
            <p>{sceneCopy.emptyNotes}</p>
            <small>Your observations will appear here as you investigate.</small>
          </div>
        ) : (
          <div className="note-list">
            {clues
              .filter((clue) => state.inspected.includes(clue.id))
              .map((clue) => (
                <article key={clue.id}>
                  <h3>{clue.title}</h3>
                  <p>
                    <span>Observed:</span> {clue.observation.value}
                  </p>
                  <p>
                    <span>Modeled:</span> {clue.model.value}
                  </p>
                  <small>{clue.contradiction}</small>
                </article>
              ))}
          </div>
        )}
        <p className="notes-footnote">
          In-world sensor readings are authored fiction. Models are hypotheses, never hidden facts.
        </p>
        {(state.exhibitRead || state.discovered || state.museumApproach) && (
          <div className="note-list">
            {state.museumApproach && (
              <article>
                <h3>{approachNotes[state.museumApproach].title}</h3>
                <p>{approachNotes[state.museumApproach].text}</p>
              </article>
            )}
            {state.exhibitRead && (
              <article>
                <h3>The Night of Two Waters</h3>
                <p>
                  Storm tide and hill runoff met in the lower city. A refuge beneath the east
                  breakwater kept a listening line to shore.
                </p>
              </article>
            )}
            {state.discovered && (
              <article>
                <h3>{museumContent.refugeRecord.heading}</h3>
                <p>{museumContent.refugeRecord.text}</p>
                <small>
                  The replica’s six ribs fit our partial sonar. A possible location, not a date or
                  an explanation for today’s warmth or lights.
                </small>
              </article>
            )}
            {museumLead && (
              <article>
                <h3>Next step: {museumLead.label}</h3>
                <p>{museumLead.detail}</p>
              </article>
            )}
          </div>
        )}
      </Modal>

      <HistoryExhibit open={panel === 'history'} onClose={closePanel} reading={readControls} />

      <Modal
        open={panel === 'settings'}
        onClose={closePanel}
        titleId="settings-title"
        className="settings-modal"
      >
        <div className="modal-topline">
          <span className="eyebrow">Make yourself at home</span>
          <button className="close-button" onClick={closePanel} aria-label="Close settings">
            <X size={20} />
          </button>
        </div>
        <h2 id="settings-title">Settings</h2>
        <NovelSettings
          audio={audio}
          motion={motion}
          controller={controller}
          reading={reading}
          updateReading={updateReading}
          auto={auto}
          setAuto={setAuto}
        />
        <p className="settings-note">
          All controls also work with Tab and Enter. Scene progress lasts for this visit.
        </p>
      </Modal>
    </main>
  )
}
