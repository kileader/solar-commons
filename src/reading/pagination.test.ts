import { describe, expect, it } from 'vitest'
import { paginateText } from './pagination'

describe('lossless text pagination', () => {
  it.each([
    'The tide rose.\n\nA line remained open — somebody was listening.',
    '  Spaces,  punctuation… and\nline breaks stay intact.  ',
    'abcdefghijklmnopqrstuvwxyz0123456789',
    'A longword😀😀😀😀😀😀😀 followed by an answer.',
    '',
  ])('preserves every character and page offset in %j', (text) => {
    const pages = paginateText(text, (candidate) => candidate.length <= 16)
    expect(pages.map((page) => page.text).join('')).toBe(text)
    let offset = 0
    for (const page of pages) {
      expect(page.start).toBe(offset)
      expect(page.text.length).toBeLessThanOrEqual(16)
      expect(page.text).not.toMatch(/[\uD800-\uDBFF]$/)
      offset += page.text.length
    }
  })
  it('prefers complete words and handles a shrinking text area', () => {
    expect(
      paginateText('One two three four.', (text) => text.length <= 9).map((p) => p.text),
    ).toEqual(['One two ', 'three ', 'four.'])
    expect(
      paginateText('word', () => false)
        .map((p) => p.text)
        .join(''),
    ).toBe('word')
  })
})
