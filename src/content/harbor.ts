export type Speaker = 'Kite' | 'Mara' | 'Narrator'

export interface DialogueLine {
  id: string
  speaker: Speaker
  text: string
}

export interface EntryChoice {
  id: string
  label: string
  detail: string
  response: DialogueLine[]
}

export interface EvidenceReading {
  label: string
  value: string
  detail: string
}

export interface InvestigationClue {
  id: string
  title: string
  subtitle: string
  /** Percentage coordinates in the scene, independent of the art asset. */
  position: { x: number; y: number }
  observation: EvidenceReading
  model: EvidenceReading
  contradiction: string
  dialogue: DialogueLine[]
}

export interface ConclusionChoice {
  id: string
  label: string
  detail: string
  ending: DialogueLine[]
}

export const sceneTitle = 'The Harbor'
export const sceneSubtitle = 'Larkhaven · late afternoon'

export const voiceTestLine: DialogueLine = {
  id: 'voice-test',
  speaker: 'Kite',
  text: 'I’m here, Mara. We can take our time.',
}

/** Authored scene copy stays with the narrative, independent of its layout. */
export const sceneCopy = {
  location: 'LARKHAVEN · COASTAL COMMONS',
  tagline: 'Everything is connected.',
  openingPrompt: 'How do we begin?',
  decisionPrompt: 'What should we do next?',
  investigation:
    'Examine the three markers in the harbor. Open Cognitive Perception to see my reconstruction. We’ll keep the measurements separate from the possibilities.',
  synthesis:
    'Three readings. An engineered shape, a little warmth, and a map that never saw deep enough. Enough to ask a better question.',
  completionTitle: 'A question worth keeping.',
  surveyCompletion: 'A careful beginning. A living harbor. A mystery with room to breathe.',
  handshakeCompletion: 'A faint light. An open possibility. Your first shared observation.',
  footer: 'Take your time. The city will wait.',
  clueLabels: {
    geometry: 'The structure',
    thermal: 'Warm water',
    archive: 'The old survey',
  } as Record<string, string>,
  emptyNotes: 'The harbor is still an open question.',
  notesSubtitle: 'A record of what we know. And what we don’t.',
  perception: {
    observation: '14.2 m below datum',
    model: 'Partial reconstruction',
    limitation: 'Occluded surfaces unresolved',
    caption: 'Patterns are not proof.',
  },
}

export const introLines: DialogueLine[] = [
  {
    id: 'arrival',
    speaker: 'Narrator',
    text: 'The harbor terraces catch the last warm light. Ferries slip between floating gardens; somewhere above the water, a school choir is losing an argument with the gulls.',
  },
  {
    id: 'integration',
    speaker: 'Mara',
    text: 'Kite. I can feel where you’re looking. Is that going to happen every time I stop thinking about it?',
  },
  {
    id: 'familiar',
    speaker: 'Kite',
    text: 'Only while you let me. Twelve years sharing your attention, and today you finally gave me a window. I’d rather start with something beautiful.',
  },
  {
    id: 'anomaly',
    speaker: 'Kite',
    text: 'The maintenance float found a shape beneath the old breakwater. Its bracing resembles work from before the Unbinding. Resemblance is not a date. Open Cognitive Perception when you’re ready, and we’ll look together.',
  },
]

export const entryChoices: EntryChoice[] = [
  {
    id: 'trace',
    label: 'Show me what we actually know.',
    detail: 'Start with the measurements. Let the story wait.',
    response: [
      {
        id: 'trace-mara',
        speaker: 'Mara',
        text: 'No ghosts yet. Give me the measurements before we give it a history.',
      },
      {
        id: 'trace-kite',
        speaker: 'Kite',
        text: 'Gladly. Open our shared perception when you’re ready. Solid traces are observations; broken traces are my models. Three readings, and none of them tells the whole story.',
      },
    ],
  },
  {
    id: 'listen',
    label: 'Let me see the harbor with you.',
    detail: 'Enter the shared perception, then follow the evidence.',
    response: [
      {
        id: 'listen-mara',
        speaker: 'Mara',
        text: 'All right. Show me how you see this place. Slowly.',
      },
      {
        id: 'listen-kite',
        speaker: 'Kite',
        text: 'Use our shared perception. We’ll keep the city underneath it. Solid traces are things we measured; broken traces are things I’m trying to explain. You can close the window whenever you want.',
      },
    ],
  },
]

