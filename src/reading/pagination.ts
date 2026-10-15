export interface ReadingEntry {
  id: string
  title: string
  text: string
}

export interface ReadingPage {
  entry: ReadingEntry
  text: string
  start: number
}

/** Keep the original characters and prefer word boundaries when a page fills. */
export function paginateText(text: string, fits: (candidate: string) => boolean) {
  const pages: { text: string; start: number }[] = []
  let start = 0
  while (start < text.length) {
    let low = start + 1
    let high = text.length
    let end = low
    while (low <= high) {
      const middle = Math.floor((low + high) / 2)
      if (fits(text.slice(start, middle))) {
        end = middle
        low = middle + 1
      } else high = middle - 1
    }
    if (end < text.length) {
      const boundary = text.slice(start, end).search(/\s+\S*$/)
      if (boundary > 0) end = start + boundary + 1
      // Avoid cutting an emoji or other surrogate pair in an unusually long word.
      if (/[\uD800-\uDBFF]/.test(text[end - 1]) && end > start + 1) end--
    }
    pages.push({ text: text.slice(start, end), start })
    start = end
  }
  return pages.length ? pages : [{ text: '', start: 0 }]
}
