import type { SceneState } from '../state/scene'
import { quietIndexNotes } from './quietIndex'

export interface CognitiveTrace {
  id: string
  title: string
  observed: string
  interpretation: string
  uncertainty: string
}

export interface CognitiveView {
  kind: 'museum' | 'archive' | 'canal'
  title: string
  connected: boolean
  traces: readonly CognitiveTrace[]
}

/** Attention follows public artifacts and already-disclosed evidence, never hidden story facts. */
export function cognitiveView(state: SceneState): CognitiveView | null {
  if (state.phase.startsWith('museum-')) {
    if (state.phase === 'museum-model') return null
    return {
      kind: 'museum',
      title: 'The city, in layers',
      connected: false,
      traces: [
        {
          id: 'two-waters',
          title: 'Two waters',
          observed:
            'The museum’s account describes storm tide from the sea meeting runoff from the hills.',
          interpretation:
            'Kite separates the two directions of pressure in an illustrative overlay. A single gate setting cannot make both sources disappear.',
          uncertainty:
            'These paths explain the teaching model. They are not measurements of the historical flood.',
        },
        {
          id: 'city-model',
          title: 'City model',
          observed:
            'A brass reconstruction lets visitors compare the lower city at different stages of the flood.',
          interpretation:
            'Outlined layers separate the public display from the city it represents. The model is a way to ask questions, not a complete record of every event.',
          uncertainty:
            'A model’s geometry does not establish the age or purpose of the structure beneath today’s harbor.',
        },
        {
          id: 'listening-route',
          title: 'Listening line',
          observed: state.discovered
            ? 'The reproduced handover describes a refuge held from within and a listening line still attended after the ferry cleared.'
            : 'The museum associates the lower refuge with an old listening line to shore.',
          interpretation:
            'The dashed connection is Kite’s sketch of a communication route, rather than a recovered circuit diagram.',
          uncertainty:
            'A possible connection cannot identify the people at either end, or explain the present harbor anomaly.',
        },
      ],
    }
  }
  if (!state.phase.startsWith('qi-') || state.phase === 'qi-intro-shot') return null
  const outside =
    ['qi-arrival', 'qi-complete'].includes(state.phase) ||
    (state.phase === 'qi-ending' && state.lineIndex === 3)
  if (outside)
    return {
      kind: 'canal',
      title: 'Light, water, a way forward',
      connected: false,
      traces: [
        {
          id: 'canal-light',
          title: 'Reflections',
          observed: 'Warm windows and lanterns are reflected in moving canal water.',
          interpretation:
            'Kite traces repeated edges and reflected light, separating the buildings from their wavering doubles.',
          uncertainty:
            'A reflection is a view of a lit surface. It does not reveal what is happening behind a closed window.',
        },
        {
          id: 'shared-route',
          title: 'Our next step',
          observed:
            state.museumLeadId === 'voices'
              ? 'At the museum, Mara chose to seek the missing refuge testimony.'
              : 'At the museum, Mara chose to follow the listening line and plan safe access to the stair.',
          interpretation:
            'The route connects that chosen lead to Ilex’s archive. It does not replace the next investigation or send a request on Mara’s behalf.',
          uncertainty:
            'The old record and the present harbor structure may be related. That connection remains a hypothesis.',
        },
        {
          id: 'public-view',
          title: 'Public view',
          observed: 'Mara and Kite share this view of the canal by agreement.',
          interpretation:
            'The drawn contours are Kite’s attention sketch, laid over Mara’s view of a public place.',
          uncertainty:
            'No private room, thought, or sensory stream is exposed by switching on the overlay.',
        },
      ],
    }
  const introduced = state.phase !== 'qi-intro' || state.lineIndex >= 4
  const hasRecording = state.phase !== 'qi-intro' || state.lineIndex >= 10
  const answered =
    state.quietIndexApproach && (state.phase !== 'qi-approach' || state.lineIndex >= 1)
  const insight = answered ? quietIndexNotes[state.quietIndexApproach!] : null
  return {
    kind: 'archive',
    title: 'A voice, with boundaries',
    connected: introduced,
    traces: [
      {
        id: 'restoration-bench',
        title: 'The workbench',
        observed: 'Damaged media sit in padded trays beside the restoration tools.',
        interpretation:
          'Kite isolates the work surface from the surrounding shelves. Conservation depends on what survives, and on the interventions used to make it legible.',
        uncertainty: 'The overlay cannot recover missing data just by highlighting the cartridge.',
      },
      {
        id: 'guest-channel',
        title: introduced ? 'Guest channel' : 'Our connection',
        observed: introduced
          ? 'Kite requested public avatar and voice presence. Ilex accepted through their optical and auditory interfaces.'
          : 'Mara has invited Kite to introduce themself; Ilex’s guest connection has not yet been accepted.',
        interpretation: introduced
          ? 'The two visible paths represent the authorized avatar and voice channel. The closed branch represents private senses, which remain unshared.'
          : 'Only Mara and Kite’s existing connection is drawn. A dashed branch marks a possible guest invitation, not an active link to Ilex.',
        uncertainty:
          'A public presence is not access to another person’s thoughts or private perception. Kite is an independent participant.',
      },
      {
        id: 'archive-signal',
        title: hasRecording ? 'Signal limits' : 'Delicate work',
        observed: hasRecording
          ? 'The recording is damaged and its surviving documentation is incomplete.'
          : 'Ilex is working with a delicate restoration instrument.',
        interpretation: insight
          ? `${insight.title}. ${insight.text}`
          : hasRecording
            ? 'The amber gaps mark uncertainty in an illustrative signal. They are not decoded replies or a forensic measurement.'
            : 'Precision tools can help preserve a fragile record; they cannot guarantee a complete reconstruction.',
        uncertainty:
          'Neither noise nor an evocative pattern establishes a speaker’s identity, age, or consciousness.',
      },
    ],
  }
}
