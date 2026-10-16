import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react'
import { useLayoutEffect } from 'react'
import { useTextPages } from '../hooks/useTextPages'
import { useAutoScroll } from '../hooks/useAutoScroll'
import { readingTime, useAutoAdvance } from '../hooks/useAutoAdvance'
import type { useAudio } from '../hooks/useAudio'
import type { ReadingPreferences } from '../reading/preferences'
import { defaultReadingPreferences } from '../reading/preferences'
import type { ReadingEntry } from '../reading/pagination'
import { ReadAloudButton, type ReadAloudControls } from './ReadAloudButton'
import type { DialogueLine } from '../content/harbor'

export interface ReaderEntry extends ReadingEntry {
  reading?: { id: string; label: string; lines: readonly DialogueLine[] }
  voiceLine?: DialogueLine
}

export interface ReaderPlayback {
  audio: ReturnType<typeof useAudio>
  auto: boolean
  preferences: ReadingPreferences
  onToggleAuto: () => void
}

export function PageButtons({
  index,
  count,
  onPage,
  nextLabel = 'Next',
  finish,
}: {
  index: number
  count: number
  onPage: (next: number) => void
  nextLabel?: string
  finish?: { label: string; onFinish: () => void }
}) {
  const last = index + 1 >= count
  return (
    <nav className="page-buttons" aria-label="Reading pages">
      <button aria-label="Previous page" disabled={index === 0} onClick={() => onPage(index - 1)}>
        <ChevronLeft size={18} /> <span>Back</span>
      </button>
      <span role="status">
        {index + 1} / {count}
      </span>
      <button
        aria-label={last && finish ? finish.label : 'Next page'}
        className={finish ? 'reader-primary' : undefined}
        disabled={last && !finish}
        onClick={() => (last && finish ? finish.onFinish() : onPage(index + 1))}
      >
        <span>{last && finish ? finish.label : nextLabel}</span> <ChevronRight size={18} />
      </button>
    </nav>
  )
}

export function PagedReader({
  entries,
  reading,
  onSectionChange,
  playback,
  onVoiceLine,
  active = true,
  nextLabel,
  finish,
}: {
  entries: readonly ReaderEntry[]
  reading?: ReadAloudControls
  onSectionChange?: () => void
  playback?: ReaderPlayback
  onVoiceLine?: (line: DialogueLine | null) => void
  active?: boolean
  nextLabel?: string
  finish?: { label: string; onFinish: () => void }
}) {
  const pagination = useTextPages(
    entries.map((entry) => ({
      ...entry,
      scrollable: entry.scrollable || !!entry.voiceLine || entry.reading?.lines.length === 1,
    })),
  )
  const page = pagination.page
  const entry = entries.find((entry) => entry.id === page?.entry.id) ?? entries[0]
  const line = entry.voiceLine ?? entry.reading?.lines[0] ?? null
  const optionalReading =
    !!entry.reading &&
    (reading?.activeId === entry.reading.id || reading?.completedId === entry.reading.id)
  const automatic = active && !!playback?.auto && (!!entry.voiceLine || optionalReading)
  const scrollable = !!entry.scrollable || !!entry.voiceLine || entry.reading?.lines.length === 1
  useLayoutEffect(() => {
    if (active) onVoiceLine?.(entry.voiceLine ?? null)
  }, [active, entry.voiceLine, onVoiceLine])
  useAutoScroll(
    pagination.body,
    entry.id + entry.text,
    automatic,
    !active,
    playback?.audio.voiceState ?? 'idle',
    playback?.audio.progress,
    readingTime(entry.text, playback?.preferences.readingSpeed ?? 200),
  )
  useAutoAdvance(
    line,
    automatic,
    !active,
    playback?.audio.voiceState ?? 'idle',
    playback?.preferences ?? defaultReadingPreferences,
    () => {
      if (pagination.last) return
      const target = pagination.pages[pagination.index + 1].entry.id
      goTo(pagination.index + 1)
      const next = entries.find((entry) => entry.id === target)
      if (optionalReading && next?.reading) reading?.onRead(next.reading.id, next.reading.lines)
    },
  )
  function goTo(index: number) {
    if (pagination.pages[index]?.entry.id !== page?.entry.id) onSectionChange?.()
    pagination.goTo(index)
  }
  return (
    <div
      className={`paged-reader ${(reading && entry.reading) || (playback && entry.voiceLine) ? 'has-reading' : ''}`}
    >
      <label className="reader-contents">
        <span>Section</span>
        <select
          aria-label="Reading section"
          value={entry.id}
          onChange={(event) => {
            goTo(pagination.pages.findIndex((page) => page.entry.id === event.target.value))
          }}
        >
          {entries.map((entry) => (
            <option key={entry.id} value={entry.id}>
              {entry.title}
            </option>
          ))}
        </select>
      </label>
      {entry.text !== entry.title && <h3 className="reader-heading">{entry.title}</h3>}
      <p
        className={`reader-text ${scrollable ? 'scrollable-passage' : ''} ${entry.text === entry.title ? 'reader-title' : ''}`}
        ref={pagination.body}
        tabIndex={scrollable ? 0 : undefined}
        aria-live="polite"
      >
        {page?.text}
      </p>
      <div className="reader-listen">
        {reading && entry.reading && <ReadAloudButton reading={reading} {...entry.reading} />}
        {playback && (entry.voiceLine || entry.reading) && (
          <button
            className="auto-toggle"
            onClick={playback.onToggleAuto}
            aria-pressed={playback.auto}
            aria-label="Autoplay reading"
          >
            {playback.auto ? <Pause size={16} /> : <Play size={16} />}
            <span>Auto{playback.auto ? ' on' : ''}</span>
          </button>
        )}
      </div>
      <PageButtons
        index={pagination.index}
        count={pagination.pages.length}
        onPage={goTo}
        nextLabel={nextLabel}
        finish={finish}
      />
    </div>
  )
}
