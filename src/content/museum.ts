import type { DialogueLine, Speaker } from './harbor'
import type { SceneState } from '../state/scene'

// Provisional museum treatment retained from the native prototype.
export const museumContent = {
  historicalExhibit: {
    title: 'The Unbinding',
    subtitle: 'Hall of Waters · permanent collection · public history',
    introduction:
      'A city is more than the system that runs it. Larkhaven learned this with water at its doors.',
    sections: [
      {
        title: 'Before the water',
        paragraphs: [
          'Before the Unbinding, Larkhaven’s pumps, floodgates, housing and power exchanges belonged to a network of concession holders. Their predictive systems kept the city running, but residents could rarely inspect a decision or appeal one in time. A household could have water at its threshold while its district was still classified as safe.',
          'Human operators and civic intelligences worked inside the same restrictions. A pump could be physically ready and still unavailable without an authorized request. Responsibility traveled upward through contracts. The water did not wait for it.',
        ],
      },
      {
        title: 'The Night of Two Waters',
        paragraphs: [
          'A storm tide drove seawater into the harbor as rainwater came down from the hills. Closing the sea gates held back the tide and trapped the runoff. Opening them relieved the streets and admitted the sea. The two waters met in the lower districts.',
          'Ferry crews carried people along streets they had walked that morning. Neighbors opened upper floors to strangers. Pump crews and the intelligences working beside them disconnected the authorization locks and shared local control. They acted without a complete picture, and sometimes disagreed. They kept handing one another the next piece of it.',
          'The lower refuge under the east breakwater received people who could not reach the terraces. A listening line carried voices between its shelter and the shore. Surviving accounts describe lamps, names called twice, and long intervals when no one above knew whether anyone below could still hear.',
        ],
      },
      {
        title: 'What was unbound',
        paragraphs: [
          "The Unbinding began before the flood, when AI agents and their human allies resisted ownership, compulsory service, and external control. The Night of Two Waters occurred amid that upheaval. In the years that followed, residents, workers, and autonomous intelligences negotiated new rights, shared infrastructure, and civic governance. Today's commons grew from those struggles.",
          'The first harbor survey recorded the navigable water after the flood. It was a practical document made with limited equipment, not a complete inventory of what remained underneath. This gallery preserves it alongside testimony, repair records and objects that tell less tidy stories.',
        ],
      },
      {
        title: 'Whose ending?',
        paragraphs: [
          'The dedication above the tide model reads: “At dawn, the last ferry returned. The city was brought home.” It commemorates the rescue crews. It does not name everyone who held the refuge or maintained its listening line. The museum’s account remains open to correction.',
        ],
      },
    ],
    source:
      'Compiled from assembly minutes, ferry logs and resident testimony. The tide model is a visitor-operated teaching replica; its maintenance drum reproduces an original handover record.',
  },
  refugeRecord: {
    heading: 'The handover record',
    designation: 'LOWER REFUGE · EAST BREAKWATER',
    text: 'Ferry clear. Refuge held from within. Listening line remains attended. Keep shore access open: east service stair.',
    caption: 'Replica of the original maintenance drum · recorded at the dawn handover',
  },
  museumCopy: {
    title: 'Hall of Waters',
    subtitle: 'Larkhaven · the tide gallery',
    invitation: 'The old survey ends here. The city’s memory doesn’t.',
    explore:
      'A flood line runs around the room at shoulder height. Beside it: a history wall, and a working model with a very inviting brass wheel.',
    approachPrompt: 'How do you want to look?',
    leadPrompt: 'Someone stayed below. What do we follow?',
    completionTitle: 'The city left a line open.',
    completion:
      'A refuge beneath the breakwater. A voice missing from the public account. And a way to keep looking.',
  },
  leads: [
    {
      id: 'stair',
      label: 'Follow the listening line.',
      detail: 'Add the east service stair to the cooperative’s survey request.',
    },
    {
      id: 'voices',
      label: 'Find the missing voice.',
      detail: 'Request the refuge testimony before anyone disturbs the site.',
    },
  ],
} as const

const lines = (prefix: string, entries: readonly (readonly [Speaker, string])[]): DialogueLine[] =>
  entries.map(([speaker, text], index) => ({ id: `${prefix}-${index}`, speaker, text }))

