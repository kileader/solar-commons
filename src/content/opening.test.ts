import { describe, expect, it } from 'vitest'
import {
  openingCamera,
  openingDuration,
  openingOpacity,
  openingPosition,
  openingShots,
} from './opening'

describe('authored opening timeline', () => {
  it('covers 34 seconds without gaps, ending on the runtime harbor asset', () => {
    let end = 0
    for (const shot of openingShots) {
      expect(shot.start).toBe(end)
      end += shot.duration
      expect(openingPosition(shot.start).shot.id).toBe(shot.id)
    }
    expect(end).toBe(openingDuration)
    expect(openingPosition(34).shot.image).toMatch(/art\/harbor.webp$/)
    expect(openingPosition(-2).shot.id).toBe('room')
    expect(openingPosition(100).local).toBe(4)
  })
  it('retains the outgoing plate during a dissolve and removes it afterward', () => {
    expect(openingOpacity(2, 5.9)).toBe(0)
    expect(openingOpacity(1, 6.1)).toBe(1)
    expect(openingOpacity(2, 6.175)).toBeCloseTo(0.5)
    expect(openingOpacity(1, 6.36)).toBe(0)
    expect(openingOpacity(2, 6.36)).toBe(1)
  })
  it('disables camera motion for reduced motion and clamps outgoing transforms', () => {
    const shot = openingShots[4]
    expect(openingCamera(shot, 18, true)).toBe('none')
    expect(openingCamera(shot, 22, false)).toBe(openingCamera(shot, 100, false))
  })
})
