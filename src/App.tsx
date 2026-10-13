import { useEffect, useReducer, useState } from 'react'
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
} from 'lucide-react'
import { characterArt, harborArt } from './art'
import {
  clues,
  conclusionChoices,
  entryChoices,
  sceneCopy,
  sceneSubtitle,
  sceneTitle,
} from './content/harbor'
import { canConclude, getCurrentLine, initialSceneState, sceneReducer } from './state/scene'
import { Kite } from './components/Kite'
import { Modal } from './components/Modal'
import { Perception } from './components/Perception'
import { useMotion } from './hooks/useMotion'

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
  const [panel, setPanel] = useState<'journal' | 'settings' | null>(null)
  const [largeText, setLargeText] = useState(false)
  const motion = useMotion()
  const currentLine = getCurrentLine(state)
  const activeClue = clues.find((clue) => clue.id === state.activeClueId)
  const speaker = currentLine?.speaker ?? 'Kite'
  const isChoice = state.phase === 'entry-choice' || state.phase === 'decision'
  const investigated = canConclude(state)
  const choices = state.phase === 'entry-choice' ? entryChoices : conclusionChoices

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
      if (event.key.toLowerCase() === 'c') {
        event.preventDefault()
        dispatch({ type: 'TOGGLE_PERCEPTION' })
      }
      if (event.key.toLowerCase() === 'j') {
        event.preventDefault()
        setPanel('journal')
      }
      if (
        (event.key === 'Enter' || event.key === ' ') &&
        currentLine &&
        !target.closest('button, a')
      ) {
        event.preventDefault()
        dispatch({ type: 'NEXT' })
      }
      if ((event.key === '1' || event.key === '2') && isChoice) {
        event.preventDefault()
        dispatch({
          type: state.phase === 'entry-choice' ? 'CHOOSE_ENTRY' : 'CHOOSE_ENDING',
          id: choices[Number(event.key) - 1].id,
        })
      }
    }
    window.addEventListener('keydown', keydown)
    return () => window.removeEventListener('keydown', keydown)
  }, [currentLine, isChoice, choices, state.phase])

  useEffect(() => {
    if (state.phase === 'intro') return
    const selector =
      state.phase === 'entry-choice' || state.phase === 'decision'
        ? '.story-choice'
        : state.phase === 'investigation'
          ? '.hotspot'
          : state.phase === 'complete'
            ? '.replay-button'
            : '.continue-button'
    const frame = requestAnimationFrame(() =>
      document.querySelector<HTMLElement>(selector)?.focus({ preventScroll: true }),
    )
    return () => cancelAnimationFrame(frame)
  }, [state.phase])

  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen()
      else await document.documentElement.requestFullscreen()
    } catch {
      /* Browser may restrict fullscreen in an embedded preview. */
    }
  }

  return (
    <main
      className={`novel ${state.perception ? 'cognitive' : ''} ${activeClue ? 'is-inspecting' : ''} ${largeText ? 'large-text' : ''}`}
      data-motion={motion.reduced ? 'reduced' : 'full'}
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
      <div className="scene-art" role="img" aria-label={harborArt.description}>
        <img
          className="harbor-background"
          src={harborArt.background}
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
            onClick={() => setPanel('journal')}
            aria-label={`Open field notes, ${state.inspected.length} clues recorded`}
          >
            <BookOpen size={18} />
            <span className="desktop-label">Field notes</span>
            <span className="mobile-label">Notes</span>
            {state.inspected.length > 0 && <i className="note-count">{state.inspected.length}</i>}
          </button>
          <button
            className="tool-button icon-button"
            onClick={() => setPanel('settings')}
            aria-label="Open accessibility settings"
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

      <section id="scene" className="scene-view" aria-label="Harbor scene">
        <div className="location-heading">
          <div className="eyebrow">
            <span />
            CHAPTER ONE
          </div>
          <h1>{sceneTitle}</h1>
          <p>{sceneSubtitle}</p>
        </div>
        <button
          className="perception-toggle"
          aria-pressed={state.perception}
          onClick={() => dispatch({ type: 'TOGGLE_PERCEPTION' })}
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
        <Perception active={state.perception} />
        {state.endingChoiceId === 'handshake' &&
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
                onClick={() => dispatch({ type: 'OPEN_CLUE', id: clue.id })}
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

      <section
        className={`dialogue-stage ${isChoice ? 'has-choices' : ''}`}
        aria-label="Story and player choices"
      >
        <div className={`companion-portrait speaker-${speaker.toLowerCase()}`}>
          <div className="portrait-orbit" />
          <div className="portrait-disc" />
          {speaker === 'Mara' ? (
            <img
              className="mara-portrait"
              src={characterArt.mara}
              alt="Mara, a coastal researcher with dark curly hair and an ivory jacket"
            />
          ) : (
            <Kite active={state.perception} compact />
          )}
          <span className="portrait-caption">{speaker === 'Mara' ? 'MARA' : 'KITE'}</span>
        </div>
        <div className="dialogue-card">
          <div className="dialogue-topline">
            <span className="speaker-name">
              <i />
              {speaker === 'Narrator' ? 'LARKHAVEN' : speaker}
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
              <button className="continue-button" onClick={() => dispatch({ type: 'NEXT' })}>
                <span>Continue</span>
                <span className="continue-arrow">
                  <ArrowRight size={23} />
                </span>
              </button>
            </div>
          )}
          {isChoice && (
            <div className="choice-block" key={state.phase}>
              <p className="choice-prompt">
                {state.phase === 'entry-choice'
                  ? sceneCopy.openingPrompt
                  : sceneCopy.decisionPrompt}
              </p>
              <div className="choice-list">
                {choices.map((choice, index) => (
                  <button
                    className="story-choice"
                    key={choice.id}
                    onClick={() =>
                      dispatch({
                        type: state.phase === 'entry-choice' ? 'CHOOSE_ENTRY' : 'CHOOSE_ENDING',
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
                    onClick={() => dispatch({ type: 'MAKE_DECISION' })}
                  >
                    Decide together <ArrowRight size={19} />
                  </button>
                ) : (
                  <button
                    className="text-action"
                    onClick={() => dispatch({ type: 'TOGGLE_PERCEPTION' })}
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
              <button className="replay-button" onClick={() => dispatch({ type: 'RESTART' })}>
                <RotateCcw size={18} />
                Return to the harbor
              </button>
            </div>
          )}
        </div>
      </section>

      <footer className="scene-footer">
        <span>{sceneCopy.footer}</span>
      </footer>

      <Modal
        open={!!activeClue}
        onClose={() => dispatch({ type: 'CLOSE_CLUE' })}
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
                onClick={() => dispatch({ type: 'CLOSE_CLUE' })}
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
            <button className="modal-done" onClick={() => dispatch({ type: 'CLOSE_CLUE' })}>
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
        onClose={() => setPanel(null)}
        titleId="notes-title"
        className="notes-modal"
      >
        <div className="modal-topline">
          <span className="eyebrow">
            <BookOpen size={14} />
            Mara + Kite
          </span>
          <button
            className="close-button"
            onClick={() => setPanel(null)}
            aria-label="Close field notes"
          >
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
      </Modal>

      <Modal
        open={panel === 'settings'}
        onClose={() => setPanel(null)}
        titleId="settings-title"
        className="settings-modal"
      >
        <div className="modal-topline">
          <span className="eyebrow">Make yourself at home</span>
          <button
            className="close-button"
            onClick={() => setPanel(null)}
            aria-label="Close settings"
          >
            <X size={20} />
          </button>
        </div>
        <h2 id="settings-title">A comfortable view</h2>
        <label className="setting-row">
          <span>
            <strong>Reduce motion</strong>
            <small>
              {motion.systemReduced
                ? 'Your system preference is already active.'
                : 'Still the parallax, floating geometry, and transitions.'}
            </small>
          </span>
          <input
            type="checkbox"
            checked={motion.reduced}
            disabled={motion.systemReduced}
            onChange={(e) => motion.setManualReduced(e.target.checked)}
          />
        </label>
        <label className="setting-row">
          <span>
            <strong>Larger dialogue</strong>
            <small>A little more room for the words.</small>
          </span>
          <input
            type="checkbox"
            checked={largeText}
            onChange={(e) => setLargeText(e.target.checked)}
          />
        </label>
        <div className="keyboard-guide">
          <span>KEYBOARD</span>
          <p>
            <kbd>Enter</kbd> Continue <kbd>C</kbd> Perception <kbd>J</kbd> Field notes
          </p>
          <p>
            <kbd>1</kbd>
            <kbd>2</kbd> Choose <kbd>Esc</kbd> Close a panel
          </p>
        </div>
        <p className="settings-note">
          All controls also work with Tab and Enter. Scene progress lasts for this visit.
        </p>
      </Modal>
    </main>
  )
}
