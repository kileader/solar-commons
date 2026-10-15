import type { DialogueLine } from './harbor'
import { floodSnapshot, museumContent, type FloodStage } from './museum'

const narration = (id: string, text: string): DialogueLine => ({ id, speaker: 'Narrator', text })

/** Optional recordings use the same words displayed in the exhibit, never a second script. */
export const museumReadings = {
  gallery: narration('museum-gallery', museumContent.museumCopy.explore),
  completion: narration('museum-completion', museumContent.museumCopy.completion),
  leaveEarly: narration(
    'museum-leave-early',
    'We can come back. The exhibit is a reconstruction, not an exam. There may be more to find in its dawn record.',
  ),
  refuge: narration('refuge-record', museumContent.refugeRecord.text),
  introduction: narration('exhibit-introduction', museumContent.historicalExhibit.introduction),
  source: narration('exhibit-source', museumContent.historicalExhibit.source),
}

export function exhibitSectionReadings(index: number): readonly DialogueLine[] {
  const section = museumContent.historicalExhibit.sections[index]
  return [
    narration(`exhibit-${index}-heading`, section.title),
    ...section.paragraphs.map((text, paragraph) =>
      narration(`exhibit-${index}-${paragraph}`, text),
    ),
  ]
}

export function modelReading(stage: FloodStage, gateOpen: boolean) {
  // Dawn has one account regardless of the wheel's earlier position.
  return narration(
    `model-${stage}-${stage < 2 && gateOpen ? 'open' : 'closed'}`,
    floodSnapshot(stage, gateOpen).detail,
  )
}
