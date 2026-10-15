import { useTextPages } from '../hooks/useTextPages'
import { PageButtons } from './PagedReader'
import type { ReaderPlayback } from './PagedReader'
import type { DialogueLine } from '../content/harbor'
import { useAutoScroll } from '../hooks/useAutoScroll'
import { readingTime } from '../hooks/useAutoAdvance'

export function PagedPassage(props: {
  text: string
  line?: DialogueLine
  playback?: ReaderPlayback
}) {
  return <Passage key={props.text} {...props} />
}

function Passage({
  text,
  line,
  playback,
}: {
  text: string
  line?: DialogueLine
  playback?: ReaderPlayback
}) {
  const pagination = useTextPages([{ id: 'passage', title: '', text, scrollable: !!line }])
  const playing =
    !!line &&
    playback?.audio.currentLine?.id === line.id &&
    playback.audio.currentLine.text === line.text
  useAutoScroll(
    pagination.body,
    text,
    !!playback?.auto && playing,
    !playing,
    playback?.audio.voiceState ?? 'idle',
    playback?.audio.progress,
    readingTime(text, playback?.preferences.readingSpeed ?? 200),
  )
  return (
    <div className="paged-passage">
      <p
        className={`reader-text ${line ? 'scrollable-passage' : ''}`}
        ref={pagination.body}
        tabIndex={line ? 0 : undefined}
      >
        {pagination.page?.text ?? text}
      </p>
      {pagination.pages.length > 1 && (
        <PageButtons
          index={pagination.index}
          count={pagination.pages.length}
          onPage={pagination.goTo}
        />
      )}
    </div>
  )
}
