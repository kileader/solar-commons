import { useCallback, useEffect, useMemo, useReducer, useState } from 'react'
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
  VolumeX,
  Volume2,
} from 'lucide-react'
import { characterArt, harborArt, museumArt, quietIndexArt } from './art'
import { quietIndexApproaches } from './content/quietIndex'
import { ArchiveWaveform, QuietIndexCompletion } from './components/QuietIndex'
import { IlexIntroduction } from './components/IlexIntroduction'
import { museumApproaches, museumContent, floodSnapshot, type FloodStage } from './content/museum'
import { FloodReconstruction, HistoryExhibit } from './components/Museum'
import { ReadAloudButton, type ReadAloudControls } from './components/ReadAloudButton'
import { museumReadings, modelReading } from './content/museumReadings'
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
import { Modal, ModalHeading } from './components/Modal'
import { sceneGuide } from './components/SceneGuide'
import { DialogueReader } from './components/DialogueReader'
import { PagedReader } from './components/PagedReader'
import { fieldNotes } from './content/fieldNotes'
import { PagedPassage } from './components/PagedPassage'
import { Perception } from './components/Perception'
import { EvidenceDiagram } from './components/EvidenceDiagram'
import { useMotion } from './hooks/useMotion'
import { useAudio } from './hooks/useAudio'
import { useGamepad } from './hooks/useGamepad'
import { adjustControl, moveFocus, visibleControls } from './input/focus'
import type { SoundCue } from './audio/HarborAudio'
import type { DialogueLine } from './content/harbor'
import { NovelSettings } from './components/NovelSettings'
import {
  loadReadingPreferences,
  normalizeReadingPreferences,
  saveReadingPreferences,
  type ReadingPreferences,
} from './reading/preferences'
import './audio/audio.css'

