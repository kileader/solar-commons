import { Square, Volume2 } from 'lucide-react'
import type { DialogueLine } from '../content/harbor'

export interface ReadAloudControls {
  activeId: string | null
  completedId?: string | null
  canRead: boolean
  onRead: (id: string, lines: readonly DialogueLine[]) => void
}

export function ReadAloudButton({
  reading,
  id,
  lines,
  label,
}: {
  reading: ReadAloudControls
  id: string
  lines: readonly DialogueLine[]
  label: string
}) {
  const active = reading.activeId === id
  return (
    <button
      className="voice-replay reading-button"
      disabled={!reading.canRead && !active}
      aria-label={active ? `Stop reading ${label}` : `Listen to ${label}`}
      aria-pressed={active}
      title={
        reading.canRead ? undefined : 'Enable dialogue voices and sound in Settings to listen.'
      }
      onClick={() => reading.onRead(id, lines)}
    >
      {active ? <Square size={16} /> : <Volume2 size={17} />}
      <span>{active ? 'Stop reading' : 'Listen'}</span>
    </button>
  )
}