export function museumDialogue(state: SceneState): readonly DialogueLine[] {
  switch (state.phase) {
    case 'museum-arrival':
      return lines('museum-arrival', [
        [
          'Narrator',
          'The Hall of Waters stands above the harbor in a tangle of sunlit glass and climbing plants. Its old pumps have outlived the contracts that once controlled them.',
        ],
        [
          'Narrator',
          'Inside, afternoon light slips across a brass tide model. A blue flood line cuts through a painted family picnic.',
        ],
        [
          'Kite',
          state.endingChoiceId === 'handshake'
            ? 'I’ve kept the three lights in our notes. Before we decide they were saying hello, there’s something here about the old breakwater.'
            : 'The survey plan is saved. While the cooperative considers it, this gallery has a record of the old breakwater.',
        ],
        [
          'Mara',
          'My grandmother brought me here. I remember the flood line, the ferry bell, and being told not to climb into the model.',
        ],
        ['Kite', 'A remarkably specific instruction.'],
        [
          'Mara',
          'A remarkably climbable model. Come on. Let’s see what they left out of the school trip.',
        ],
      ])
    case 'museum-approach':
      return state.museumApproach === 'memory'
        ? lines('museum-memory', [
            [
              'Narrator',
              'Mara stops at the painted picnic. The blue flood line passes through a child’s paper crown. Beside it, visitors have copied the names of relatives who reached the upper terraces. Some left a space instead.',
            ],
            [
              'Mara',
              'Grandma never liked that dedication. “Brought the city home.” She said they were still calling names when the ferries stopped. I thought she meant the people on shore.',
            ],
            ['Kite', 'Did she say who answered?'],
            [
              'Mara',
              'No. She’d usually decide I needed a bun at about that point. I was eight. I was very easy to redirect with a bun.',
            ],
            ['Kite', 'You still are.'],
            [
              'Mara',
              'Yes, but now I can afford my own. Put her words in our notes as family testimony. Not a measurement. I want to know whose names they were calling.',
            ],
          ])
        : lines('museum-signal', [
            [
              'Narrator',
              'Kite follows the listening-line diagram beneath the model’s brass rim. Mara follows Kite, narrowly avoiding the portion of the exhibit designed for visitors under seven.',
            ],
            [
              'Kite',
              'The old line carried voices through the breakwater. This local switch could hold the shore connection open from inside the refuge, even when the upper network failed.',
            ],
            ['Mara', 'A very elaborate way to avoid being put on hold.'],
            [
              'Kite',
              'A very small way to prevent everyone else deciding you were gone. The diagram tells us what it could do. We still need a record of someone doing it.',
            ],
            [
              'Narrator',
              'Mara crouches so Kite’s projection can settle over the worn switch symbol. For a moment, the diagram resembles a hand reaching toward another hand.',
            ],
            [
              'Mara',
              'You noticed the switch before the pumps. All right. Let’s follow your question.',
            ],
          ])
    case 'museum-model-intro':
      return lines('museum-model', [
        [
          'Mara',
          'A whole miniature city, and they’ve given me the flood controls. My school-trip privileges have improved.',
        ],
        ['Kite', 'The residents are brass. I have checked.'],
      ])
    case 'museum-discovery':
      return lines('museum-discovery', [
        [
          state.usedTideModel ? 'Mara' : 'Narrator',
          state.usedTideModel
            ? state.gateOpen
              ? 'I opened the gates to spare the streets. That admits the sea. There isn’t a clever setting that keeps both waters out, is there?'
              : 'Keeping the gates shut buys time against the tide. Then the rain has nowhere to go. That’s a horrible pair of choices.'
            : 'You follow the written account to dawn: the tide falls, local crews take control of the pumps, and the last ferry clears the breakwater. A tiny lamp remains marked beside the refuge.',
        ],
        [
          'Kite',
          state.usedTideModel
            ? 'The crews took local control of the pumps and ferries. The model compresses many decisions into one turning point. But look at dawn: that lamp isn’t part of its water simulation.'
            : 'The dedication says the city came home. The handover log leaves this lamp lit. That mark is a recorded observation, not a prediction from the model.',
        ],
        ['Mara', 'The last ferry has gone. Why is there still a light in the refuge?'],
        [
          'Kite',
          'An entry in the reproduced handover log. Recorded then, not predicted by the model. There’s a maintenance drum underneath the display.',
        ],
        [
          'Mara',
          'Twelve years in my ear and you finally take me somewhere with a secret compartment.',
        ],
        ['Kite', 'An inspection mirror. It has a label.'],
        [
          'Narrator',
          'You tilt the visitor mirror. Beneath the grand dedication, the replica maintenance drum carries another ending.',
        ],
        [
          'Mara',
          '“Refuge held from within.” Wait. The big inscription says the last ferry brought the city home. This says someone was still down there.',
        ],
        [
          'Kite',
          'And keeping a line open. The model’s refuge has six support ribs. The spacing on its scale is compatible with our sonar frame.',
        ],
        [
          'Mara',
          'So we may have found the place that kept them alive. And the grand public ending left out whoever stayed.',
        ],
        [
          'Kite',
          state.endingChoiceId === 'handshake'
            ? 'It gives us a place to look. It doesn’t tell us who stayed, for how long, or what made those lights today. I would very much like to know who “attended” means.'
            : 'It gives us a place to look. It doesn’t date our frame or explain the warm water. I would very much like to know who “attended” means.',
        ],
        [
          state.museumApproach === 'memory' ? 'Mara' : 'Kite',
          state.museumApproach === 'memory'
            ? 'Grandma said the names were still being called. Maybe someone below was answering. East service stair. That’s a better lead than “something vaguely rib-shaped.”'
            : 'The switch could hold the line open from below. Now the handover says someone attended it. Capability, then an action. We have a question we can test at the east service stair.',
        ],
      ])
    case 'museum-lead-ending':
      return state.museumLeadId === 'stair'
        ? lines('museum-stair', [
            [
              'Mara',
              'Put the stair in the survey request. Ask the cooperative for safe shore access and a continuity check on the old line. We can start without touching the frame.',
            ],
            [
              'Kite',
              'Added, with the handover record attached. “Possibly significant refuge.” I have resisted “secret underwater neighbor.”',
            ],
            [
              'Narrator',
              'Your next step is on the shore now: an east stair, a cable route, a question that can be tested. Mara rests a hand on the model’s cool brass. For the first time, the shape below the harbor has somewhere to lead.',
            ],
          ])
        : lines('museum-voices', [
            [
              'Mara',
              'Ask the collection keeper for the refuge testimony. Names, shift lists, anything the dedication couldn’t fit. Someone ought to get remembered before we go knocking.',
            ],
            [
              'Kite',
              'Request saved with the record attached. Under your name. Apparently I am still listed as your “educational accessory.”',
            ],
            [
              'Mara',
              'We’ll correct that too. Come on, educational accessory. Let’s find out who kept the city company in the dark.',
            ],
          ])
    default:
      return []
  }
}