export default function App() {
  const [state, dispatch] = useReducer(sceneReducer, initialSceneState)
  const [panel, setPanel] = useState<
    'journal' | 'settings' | 'history' | 'record' | 'model-account' | null
  >(null)
  const [reading, setReading] = useState(loadReadingPreferences)
  const [auto, setAuto] = useState(false)
  const [evidenceVoice, setEvidenceVoice] = useState<{
    clueId: string | null
    line: DialogueLine | null
  } | null>(null)
  const [readAloud, setReadAloud] = useState<{ id: string; lines: readonly DialogueLine[] } | null>(
    null,
  )
  const [usingGamepad, setUsingGamepad] = useState(false)
  const motion = useMotion()
  const currentLine = getCurrentLine(state)
  const activeClue = clues.find((clue) => clue.id === state.activeClueId)
  const clueVoiceId = activeClue?.id ?? null
  const onEvidenceVoice = useCallback(
    (line: DialogueLine | null) => {
      setEvidenceVoice((previous) =>
        previous?.clueId === clueVoiceId && previous.line === line
          ? previous
          : { clueId: clueVoiceId, line },
      )
    },
    [clueVoiceId],
  )
  const inMuseum = state.phase.startsWith('museum-')
  const inQuietIndex = state.phase.startsWith('qi-')
  const quietIndexComplete = state.phase === 'qi-complete'
  const isChoice = [
    'entry-choice',
    'decision',
    'museum-lead-choice',
    'museum-approach-choice',
    'qi-approach-choice',
  ].includes(state.phase)
  const investigated = canConclude(state)
  const investigationLine = useMemo<DialogueLine>(
    () => ({
      id: `investigation-${investigated}`,
      speaker: 'Kite',
      text: investigated ? sceneCopy.synthesis : sceneCopy.investigation,
    }),
    [investigated],
  )
  const chapterEpilogue = state.discovered ? museumReadings.completion : museumReadings.leaveEarly
  const displayedLine =
    currentLine ??
    (state.phase === 'investigation'
      ? investigationLine
      : state.phase === 'museum-explore'
        ? museumReadings.gallery
        : state.phase === 'museum-complete'
          ? chapterEpilogue
          : null)
  const speaker = displayedLine?.speaker ?? (isChoice ? null : 'Narrator')
  const chapterComplete = state.phase === 'museum-complete' && state.museumLeadId !== null
  const guide = sceneGuide(state)
  const choices =
    state.phase === 'entry-choice'
      ? entryChoices
      : state.phase === 'museum-lead-choice'
        ? museumContent.leads
        : state.phase === 'museum-approach-choice'
          ? museumApproaches
          : state.phase === 'qi-approach-choice'
            ? quietIndexApproaches
            : conclusionChoices
  const choiceEvent =
    state.phase === 'entry-choice'
      ? 'CHOOSE_ENTRY'
      : state.phase === 'museum-lead-choice'
        ? 'CHOOSE_LEAD'
        : state.phase === 'museum-approach-choice'
          ? 'CHOOSE_MUSEUM_APPROACH'
          : state.phase === 'qi-approach-choice'
            ? 'CHOOSE_QUIET_INDEX_APPROACH'
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
  const quietIndexOutside =
    state.phase === 'qi-arrival' ||
    quietIndexComplete ||
    (state.phase === 'qi-ending' && currentLine?.id === 'qi-end-04')
  const background = inQuietIndex
    ? quietIndexOutside
      ? quietIndexArt.canal
      : quietIndexArt.interior
    : inMuseum
      ? museumBackground
      : harborArt.background

  const speechLines = useMemo<readonly DialogueLine[]>(() => {
    if (readAloud) return readAloud.lines
    if (activeClue)
      return evidenceVoice?.clueId === activeClue.id && evidenceVoice.line
        ? [evidenceVoice.line]
        : []
    if (currentLine) return [currentLine]
    if (state.phase === 'investigation') return [investigationLine]
    return []
  }, [readAloud, activeClue, evidenceVoice, currentLine, state.phase, investigationLine])
  const audio = useAudio(
    speechLines,
    panel !== null && !(['history', 'record', 'model-account'].includes(panel) && readAloud),
    state.perception,
  )
  const canRead =
    audio.preferences.voiceEnabled &&
    !audio.preferences.muted &&
    audio.preferences.master * audio.preferences.voice > 0
  const readControls: ReadAloudControls = {
    activeId: ['ended', 'unavailable', 'error'].includes(audio.voiceState)
      ? null
      : (readAloud?.id ?? null),
    completedId: audio.voiceState === 'ended' ? (readAloud?.id ?? null) : null,
    canRead,
    onRead: (id, lines) => {
      audio.unlock()
      if (readAloud?.id === id && audio.voiceState === 'ended') {
        audio.replayVoice()
        return
      }
      setReadAloud((previous) => (previous?.id === id ? null : { id, lines }))
    },
  }
  useEffect(() => {
    if (readAloud && (!canRead || ['unavailable', 'error'].includes(audio.voiceState)))
      setReadAloud(null)
  }, [readAloud, canRead, audio.voiceState])
  const readerPlayback = { audio, auto, preferences: reading, onToggleAuto: toggleAuto }
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

  function perform(event: SceneEvent) {
    setReadAloud(null)
    if (event.type === 'OPEN_CLUE' || event.type === 'CLOSE_CLUE') setEvidenceVoice(null)
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
      case 'CHOOSE_QUIET_INDEX_APPROACH':
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
      case 'VISIT_QUIET_INDEX':
      case 'REPLAY_QUIET_INDEX':
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
      case 'RETURN_TO_MUSEUM':
        cue = 'back'
        break
    }
    audio.play(cue)
    dispatch(event)
  }

  function openPanel(next: 'journal' | 'settings' | 'history' | 'record' | 'model-account') {
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
      if (state.phase === 'qi-intro-shot') return
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
              '.continue-button, .auto-toggle, .voice-replay, .page-back, .page-buttons button, .story-choice, .hotspot, .text-action, .replay-button, .sound-toggle, .record-button, .model-moment, .gate-control, .lamp-discovery',
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
      const root = document.querySelector('dialog[open]') ?? document
      const passage = root.querySelector<HTMLElement>('.scrollable-passage')
      if (passage && passage.scrollHeight > passage.clientHeight) {
        setAuto(false)
        passage.scrollBy({ top: amount, behavior: 'auto' })
      }
    },
  )

  useEffect(() => {
    if (state.phase === 'complete') audio.play('ending')
    if (state.phase === 'ending' && state.endingChoiceId === 'handshake' && state.lineIndex === 1)
      audio.play('signal')
  }, [state.phase, state.endingChoiceId, state.lineIndex, audio.play])

  useEffect(() => {
    const keydown = (event: KeyboardEvent) => {
      if (state.phase === 'qi-intro-shot') return
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
        document.querySelector<HTMLButtonElement>('.continue-button')?.click()
      }
      if (/^[1-3]$/.test(event.key) && isChoice && choices[Number(event.key) - 1]) {
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
            : ['museum-explore', 'museum-complete', 'qi-complete'].includes(state.phase)
              ? '.museum-actions button'
              : '.continue-button'
    const frame = requestAnimationFrame(() => {
      document.querySelector<HTMLElement>(selector)?.focus({ preventScroll: true })
    })
    return () => cancelAnimationFrame(frame)
  }, [state.phase, isChoice])

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

  if (state.phase === 'qi-intro-shot')
    return (
      <IlexIntroduction
        reduced={motion.reduced}
        onComplete={() => perform({ type: 'FINISH_ILEX_INTRO' })}
      />
    )

  return (
    <main
      className={`novel ${inMuseum ? 'museum' : ''} ${inQuietIndex ? 'quiet-index' : ''} ${isChoice ? 'is-choice' : ''} ${state.phase === 'museum-model' ? 'museum-model' : ''} ${state.perception ? 'cognitive' : ''} ${activeClue ? 'is-inspecting' : ''} ${reading.largeText ? 'large-text' : ''}`}
      data-phase={state.phase}
      data-motion={motion.reduced ? 'reduced' : 'full'}
      data-audio-state={audio.status.state}
      data-audio-peak={audio.status.peak.toFixed(6)}
      data-voice-state={audio.voiceState}
      data-voice-line={speechLines[0]?.id ?? ''}
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
          ['Enter', ' ', 'c', 'C', '1', '2', '3', 'j', 'J'].includes(event.key)
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
          inQuietIndex
            ? quietIndexOutside
              ? 'Larkhaven after dark: amber lanterns and gardens reflected in a nocturnal canal'
              : 'The Quiet Index: a lamplit restoration studio with protected recordings and warm electronics'
            : inMuseum
              ? 'Hall of Waters: sunlit galleries, planted glass roofs, and a brass model of the city'
              : harborArt.description
        }
      >
        <img
          className="harbor-background"
          key={background}
          src={background}
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
        aria-label={
          inQuietIndex
            ? 'The Quiet Index scene'
            : inMuseum
              ? 'Hall of Waters scene'
              : 'Harbor scene'
        }
      >
        <div className="location-heading">
          <div className="eyebrow">
            <span />
            {inQuietIndex ? 'CHAPTER TWO' : 'CHAPTER ONE'}
          </div>
          <h1>
            {inQuietIndex
              ? 'The Quiet Index'
              : inMuseum
                ? museumContent.museumCopy.title
                : sceneTitle}
          </h1>
          <p>
            {inQuietIndex
              ? 'Larkhaven · after dark'
              : inMuseum
                ? museumContent.museumCopy.subtitle
                : sceneSubtitle}
          </p>
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
        {!inMuseum && !inQuietIndex && <Perception active={state.perception} />}
        {inQuietIndex && state.perception && (
          <p className="museum-attention">Shared attention · public presence only</p>
        )}
        {['qi-record', 'qi-approach-choice', 'qi-approach', 'qi-playback'].includes(
          state.phase,
        ) && <ArchiveWaveform playback={state.phase === 'qi-playback'} />}
        {inMuseum && state.perception && state.phase !== 'museum-model' && (
          <p className="museum-attention">Shared attention · the worn brass rim</p>
        )}
        {showRecord && (
          <button className="record-button" onClick={() => openPanel('record')}>
            <BookOpen size={18} /> Read the handover record
          </button>
        )}
        {state.phase === 'museum-model' && (
          <FloodReconstruction
            state={state}
            perform={perform}
            onReadHistory={readHistory}
            onReadAccount={() => openPanel('model-account')}
            reading={readControls}
            playback={readerPlayback}
          />
        )}
        {!inMuseum &&
          !inQuietIndex &&
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
          className={`dialogue-stage ${isChoice ? 'has-choices' : ''} ${speaker === 'Narrator' || speaker === 'Unknown speaker (recording)' ? 'is-narration' : ''} ${chapterComplete || quietIndexComplete ? 'chapter-ending' : ''}`}
          aria-label="Story and player choices"
        >
          {(speaker === 'Mara' || speaker === 'Kite' || speaker === 'Ilex') && (
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
              ) : speaker === 'Ilex' ? (
                <img
                  className="ilex-portrait"
                  src={quietIndexArt.ilex}
                  alt="Ilex Vale, an androgynous archivist with an amber augmented eye, exposed cranial lattice, and a white-and-brass prosthetic hand"
                />
              ) : (
                <Kite active={state.perception} compact />
              )}
              <span className="portrait-caption">{speaker.toUpperCase()}</span>
            </div>
          )}
          <div className="dialogue-card">
            <div className="dialogue-topline">
              <span className="speaker-name">
                <i />
                {speaker === 'Narrator' ? 'NARRATION' : (speaker ?? 'YOUR CHOICE')}
              </span>
              {chapterComplete || quietIndexComplete ? (
                <strong className="chapter-complete-badge" role="status">
                  <Check size={16} aria-hidden="true" />{' '}
                  {quietIndexComplete ? 'Chapter Two complete' : 'Chapter One complete'}
                </strong>
              ) : (
                <span className="scene-progress">
                  {state.phase === 'investigation'
                    ? `${state.inspected.length} of 3 examined`
                    : state.phase === 'complete'
                      ? 'Scene complete'
                      : ''}
                </span>
              )}
            </div>
            {currentLine && (
              <DialogueReader
                key={currentLine.id + currentLine.text}
                line={currentLine}
                audio={audio}
                reading={reading}
                auto={auto}
                paused={panel !== null || !!activeClue || !!readAloud}
                onToggleAuto={toggleAuto}
                onReplay={replayDialogue}
                onAdvance={() => perform({ type: 'NEXT' })}
              />
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
                        : state.phase === 'qi-approach-choice'
                          ? 'How does Mara approach Ilex?'
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
                <PagedPassage
                  text={investigationLine.text}
                  line={investigationLine}
                  playback={readerPlayback}
                />
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
                <span className="eyebrow">END OF THE FIRST SCENE</span>
                <h2>{sceneCopy.completionTitle}</h2>
                <PagedPassage
                  text={
                    state.endingChoiceId === 'handshake'
                      ? sceneCopy.handshakeCompletion
                      : sceneCopy.surveyCompletion
                  }
                />
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
                <PagedPassage
                  text={museumContent.museumCopy.explore}
                  line={museumReadings.gallery}
                  playback={readerPlayback}
                />
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
                {chapterComplete && (
                  <p className="chapter-end-note">
                    The listening line leads into Larkhaven’s nocturnal district.
                  </p>
                )}
                <div className="epilogue-heading">
                  <h2>
                    {state.discovered
                      ? museumContent.museumCopy.completionTitle
                      : 'Two waters. An unfinished account.'}
                  </h2>
                  <ReadAloudButton
                    reading={readControls}
                    id="completion"
                    lines={[chapterEpilogue]}
                    label="the chapter epilogue"
                  />
                </div>
                <PagedPassage
                  line={chapterEpilogue}
                  playback={readerPlayback}
                  text={chapterEpilogue.text}
                />
                {museumLead && (
                  <strong className="next-lead">Investigation focus: {museumLead.label}</strong>
                )}
                <div className="museum-actions">
                  {chapterComplete && (
                    <button
                      className="replay-button"
                      onClick={() => perform({ type: 'VISIT_QUIET_INDEX' })}
                    >
                      Continue to The Quiet Index <ArrowRight size={17} />
                    </button>
                  )}
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
            {quietIndexComplete && (
              <QuietIndexCompletion
                state={state}
                onNotes={() => openPanel('journal')}
                onReplay={() => perform({ type: 'REPLAY_QUIET_INDEX' })}
                onMuseum={() => perform({ type: 'RETURN_TO_MUSEUM' })}
              />
            )}
          </div>
        </section>
      )}

      <footer className="scene-footer" aria-label="Story navigation">
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
        <span className="scene-status" role="status" aria-label="Current step">
          {guide.title}
          {state.phase === 'investigation' ? ' · ' + state.inspected.length + '/3 readings' : ''}
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
            <ModalHeading
              titleId="evidence-title"
              step={guide.title}
              onClose={() => perform({ type: 'CLOSE_CLUE' })}
              closeLabel="Close evidence"
            >
              <Sparkles size={14} /> {activeClue.title}
            </ModalHeading>
            <div className="evidence-content">
              <figure className="evidence-figure">
                <EvidenceDiagram kind={activeClue.id} label={activeClue.subtitle} />
                <figcaption>{activeClue.subtitle}</figcaption>
              </figure>
              <PagedReader
                key={activeClue.id}
                onVoiceLine={onEvidenceVoice}
                playback={readerPlayback}
                entries={[
                  {
                    id: 'observed',
                    title: activeClue.observation.label,
                    text: activeClue.observation.value + '\n\n' + activeClue.observation.detail,
                  },
                  {
                    id: 'modeled',
                    title: activeClue.model.label,
                    text: activeClue.model.value + '\n\n' + activeClue.model.detail,
                  },
                  {
                    id: 'uncertain',
                    title: 'What remains uncertain',
                    text: activeClue.contradiction,
                  },
                  ...activeClue.dialogue.map((line) => ({
                    id: line.id,
                    title: line.speaker,
                    text: line.text,
                    voiceLine: line,
                  })),
                ]}
              />
            </div>
            <button className="modal-done" onClick={() => perform({ type: 'CLOSE_CLUE' })}>
              <Check size={16} /> Saved to field notes{' '}
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
        <ModalHeading
          titleId="notes-title"
          step={guide.title}
          onClose={closePanel}
          closeLabel="Close field notes"
        >
          <BookOpen size={14} /> Field notes
        </ModalHeading>
        <PagedReader entries={fieldNotes(state)} />
        <p className="notes-footnote">
          In-world sensor readings are authored fiction. Models are hypotheses, never hidden facts.
        </p>
      </Modal>

      <Modal
        open={panel === 'record'}
        onClose={closePanel}
        titleId="record-title"
        className="record-modal"
      >
        <ModalHeading
          titleId="record-title"
          step={guide.title}
          onClose={closePanel}
          closeLabel="Close handover record"
        >
          <BookOpen size={14} /> The handover record
        </ModalHeading>
        <PagedReader
          active={panel === 'record'}
          playback={readerPlayback}
          entries={[
            {
              id: 'refuge',
              title: museumContent.refugeRecord.designation,
              text: museumContent.refugeRecord.text + '\n\n' + museumContent.refugeRecord.caption,
              reading: {
                id: 'refuge',
                label: 'the handover record',
                lines: [museumReadings.refuge],
              },
            },
          ]}
          reading={readControls}
          onSectionChange={() => setReadAloud(null)}
        />
      </Modal>

      <Modal
        open={panel === 'model-account'}
        onClose={closePanel}
        titleId="model-account-title"
        className="model-account-modal"
      >
        <ModalHeading
          titleId="model-account-title"
          step={guide.title}
          onClose={closePanel}
          closeLabel="Close flood account"
        >
          Flood account
        </ModalHeading>
        <PagedReader
          active={panel === 'model-account'}
          playback={readerPlayback}
          onSectionChange={() => setReadAloud(null)}
          key={`${state.floodStage}-${state.gateOpen}`}
          entries={[
            {
              id: 'model-account',
              title: floodSnapshot(state.floodStage, state.gateOpen).title,
              text:
                floodSnapshot(state.floodStage, state.gateOpen).detail +
                '\n\nA teaching reconstruction. Water levels illustrate competing pressures; the lamp comes from a reproduced handover log.',
              reading: {
                id: `model-${state.floodStage}-${state.gateOpen}`,
                label: 'the flood explanation',
                lines: [modelReading(state.floodStage, state.gateOpen)],
              },
            },
          ]}
          reading={readControls}
        />
      </Modal>

      <HistoryExhibit
        playback={readerPlayback}
        open={panel === 'history'}
        onClose={closePanel}
        reading={readControls}
        step={guide.title}
        onSectionChange={() => setReadAloud(null)}
      />

      <Modal
        open={panel === 'settings'}
        onClose={closePanel}
        titleId="settings-title"
        className="settings-modal"
      >
        <ModalHeading
          titleId="settings-title"
          step={guide.title}
          onClose={closePanel}
          closeLabel="Close settings"
        >
          Settings
        </ModalHeading>
        <NovelSettings
          audio={audio}
          motion={motion}
          controller={controller}
          reading={reading}
          updateReading={updateReading}
          auto={auto}
          setAuto={setAuto}
        />
      </Modal>
    </main>
  )
}
