import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTextPages } from '../hooks/useTextPages'
import type { ReadingEntry } from '../reading/pagination'
import { ReadAloudButton, type ReadAloudControls } from './ReadAloudButton'
import type { DialogueLine } from '../content/harbor'

export interface ReaderEntry extends ReadingEntry {
  reading?: { id: string; label: string; lines: readonly DialogueLine[] }
}

export function PageButtons({
  index,
  count,
  onPage,
}: {
  index: number
  count: number
  onPage: (next: number) => void
}) {
  return (
    <nav className="page-buttons" aria-label="Reading pages">
      <button aria-label="Previous page" disabled={index === 0} onClick={() => onPage(index - 1)}>
        <ChevronLeft size={18} /> <span>Back</span>
      </button>
      <span role="status">
        {index + 1} / {count}
      </span>
      <button
        aria-label="Next page"
        disabled={index + 1 >= count}
        onClick={() => onPage(index + 1)}
      >
        <span>Next</span> <ChevronRight size={18} />
      </button>
    </nav>
  )
}

export function PagedReader({
  entries,
  reading,
  onSectionChange,
}: {
  entries: readonly ReaderEntry[]
  reading?: ReadAloudControls
  onSectionChange?: () => void
}) {
  const pagination = useTextPages(entries)
  const page = pagination.page
  const entry = entries.find((entry) => entry.id === page?.entry.id) ?? entries[0]
  function goTo(index: number) {
    if (pagination.pages[index]?.entry.id !== page?.entry.id) onSectionChange?.()
    pagination.goTo(index)
  }
  return (
    <div className={`paged-reader ${reading && entry.reading ? 'has-reading' : ''}`}>
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
      <h3 className="reader-heading">{entry.title}</h3>
      <p className="reader-text" ref={pagination.body} aria-live="polite">
        {page?.text}
      </p>
      <div className="reader-listen">
        {reading && entry.reading && <ReadAloudButton reading={reading} {...entry.reading} />}
      </div>
      <PageButtons index={pagination.index} count={pagination.pages.length} onPage={goTo} />
    </div>
  )
}
