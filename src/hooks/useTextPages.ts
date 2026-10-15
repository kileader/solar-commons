import { useLayoutEffect, useRef, useState } from 'react'
import { paginateText, type ReadingEntry, type ReadingPage } from '../reading/pagination'

/** Pagination is presentation only: changing a page never changes narrative state. */
export function useTextPages(entries: readonly ReadingEntry[]) {
  const body = useRef<HTMLParagraphElement>(null)
  const [pages, setPages] = useState<ReadingPage[]>(() =>
    entries.map((entry) => ({ entry, text: entry.text, start: 0 })),
  )
  const [index, setIndex] = useState(0)
  const position = useRef({ id: entries[0]?.id, start: 0 })
  const signature = JSON.stringify(entries)
  useLayoutEffect(() => {
    const element = body.current
    if (!element) return
    const source: ReadingEntry[] = JSON.parse(signature)
    // Closed dialogs have no layout yet. Keep their contents current until opening
    // gives ResizeObserver a real area to paginate.
    if (element.clientWidth <= 0 || element.clientHeight <= 0) {
      setPages(source.map((entry) => ({ entry, text: entry.text, start: 0 })))
      setIndex(0)
      position.current = { id: source[0]?.id, start: 0 }
    }
    let frame = 0
    const measure = () => {
      const style = getComputedStyle(element)
      const width = element.clientWidth
      const height = element.clientHeight
      if (width <= 0 || height <= 0) return
      const probe = document.createElement('p')
      probe.setAttribute('aria-hidden', 'true')
      Object.assign(probe.style, {
        position: 'fixed',
        visibility: 'hidden',
        pointerEvents: 'none',
        inset: '0 auto auto 0',
        width: `${width}px`,
        height: 'auto',
        margin: '0',
        padding: '0',
        border: '0',
        fontFamily: style.fontFamily,
        fontSize: style.fontSize,
        fontWeight: style.fontWeight,
        fontStyle: style.fontStyle,
        lineHeight: style.lineHeight,
        letterSpacing: style.letterSpacing,
        wordSpacing: style.wordSpacing,
        whiteSpace: 'pre-wrap',
        overflowWrap: 'anywhere',
      })
      document.body.append(probe)
      try {
        const next = source.flatMap((entry) =>
          paginateText(entry.text, (candidate) => {
            probe.textContent = candidate
            return probe.getBoundingClientRect().height <= height - 2
          }).map((page) => ({ ...page, entry })),
        )
        const anchor = position.current
        let selected = next.findIndex(
          (page, i) =>
            page.entry.id === anchor.id &&
            page.start <= anchor.start &&
            (next[i + 1]?.entry.id !== anchor.id || next[i + 1].start > anchor.start),
        )
        if (selected < 0) {
          selected = 0
          position.current = { id: next[0]?.entry.id, start: 0 }
        }
        setPages(next)
        setIndex(selected)
      } finally {
        probe.remove()
      }
    }
    const schedule = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(measure)
    }
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(schedule)
    observer?.observe(element)
    const typography = new MutationObserver(schedule)
    const scene = element.closest('main')
    if (scene) typography.observe(scene, { attributes: true, attributeFilter: ['class'] })
    window.addEventListener('resize', schedule)
    measure()
    return () => {
      observer?.disconnect()
      typography.disconnect()
      window.removeEventListener('resize', schedule)
      cancelAnimationFrame(frame)
    }
  }, [signature])
  const safeIndex = Math.min(index, Math.max(0, pages.length - 1))
  const page = pages[safeIndex]
  function goTo(nextIndex: number) {
    const target = pages[nextIndex]
    if (!target) return
    // ResizeObserver can run before React commits the page turn. Remember the
    // requested position immediately so reflow cannot send the reader backward.
    position.current = { id: target.entry.id, start: target.start }
    setIndex(nextIndex)
  }
  return {
    body,
    pages,
    page,
    index: safeIndex,
    goTo,
    last: safeIndex === pages.length - 1,
  }
}
