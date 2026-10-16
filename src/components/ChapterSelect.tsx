import { useEffect, useRef, useState } from 'react'
import { ArrowRight, List } from 'lucide-react'
import { conclusionChoices } from '../content/harbor'
import { museumContent } from '../content/museum'
import type { ChapterStart, SceneState } from '../state/scene'
import { Modal, ModalHeading } from './Modal'
import './chapter-select.css'

const chapters = [
  { id: 'prologue', title: 'Prologue', detail: 'Mara and Kite’s connection · 34-second cinematic' },
  { id: 'harbor', title: 'The Harbor', detail: 'Chapter One · Begin the investigation' },
  { id: 'museum', title: 'Hall of Waters', detail: 'Chapter One · Begin the museum visit' },
  { id: 'quiet-index', title: 'The Quiet Index', detail: 'Chapter Two · Begin the archive visit' },
] as const

export function ChapterSelect({
  onClose,
  onStart,
  context,
  includePrologue = true,
}: {
  onClose: () => void
  onStart: (start: ChapterStart) => void
  context?: SceneState
  includePrologue?: boolean
}) {
  const [selected, setSelected] = useState<ChapterStart['scene']>(
    context?.phase.startsWith('qi-')
      ? 'quiet-index'
      : context?.phase.startsWith('museum-')
        ? 'museum'
        : 'harbor',
  )
  const [ending, setEnding] = useState<'survey' | 'handshake'>(
    context?.endingChoiceId === 'handshake' ? 'handshake' : 'survey',
  )
  const [lead, setLead] = useState<'stair' | 'voices'>(
    context?.museumLeadId === 'voices' ? 'voices' : 'stair',
  )
  const chapter = chapters.find((chapter) => chapter.id === selected)!
  const contextFields = useRef<HTMLFieldSetElement>(null)
  useEffect(() => {
    contextFields.current?.scrollIntoView?.({ block: 'nearest' })
  }, [selected])
  function start() {
    if (selected === 'prologue' || selected === 'harbor') onStart({ scene: selected })
    else if (selected === 'museum') onStart({ scene: selected, endingChoiceId: ending })
    else onStart({ scene: selected, endingChoiceId: ending, museumLeadId: lead })
  }
  return (
    <Modal
      open
      onClose={onClose}
      titleId="chapters-title"
      className="chapter-select-modal"
      initialFocus=".chapter-option[aria-pressed='true']"
    >
      <ModalHeading
        titleId="chapters-title"
        step="Choose a starting point"
        onClose={onClose}
        closeLabel="Close chapters"
      >
        <List size={17} aria-hidden="true" /> Chapters
      </ModalHeading>
      <div className="chapter-select-body" tabIndex={0}>
        <p className="chapter-select-description">
          Start a fresh visit at any scene. Sound and reading preferences stay as you set them.
        </p>
        <div className="chapter-options" role="group" aria-label="Starting scene">
          {chapters
            .filter((chapter) => includePrologue || chapter.id !== 'prologue')
            .map((chapter) => (
              <button
                key={chapter.id}
                className="chapter-option"
                aria-pressed={selected === chapter.id}
                onClick={() => setSelected(chapter.id)}
              >
                <span>
                  <strong>{chapter.title}</strong>
                  <small>{chapter.detail}</small>
                </span>
                <ArrowRight size={17} aria-hidden="true" />
              </button>
            ))}
        </div>
        {(selected === 'museum' || selected === 'quiet-index') && (
          <fieldset className="chapter-context" ref={contextFields}>
            <legend>Earlier choices</legend>
            <label>
              <span>Harbor outcome</span>
              <select
                aria-label="Harbor outcome"
                value={ending}
                onChange={(event) => setEnding(event.target.value as typeof ending)}
              >
                {conclusionChoices.map((choice) => (
                  <option key={choice.id} value={choice.id}>
                    {choice.label}
                  </option>
                ))}
              </select>
            </label>
            {selected === 'quiet-index' && (
              <label>
                <span>Museum lead</span>
                <select
                  aria-label="Museum lead"
                  value={lead}
                  onChange={(event) => setLead(event.target.value as typeof lead)}
                >
                  {museumContent.leads.map((choice) => (
                    <option key={choice.id} value={choice.id}>
                      {choice.label}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <p>
              The earlier readings will be in field notes. This scene’s choices are yours to make.
            </p>
          </fieldset>
        )}
      </div>
      <footer className="chapter-select-footer">
        {context && <p>Starting here replaces this visit’s story progress.</p>}
        <button className="chapter-start" onClick={start}>
          {selected === 'prologue' ? 'Open' : 'Start'} {chapter.title}{' '}
          <ArrowRight size={18} aria-hidden="true" />
        </button>
      </footer>
    </Modal>
  )
}