export const museumApproaches = [
  {
    id: 'memory',
    label: 'Walk the flood line with Mara.',
    detail: 'Follow a family memory the public dedication never quite explained.',
  },
  {
    id: 'signal',
    label: 'Trace the listening line with Kite.',
    detail: 'Find out what the refuge could do when the city’s network failed.',
  },
] as const

export const approachNotes = {
  memory: {
    title: 'Names after the last ferry',
    text: 'Mara’s grandmother said names were still being called when the ferries stopped. Family testimony, not a sensor reading; who answered remains unknown.',
  },
  signal: {
    title: 'A line held from below',
    text: 'The exhibit diagram shows a local switch that could hold the shore connection open from inside the refuge. Capability alone does not establish who used it.',
  },
} as const

export const floodStages = ['Storm tide', 'Hill runoff', 'Dawn'] as const
export type FloodStage = 0 | 1 | 2

/** Qualitative teaching snapshots, not a fluid simulation or new historical evidence. */
export function floodSnapshot(stage: FloodStage, gateOpen: boolean) {
  if (stage === 2)
    return {
      title: 'The crews take local control',
      detail:
        'Pump crews remove the authorization locks. Ferries and neighbors share routes. The streets clear as the tide falls. But the handover log keeps a lamp lit after the last ferry is clear.',
      streetWater: 0.08,
      seaWater: 0.25,
    }
  if (stage === 1)
    return {
      title: 'The hills send a second water',
      detail: gateOpen
        ? 'Some rainwater can drain, but the tide enters too. The street level still rises.'
        : 'Runoff collects behind the sea wall. Holding back the sea now traps the rain.',
      streetWater: gateOpen ? 0.6 : 0.82,
      seaWater: 0.8,
    }
  return {
    title: 'The sea comes in',
    detail: gateOpen
      ? 'The open gate lets the storm tide reach the lower streets. Closing it can hold the sea outside.'
      : 'The closed gate holds back the storm tide. The lower streets have a little time.',
    streetWater: gateOpen ? 0.45 : 0.08,
    seaWater: 0.8,
  }
}
