import { useEffect, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'

export function ModalHeading({
  children,
  step,
  onClose,
  closeLabel,
  titleId,
}: {
  children: ReactNode
  step: string
  onClose: () => void
  closeLabel: string
  titleId?: string
}) {
  return (
    <div className="modal-topline">
      <div>
        <h2 className="eyebrow" id={titleId}>
          {children}
        </h2>
        <span className="modal-step">Story · {step}</span>
      </div>
      <button className="close-button" onClick={onClose} aria-label={closeLabel}>
        <X size={20} />
      </button>
    </div>
  )
}

export function Modal({
  open,
  onClose,
  titleId,
  className = '',
  children,
}: {
  open: boolean
  onClose: () => void
  titleId: string
  className?: string
  children: ReactNode
}) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
    return () => {
      if (dialog.open) dialog.close()
    }
  }, [open])
  return (
    <dialog
      ref={ref}
      className={`modal ${className}`}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          const rect = event.currentTarget.getBoundingClientRect()
          if (
            event.clientX < rect.left ||
            event.clientX > rect.right ||
            event.clientY < rect.top ||
            event.clientY > rect.bottom
          )
            onClose()
        }
      }}
    >
      {children}
    </dialog>
  )
}