export const clues: InvestigationClue[] = [
  {
    id: 'geometry',
    title: 'A shape under the water',
    subtitle: 'Sonar geometry · maintenance float',
    position: { x: 62, y: 64 },
    observation: {
      label: 'Observed · sonar returns',
      value: 'Six ribs · 2.4 ± 0.1 m spacing',
      detail:
        'Repeated sonar passes reveal parallel ribs beneath sediment. Their far ends remain hidden; the scan cannot establish the material or the structure’s age.',
    },
    model: {
      label: 'Modeled · structural fit',
      value: 'An engineered frame is plausible',
      detail:
        'The spacing fits a support frame. Similar bracing appears in old harbor foundations and modern reef supports; the partial scan fits either.',
    },
    contradiction:
      'This shape could be old or recent. Its geometry cannot date it or connect it to the Unbinding.',
    dialogue: [
      {
        id: 'geometry-mara',
        speaker: 'Mara',
        text: 'It looks deliberate. Like something folded and put away.',
      },
      {
        id: 'geometry-kite',
        speaker: 'Kite',
        text: 'That is a good description of the shape. It is not yet a description of what happened here.',
      },
    ],
  },
  {
    id: 'thermal',
    title: 'A little warmth',
    subtitle: 'Temperature transect · water sampling',
    position: { x: 80, y: 46 },
    observation: {
      label: 'Observed · temperature probes',
      value: '+0.18 ± 0.05 °C above nearby water',
      detail:
        'Two sampling passes find warmer water near the frame. Changing currents prevent us from identifying where the heat came from.',
    },
    model: {
      label: 'Modeled · heat transport',
      value: 'Heat source still unknown',
      detail:
        'A flow model allows waste heat, sediment chemistry, or warm outfall water. More temperature and current measurements could separate these sources.',
    },
    contradiction:
      'Warm water alone cannot tell us whether the frame uses power or contains anything alive.',
    dialogue: [
      {
        id: 'thermal-mara',
        speaker: 'Mara',
        text: 'For a moment I thought it was breathing.',
      },
      {
        id: 'thermal-kite',
        speaker: 'Kite',
        text: 'So did I. Then I checked the current. We can feel something before we understand it, as long as we remember the difference.',
      },
    ],
  },
  {
    id: 'archive',
    title: 'The missing depth',
    subtitle: 'Public archive · first post-Unbinding survey',
    position: { x: 39, y: 40 },
    observation: {
      label: 'Observed · archived survey',
      value: 'Survey stopped above the frame',
      detail:
        'The first post-Unbinding survey recorded open water here. Its instrument could only measure down to nine meters above the frame.',
    },
    model: {
      label: 'Modeled · historical inference',
      value: 'Absence was never measured',
      detail:
        'The frame could have been below the survey’s reach, or arrived later. This record gives us no direct link to the Unbinding.',
    },
    contradiction:
      'The map and sonar cover different depths. The old survey never looked where the frame lies.',
    dialogue: [
      {
        id: 'archive-mara',
        speaker: 'Mara',
        text: 'My grandmother called this the place the city learned to listen. I thought she meant the assemblies after the Unbinding.',
      },
      {
        id: 'archive-kite',
        speaker: 'Kite',
        text: 'Perhaps she did. A gap in a survey is a reason to measure again, Mara. It is not a secret merely because we want one.',
      },
    ],
  },
]

export const conclusionChoices: ConclusionChoice[] = [
  {
    id: 'survey',
    label: 'Let’s map it without disturbing it.',
    detail: 'Plan a noninvasive survey with the harbor cooperative.',
    ending: [
      {
        id: 'survey-mara',
        speaker: 'Mara',
        text: 'A full sonar pass, current measurements, and a look through the maintenance records. No digging. If it has been here all this time, it can survive a few more careful questions.',
      },
      {
        id: 'survey-kite',
        speaker: 'Kite',
        text: 'I’ll assemble the survey plan with the harbor cooperative. We can measure what we need without lifting the frame. Whatever this is, it shares a harbor with a great many living things.',
      },
      {
        id: 'survey-close',
        speaker: 'Narrator',
        text: 'You save the plan together. Above the hidden frame, a ferry opens its doors and the evening crowd spills into the light. For once, leaving a question open feels like making room.',
      },
    ],
  },
  {
    id: 'handshake',
    label: 'Send a quiet introduction.',
    detail: 'Use the maintenance probe’s lamp for one low-energy blue greeting.',
    ending: [
      {
        id: 'handshake-mara',
        speaker: 'Mara',
        text: 'Use the probe’s inspection lamp. One brief blue pulse. If there is anything down there that can see it, let it see us arrive quietly.',
      },
      {
        id: 'handshake-kite',
        speaker: 'Kite',
        text: 'Pulse sent. The probe camera registered three faint points of light about 0.8 seconds later. I’m logging a delayed emission. It could be unrelated; we haven’t established a reply.',
      },
      {
        id: 'handshake-close',
        speaker: 'Narrator',
        text: 'The three points fade from the camera feed. You stay by the rail a little longer. It is a strange thing, to wonder whether you have just passed a neighbor in the dark.',
      },
    ],
  },
]
