import type { DialogueLine } from './harbor'
import type { SceneState } from '../state/scene'

/** Provisional handoff draft; each passage keeps its future recording ID. */
export const quietIndexScript: readonly DialogueLine[] = [
  {
    id: 'qi-arrival-01',
    speaker: 'Narrator',
    text: "Night changes Larkhaven without erasing it. Gardens spill over canal railings, but the city's brightness narrows to amber lanterns, dark shop windows, and reflections trembling beneath pedestrian bridges. This quarter seems to prefer questions asked after sunset.",
  },
  {
    id: 'qi-arrival-02',
    speaker: 'Mara',
    text: '"The Quiet Index." That\'s either a restoration studio or an exceptionally polite haunting. I hope they have tea.',
  },
  {
    id: 'qi-arrival-04',
    speaker: 'Mara',
    text: "You're taking all the fun out of fieldwork. Come on.",
  },
  {
    id: 'qi-intro-01',
    speaker: 'Narrator',
    text: 'The Quiet Index smells faintly of tea and warm electronics. Damaged recordings rest in padded trays beneath handwritten labels. At a restoration bench sits a figure in dark layered fabrics, one eye shining amber beside an exposed ceramic cranial lattice. Their white-and-brass prosthetic fingers adjust a delicate instrument.',
  },
  {
    id: 'qi-intro-02',
    speaker: 'Ilex',
    text: "Welcome. Please don't touch anything older than you. If you're looking for the Hall of Waters, you've taken a rather interesting wrong turn.",
  },
  {
    id: 'qi-intro-03',
    speaker: 'Mara',
    text: "Actually, I'm hoping we've found the right place. I'm Mara, and I've brought a companion. Kite, would you like to introduce yourself?",
  },
  {
    id: 'qi-intro-04',
    speaker: 'Ilex',
    text: 'An independent intelligence? Certainly. My guest channel is open, but public presence only, please. I prefer keeping my private senses to myself.',
  },
  {
    id: 'qi-intro-05',
    speaker: 'Narrator',
    text: "Kite requests permission to share their avatar and voice. Ilex accepts. A familiar shape of articulated facets and narrow fins unfolds in Ilex's augmented vision; Kite's subtly synthetic voice arrives through the auditory interface. There's no physical hologram in the room, and neither person's private sensory stream is shared.",
  },
  {
    id: 'qi-intro-06',
    speaker: 'Kite',
    text: "Hello, Ilex. I'm Kite. Thank you for the invitation. I particularly admire your optical interface design.",
  },
  {
    id: 'qi-intro-07',
    speaker: 'Ilex',
    text: 'And I admire yours. Those moving facets are exquisite. Did Mara design you, or have you been doing your own renovations?',
  },
  {
    id: 'qi-intro-08',
    speaker: 'Kite',
    text: "Mara selected my original geometry. I've made several modifications since then, including changes she considers unnecessarily elaborate.",
  },
  {
    id: 'qi-intro-09',
    speaker: 'Mara',
    text: 'I just think all those moving fins make you harder to follow. They used to be a perfectly respectable little diamond.',
  },
  {
    id: 'qi-intro-10',
    speaker: 'Ilex',
    text: "More fins? Darling, you've shown extraordinary restraint. I once spent six months redesigning the joints in my left hand because I disliked the way they looked while holding a teacup.",
  },
  {
    id: 'qi-intro-11',
    speaker: 'Narrator',
    text: 'Ilex demonstrates with a graceful turn of their prosthetic fingers, then lifts a sealed, flood-damaged media cartridge from its padded case.',
  },
  {
    id: 'qi-intro-12',
    speaker: 'Ilex',
    text: "Now, you two share perception, don't you? Interesting arrangement. I've always preferred augmenting my own senses rather than inviting another intelligence into the process.",
  },
  {
    id: 'qi-intro-13',
    speaker: 'Mara',
    text: "It's voluntary, and Kite isn't just an extension of my brain. We work together. Besides, with that much hardware in your head, you've hardly chosen the minimalist approach.",
  },
  {
    id: 'qi-intro-14',
    speaker: 'Ilex',
    text: "True, but my hardware doesn't interrupt me in the middle of a thought.",
  },
  {
    id: 'qi-intro-15',
    speaker: 'Kite',
    text: 'That sounds lonely.',
  },
  {
    id: 'qi-intro-16',
    speaker: 'Ilex',
    text: 'That sounds like something an interruption would say.',
  },
  {
    id: 'qi-intro-17',
    speaker: 'Mara',
    text: 'Okay, I like them.',
  },
  {
    id: 'qi-intro-18',
    speaker: 'Kite',
    text: 'You say that about anyone who insults me elegantly.',
  },
  {
    id: 'qi-intro-19',
    speaker: 'Ilex',
    text: "Then I believe we're going to get along. Now, what brings an ocean researcher and a very articulate geometric sculpture into my archive?",
  },
  {
    id: 'qi-intro-20',
    speaker: 'Mara',
    text: "The Night of Two Waters. Specifically, someone who was still speaking through the refuge's listening line after the last ferry left.",
  },
  {
    id: 'qi-intro-21',
    speaker: 'Narrator',
    text: "Ilex's fingers stop moving. The warm light in their augmented eye contracts to a narrow amber ring.",
  },
  {
    id: 'qi-intro-22',
    speaker: 'Ilex',
    text: "Well. That's a considerably more interesting introduction than I expected. I think you'd better sit down.",
  },
  {
    id: 'qi-record-01',
    speaker: 'Narrator',
    text: 'Ilex gestures to chairs beside the bench. They settle the damaged cartridge in a protective reader, and an irregular waveform appears across the work surface. Its peaks stutter in the amber light.',
  },
  {
    id: 'qi-record-02',
    speaker: 'Ilex',
    text: "I have a recording associated with the lower refuge. Its original condition was terrible, and the surviving documentation is incomplete. I can play a short excerpt, but I won't distribute copies. The donor imposed restrictions, and I take those seriously.",
  },
  {
    id: 'qi-record-03',
    speaker: 'Mara',
    text: "We're not here to make a documentary. The handover says someone kept that line open. We want to understand what happened, and what it might tell us about the place beneath the breakwater.",
  },
  {
    id: 'qi-record-04',
    speaker: 'Ilex',
    text: "Before I play anything, tell me how you're approaching it. The question you ask first will shape what we examine together.",
  },
  {
    id: 'qi-analysis-01',
    speaker: 'Mara',
    text: "Start with the evidence. Where was it recovered, how do you know it belongs to the refuge, and what did restoration change? I'd rather establish what we're actually listening to before deciding what it means.",
  },
  {
    id: 'qi-analysis-02',
    speaker: 'Ilex',
    text: "It came from a flood-damaged family collection, annotated as east breakwater. The format fits equipment from the Unbinding, but that doesn't prove provenance. More interestingly, someone edited it before I received it. There's a missing segment, and I don't know why it was removed.",
  },
  {
    id: 'qi-analysis-03',
    speaker: 'Kite',
    text: "Then we should distinguish original capture, later intervention, and modern reconstruction. A consistent feature could matter, but the cleaned version isn't a transparent window into the past.",
  },
  {
    id: 'qi-empathy-01',
    speaker: 'Mara',
    text: "You could have turned us away. Instead, you're considering sharing something you've worked hard to protect. Who are you worried about hurting?",
  },
  {
    id: 'qi-empathy-02',
    speaker: 'Ilex',
    text: 'The speaker, first of all. And a family who feared an incomplete recording could turn someone into a hero, a villain, or public property. They allowed limited research access, not unrestricted release. Whether the original speaker would have approved even that much is a harder question.',
  },
  {
    id: 'qi-empathy-03',
    speaker: 'Kite',
    text: "So you're balancing the speaker's autonomy against a legitimate public interest in history. Those obligations can conflict even when everyone involved is acting in good faith.",
  },
  {
    id: 'qi-intuition-01',
    speaker: 'Mara',
    text: "You've probably restored a thousand damaged recordings. Why does this one still keep you awake?",
  },
  {
    id: 'qi-intuition-02',
    speaker: 'Ilex',
    text: 'The museum presents dawn as an ending. The last ferry returned, the streets began to clear, and the city survived. But this recording sounds like someone making a decision to stay. I keep wondering what could have mattered enough.',
  },
  {
    id: 'qi-intuition-03',
    speaker: 'Kite',
    text: "The handover calls the line attended, not abandoned. That could suggest purpose, but it doesn't establish whether staying was voluntary. We need to resist a convenient story even when it moves us.",
  },
  {
    id: 'qi-play-01',
    speaker: 'Ilex',
    text: "All right. An excerpt. You're welcome to examine what you hear, but please don't record or transmit it. I'd also recommend waiting until the speaker finishes before deciding who they are.",
  },
  {
    id: 'qi-play-02',
    speaker: 'Kite',
    text: "Agreed. I'll keep analysis local to this session.",
  },
  {
    id: 'qi-play-03',
    speaker: 'Narrator',
    text: 'The room dims. Beneath a bed of noise, a weary voice emerges. Water drips nearby. A low electrical hum continues beneath the words.',
  },
  {
    id: 'qi-play-04',
    speaker: 'Unknown speaker (recording)',
    text: "Shore, do you still have us? ... Yes. I know the ferries are gone. No, don't close it yet. She's still here. ... I said she's still here. She can hear you. Just keep the line open.",
  },
  {
    id: 'qi-play-05',
    speaker: 'Narrator',
    text: 'The speaker falls silent. Two clicks follow, then a faint disturbance that might be another signal. The surviving recording cuts off. The identity of the speaker, of "she," and of any other presence remains unknown.',
  },
  {
    id: 'qi-play-06',
    speaker: 'Mara',
    text: 'They\'re talking to someone on shore, but also about someone in the refuge. Whoever "she" was, the speaker believed she could hear the other end of the line. That\'s more than a simple request for rescue.',
  },
  {
    id: 'qi-play-07',
    speaker: 'Kite',
    text: "It's consistent with several participants, but we can't identify them. The clicks could be switching noise rather than replies. What interests me is the insistence on keeping communication open after the last ferry.",
  },
  {
    id: 'qi-play-08',
    speaker: 'Ilex',
    text: "Exactly. The original system was built for emergency communication, but maintenance records mention auxiliary circuits. We don't know which were still active that night. Now you understand why I don't have a neat conclusion to give you.",
  },
  {
    id: 'qi-end-01',
    speaker: 'Mara',
    text: "We have an unknown speaker, someone they refused to leave behind, and a line running toward a structure we've only just found. I'm not calling it proof. But I'm definitely not calling it nothing.",
  },
  {
    id: 'qi-end-02',
    speaker: 'Ilex',
    text: "A better question, certainly. You're welcome to investigate, provided you don't mistake enthusiasm for evidence. I can help you find the remaining circuit diagrams and donor notes, subject to the same restrictions.",
  },
  {
    id: 'qi-end-04',
    speaker: 'Narrator',
    text: 'Outside, music curls through the canal district. The harbor waits beyond the bridges. Ilex returns the recording to its case, and Mara realizes that an old civic ending has become a new question.',
  },
]

