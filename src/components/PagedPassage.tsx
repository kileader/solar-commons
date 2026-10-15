import { useTextPages } from '../hooks/useTextPages'
import { PageButtons } from './PagedReader'

export function PagedPassage({ text }: { text: string }) {
  return <Passage key={text} text={text} />
}

function Passage({ text }: { text: string }) {
  const pagination = useTextPages([{ id: 'passage', title: '', text }])
  return (
    <div className="paged-passage">
      <p className="reader-text" ref={pagination.body}>
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
