import { clues, sceneCopy } from './harbor'
import { approachNotes, museumContent } from './museum'
import type { SceneState } from '../state/scene'
import type { ReadingEntry } from '../reading/pagination'

export function fieldNotes(state: SceneState): ReadingEntry[] {
  const notes: ReadingEntry[] = clues
    .filter((clue) => state.inspected.includes(clue.id))
    .map((clue) => ({
      id: clue.id,
      title: clue.title,
      text: `Observed: ${clue.observation.value}\n\nModeled: ${clue.model.value}\n\n${clue.contradiction}`,
    }))
  if (state.museumApproach) notes.push({ id: 'approach', ...approachNotes[state.museumApproach] })
  if (state.exhibitRead)
    notes.push({
      id: 'history',
      title: 'The Night of Two Waters',
      text: 'Storm tide and hill runoff met in the lower city. A refuge beneath the east breakwater kept a listening line to shore.',
    })
  if (state.discovered)
    notes.push({
      id: 'refuge',
      title: museumContent.refugeRecord.heading,
      text: `${museumContent.refugeRecord.text}\n\nThe replica’s six ribs fit our partial sonar. A possible location, not a date or an explanation for today’s warmth or lights.`,
    })
  const lead = museumContent.leads.find((lead) => lead.id === state.museumLeadId)
  if (lead) notes.push({ id: 'lead', title: `Next step: ${lead.label}`, text: lead.detail })
  return notes.length
    ? notes
    : [
        {
          id: 'empty',
          title: 'The harbor',
          text: `${sceneCopy.emptyNotes}\n\nYour observations will appear here as you investigate.`,
        },
      ]
}
