const base = import.meta.env.BASE_URL
const plate = (name: string) => `${base}art/opening/${name}.webp`

export interface OpeningShot {
  id: string
  title: string
  start: number
  duration: number
  image: string
  description: string
  dissolve: number
  camera: [number, number, number, number, number, number]
  caption?: { speaker: string; text: string; delay: number }
}

/** Seconds, authored independently of the player. Camera: start/end scale, x and y (%). */
export const openingShots: readonly OpeningShot[] = [
  {
    id: 'room',
    title: 'The civic computing room',
    start: 0,
    duration: 3,
    image: plate('room'),
    dissolve: 0,
    description: 'Mara approaches a green calibration chair among teal computing cabinets.',
    camera: [1, 1, 0, 0, 0, 0],
  },
  {
    id: 'consent',
    title: 'Permission',
    start: 3,
    duration: 3,
    image: plate('consent-ready'),
    dissolve: 0,
    description:
      'Her index finger presses a mint consent control. Its ring acknowledges her touch.',
    camera: [1.015, 1.035, 0, 0.4, 0, -0.2],
    caption: { speaker: 'Mara', text: 'A little wider, then.', delay: 0.15 },
  },
  {
    id: 'kite',
    title: 'A familiar partner',
    start: 6,
    duration: 4,
    image: plate('kite'),
    dissolve: 0.35,
    description:
      'Kite unfolds two attention paths, one cyan with a round endpoint, one gold with a diamond.',
    camera: [1.01, 1.045, 0, 0.65, 0, 0.25],
    caption: { speaker: 'Kite', text: 'Your pace. Your choice.', delay: 0.45 },
  },
  {
    id: 'threshold',
    title: 'The threshold',
    start: 10,
    duration: 6,
    image: plate('threshold'),
    dissolve: 0.65,
    description:
      'A physical rack indicator remains visible as incomplete dashed model contours extend into darkness.',
    camera: [1.01, 1.055, 0, -0.75, 0, 0.2],
    caption: { speaker: 'Kite', text: 'Follow this.', delay: 1 },
  },
  {
    id: 'shared',
    title: 'A shared point of view',
    start: 16,
    duration: 6,
    image: plate('shared'),
    dissolve: 0.8,
    description:
      'A rendered jade workspace opens. Cyan and gold attention cues settle into the same rhythm, retaining their separate shapes.',
    camera: [1.065, 1.015, -0.5, 0, 0, 0],
    caption: { speaker: 'Kite', text: 'With you.', delay: 2.1 },
  },
  {
    id: 'mara',
    title: 'Still herself',
    start: 22,
    duration: 3,
    image: plate('mara'),
    dissolve: 0.15,
    description:
      'Mara’s natural hazel eye and small right-temple interface, calm in the computing-room light.',
    camera: [1.035, 1.01, 0.3, 0, 0, 0],
  },
  {
    id: 'city',
    title: 'Into the living city',
    start: 25,
    duration: 5,
    image: plate('city'),
    dissolve: 0.45,
    description:
      'Mara leaves through a glazed doorway into a sunlit public passage filled with trees and people.',
    camera: [1.05, 1.015, -0.8, 0, 0.25, 0],
  },
  {
    id: 'harbor',
    title: 'The Harbor',
    start: 30,
    duration: 4,
    image: `${base}art/harbor.webp`,
    dissolve: 0.85,
    description: 'The coastal commons: terraced gardens, solar canopies and clear harbor water.',
    camera: [1.035, 1, 0, 0, 0, 0],
  },
]

export const openingDuration = 34
export const openingVideo = `${base}media/opening/s01-connection.mp4`
export const consentPressedImage = plate('consent-pressed')
export const consentPressTime = 3.85

export function openingPosition(time: number) {
  const bounded = Math.max(0, Math.min(openingDuration, time))
  let index = 0
  for (let i = 1; i < openingShots.length; i++) {
    if (bounded >= openingShots[i].start) index = i
  }
  const shot = openingShots[index]
  return { shot, index, local: bounded - shot.start }
}

export function openingOpacity(index: number, time: number) {
  const shot = openingShots[index]
  if (time < shot.start) return 0
  const next = openingShots[index + 1]
  if (next && time >= next.start + next.dissolve) return 0
  if (next && time >= next.start) return 1 // The incoming plate dissolves over this one.
  return shot.dissolve ? Math.min(1, (time - shot.start) / shot.dissolve) : 1
}

export function openingCamera(shot: OpeningShot, time: number, reduced: boolean) {
  if (reduced) return 'none'
  const p = Math.max(0, Math.min(1, (time - shot.start) / shot.duration))
  const ease = p * p * (3 - 2 * p)
  const [s0, s1, x0, x1, y0, y1] = shot.camera
  return `translate(${x0 + (x1 - x0) * ease}%, ${y0 + (y1 - y0) * ease}%) scale(${s0 + (s1 - s0) * ease})`
}