export type QuietIndexApproach = 'analysis' | 'empathy' | 'intuition'

export const quietIndexApproaches = [
  { id: 'analysis', label: 'Analysis', detail: 'Establish what the recording can prove.' },
  { id: 'empathy', label: 'Empathy', detail: 'Understand why the recording is protected.' },
  {
    id: 'intuition',
    label: 'Intuition',
    detail: 'Ask what makes this particular recording unusual.',
  },
] as const

export const quietIndexNotes: Record<QuietIndexApproach, { title: string; text: string }> = {
  analysis: {
    title: 'An early splice / missing section',
    text: 'Ilex reports an edit predating their restoration. The recording was altered; the purpose of the alteration is unknown. Original capture, later intervention, and modern reconstruction must be distinguished.',
  },
  empathy: {
    title: 'Consent and donor limits',
    text: 'Ilex is protecting a recording subject and family, not merely hiding a secret. The donor allowed limited research access, not unrestricted release. The original speaker’s wishes remain unknown.',
  },
  intuition: {
    title: 'Someone remained for a reason?',
    text: 'The handover calls the line attended. Staying for a purpose is a compelling interpretation, not established fact. Whether anyone stayed voluntarily remains unknown.',
  },
}

export const quietIndexArrivalVariants: Record<'stair' | 'voices', DialogueLine> = {
  stair: {
    id: 'qi-arrival-03-stair',
    speaker: 'Kite',
    text: 'Before requesting safe access to the stair, we need context on the listening-line circuit. The preservation notes point to an independent conservator named Ilex Vale. The shop is open; I suggest we introduce ourselves before concluding it’s haunted.',
  },
  voices: {
    id: 'qi-arrival-03-voices',
    speaker: 'Kite',
    text: 'The collection reference for the missing refuge testimony points to an independent conservator named Ilex Vale. The shop is open; I suggest we introduce ourselves before concluding it’s haunted.',
  },
}

export const quietIndexEndingVariants: Record<'stair' | 'voices', DialogueLine> = {
  stair: {
    id: 'qi-end-03-stair',
    speaker: 'Kite',
    text: 'We should continue planning the shore survey and safe access to the stair, with the circuit diagrams as context. We haven’t established who spoke, how many were present, or whether the present harbor anomaly has anything to do with this old recording.',
  },
  voices: {
    id: 'qi-end-03-voices',
    speaker: 'Kite',
    text: 'We should continue the search for missing testimony, with the restricted donor notes as context. We haven’t established who spoke, how many were present, or whether the present harbor anomaly has anything to do with this old recording.',
  },
}

const passages = (prefix: string) => quietIndexScript.filter((line) => line.id.startsWith(prefix))
const arrival = passages('qi-arrival-')
const ending = passages('qi-end-')

/** Conditional wording has its own recording ID; the selected museum lead never changes. */
export function quietIndexDialogue(state: SceneState): readonly DialogueLine[] {
  const lead = state.museumLeadId === 'voices' ? 'voices' : 'stair'
  switch (state.phase) {
    case 'qi-arrival':
      return [arrival[0], arrival[1], quietIndexArrivalVariants[lead], arrival[2]]
    case 'qi-intro':
      return passages('qi-intro-')
    case 'qi-record':
      return passages('qi-record-')
    case 'qi-approach':
      return state.quietIndexApproach ? passages(`qi-${state.quietIndexApproach}-`) : []
    case 'qi-playback':
      return passages('qi-play-')
    case 'qi-ending':
      return [ending[0], ending[1], quietIndexEndingVariants[lead], ending[2]]
    default:
      return []
  }
}

/** Every implemented passage and lead variation has its own supplied recording. */
export const quietIndexVoiceLines: readonly DialogueLine[] = [
  ...quietIndexScript,
  ...Object.values(quietIndexArrivalVariants),
  ...Object.values(quietIndexEndingVariants),
]
