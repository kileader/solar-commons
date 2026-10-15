import {
  clues,
  conclusionChoices,
  entryChoices,
  introLines,
  type DialogueLine,
} from '../content/harbor'
import { museumApproaches, museumContent, museumDialogue, type FloodStage } from '../content/museum'
import {
  quietIndexApproaches,
  quietIndexDialogue,
  type QuietIndexApproach,
} from '../content/quietIndex'

export type ScenePhase =
  | 'intro'
  | 'entry-choice'
  | 'response'
  | 'investigation'
  | 'decision'
  | 'ending'
  | 'complete'
  | 'museum-arrival'
  | 'museum-explore'
  | 'museum-model-intro'
  | 'museum-model'
  | 'museum-discovery'
  | 'museum-lead-choice'
  | 'museum-lead-ending'
  | 'museum-complete'
  | 'museum-approach-choice'
  | 'museum-approach'
  | 'qi-arrival'
  | 'qi-intro-shot'
  | 'qi-intro'
  | 'qi-record'
  | 'qi-approach-choice'
  | 'qi-approach'
  | 'qi-playback'
  | 'qi-ending'
  | 'qi-complete'

export interface SceneState {
  phase: ScenePhase
  lineIndex: number
  entryChoiceId: string | null
  inspected: readonly string[]
  activeClueId: string | null
  endingChoiceId: string | null
  perception: boolean
  floodStage: FloodStage
  gateOpen: boolean
  exhibitRead: boolean
  discovered: boolean
  museumLeadId: string | null
  museumApproach: 'memory' | 'signal' | null
  usedTideModel: boolean
  quietIndexApproach: QuietIndexApproach | null
  quietIndexHeard: boolean
}

export type SceneEvent =
  | { type: 'NEXT' }
  | { type: 'CHOOSE_ENTRY'; id: string }
  | { type: 'TOGGLE_PERCEPTION' }
  | { type: 'OPEN_CLUE'; id: string }
  | { type: 'CLOSE_CLUE' }
  | { type: 'MAKE_DECISION' }
  | { type: 'CHOOSE_ENDING'; id: string }
  | { type: 'RESTART' }
  | { type: 'VISIT_MUSEUM' }
  | { type: 'READ_HISTORY' }
  | { type: 'ENTER_MODEL' }
  | { type: 'SET_FLOOD_STAGE'; stage: FloodStage }
  | { type: 'TOGGLE_GATE' }
  | { type: 'INSPECT_LAMP' }
  | { type: 'LEAVE_MODEL' }
  | { type: 'CHOOSE_LEAD'; id: string }
  | { type: 'CHOOSE_MUSEUM_APPROACH'; id: string }
  | { type: 'READ_HANDOVER' }
  | { type: 'VISIT_QUIET_INDEX' }
  | { type: 'FINISH_ILEX_INTRO' }
  | { type: 'CHOOSE_QUIET_INDEX_APPROACH'; id: string }
  | { type: 'REPLAY_QUIET_INDEX' }
  | { type: 'RETURN_TO_MUSEUM' }

export const initialSceneState: SceneState = {
  phase: 'intro',
  lineIndex: 0,
  entryChoiceId: null,
  inspected: [],
  activeClueId: null,
  endingChoiceId: null,
  perception: false,
  floodStage: 0,
  gateOpen: false,
  exhibitRead: false,
  discovered: false,
  museumLeadId: null,
  museumApproach: null,
  usedTideModel: false,
  quietIndexApproach: null,
  quietIndexHeard: false,
}

function dialogueForState(state: SceneState): readonly DialogueLine[] {
  switch (state.phase) {
    case 'intro':
      return introLines
    case 'response':
      return entryChoices.find((choice) => choice.id === state.entryChoiceId)?.response ?? []
    case 'ending':
      return conclusionChoices.find((choice) => choice.id === state.endingChoiceId)?.ending ?? []
    default:
      return state.phase.startsWith('qi-') ? quietIndexDialogue(state) : museumDialogue(state)
  }
}

/** Evidence panels own their dialogue; NEXT cannot advance or dismiss them. */
export function getCurrentLine(state: SceneState): DialogueLine | null {
  return dialogueForState(state)[state.lineIndex] ?? null
}

export function canConclude(state: SceneState): boolean {
  return clues.every((clue) => state.inspected.includes(clue.id))
}

const afterDialogue: Partial<Record<ScenePhase, ScenePhase>> = {
  intro: 'entry-choice',
  response: 'investigation',
  ending: 'complete',
  'museum-arrival': 'museum-approach-choice',
  'museum-approach': 'museum-explore',
  'museum-model-intro': 'museum-model',
  'museum-discovery': 'museum-lead-choice',
  'museum-lead-ending': 'museum-complete',
  'qi-arrival': 'qi-intro-shot',
  'qi-intro': 'qi-record',
  'qi-record': 'qi-approach-choice',
  'qi-approach': 'qi-playback',
  'qi-playback': 'qi-ending',
  'qi-ending': 'qi-complete',
}

export function sceneReducer(state: SceneState, event: SceneEvent): SceneState {
  switch (event.type) {
    case 'NEXT': {
      const lines = dialogueForState(state)
      if (!lines.length) return state
      if (state.lineIndex < lines.length - 1) {
        return { ...state, lineIndex: state.lineIndex + 1 }
      }

      const nextPhase = afterDialogue[state.phase] ?? state.phase
      return {
        ...state,
        phase: nextPhase,
        lineIndex: 0,
        quietIndexHeard: state.quietIndexHeard || state.phase === 'qi-playback',
      }
    }
    case 'CHOOSE_ENTRY': {
      if (state.phase !== 'entry-choice') return state
      if (!entryChoices.some((choice) => choice.id === event.id)) return state
      return { ...state, phase: 'response', entryChoiceId: event.id, lineIndex: 0 }
    }
    case 'TOGGLE_PERCEPTION':
      return { ...state, perception: !state.perception }
    case 'OPEN_CLUE': {
      if (state.phase !== 'investigation') return state
      if (!clues.some((clue) => clue.id === event.id)) return state
      const inspected = state.inspected.includes(event.id)
        ? state.inspected
        : [...state.inspected, event.id]
      return { ...state, activeClueId: event.id, inspected }
    }
    case 'CLOSE_CLUE':
      if (state.phase !== 'investigation' || state.activeClueId === null) return state
      return { ...state, activeClueId: null }
    case 'MAKE_DECISION':
      if (state.phase !== 'investigation' || !canConclude(state)) return state
      return { ...state, phase: 'decision', activeClueId: null, lineIndex: 0 }
    case 'CHOOSE_ENDING':
      if (state.phase !== 'decision') return state
      if (!conclusionChoices.some((choice) => choice.id === event.id)) return state
      return { ...state, phase: 'ending', endingChoiceId: event.id, lineIndex: 0 }
    case 'RESTART':
      return { ...initialSceneState, inspected: [] }
    case 'VISIT_MUSEUM':
      if (state.phase !== 'complete') return state
      return { ...state, phase: 'museum-arrival', lineIndex: 0, perception: false }
    case 'READ_HISTORY':
      return state.phase.startsWith('museum-') ? { ...state, exhibitRead: true } : state
    case 'ENTER_MODEL':
      if (!['museum-explore', 'museum-complete'].includes(state.phase)) return state
      return {
        ...state,
        phase: state.phase === 'museum-explore' ? 'museum-model-intro' : 'museum-model',
        lineIndex: 0,
        usedTideModel: true,
      }
    case 'SET_FLOOD_STAGE':
      if (state.phase !== 'museum-model' || ![0, 1, 2].includes(event.stage)) return state
      return { ...state, floodStage: event.stage }
    case 'TOGGLE_GATE':
      if (state.phase !== 'museum-model' || state.floodStage === 2) return state
      return { ...state, gateOpen: !state.gateOpen }
    case 'INSPECT_LAMP':
      if (state.phase !== 'museum-model' || state.floodStage !== 2) return state
      return {
        ...state,
        discovered: true,
        phase: state.discovered ? 'museum-complete' : 'museum-discovery',
        lineIndex: 0,
      }
    case 'LEAVE_MODEL':
      if (state.phase !== 'museum-model') return state
      return { ...state, phase: 'museum-complete', perception: false }
    case 'CHOOSE_LEAD':
      if (
        state.phase !== 'museum-lead-choice' ||
        !museumContent.leads.some((lead) => lead.id === event.id)
      )
        return state
      return { ...state, museumLeadId: event.id, phase: 'museum-lead-ending', lineIndex: 0 }
    case 'CHOOSE_MUSEUM_APPROACH':
      if (
        state.phase !== 'museum-approach-choice' ||
        !museumApproaches.some((approach) => approach.id === event.id)
      )
        return state
      return {
        ...state,
        museumApproach: event.id as 'memory' | 'signal',
        phase: 'museum-approach',
        lineIndex: 0,
      }
    case 'READ_HANDOVER':
      if (!['museum-explore', 'museum-complete'].includes(state.phase) || state.discovered)
        return state
      return {
        ...state,
        usedTideModel: false,
        discovered: true,
        phase: 'museum-discovery',
        lineIndex: 0,
      }
    case 'VISIT_QUIET_INDEX':
      if (
        state.phase !== 'museum-complete' ||
        !state.discovered ||
        !museumContent.leads.some((lead) => lead.id === state.museumLeadId)
      )
        return state
      return { ...state, phase: 'qi-arrival', lineIndex: 0 }
    case 'CHOOSE_QUIET_INDEX_APPROACH': {
      if (state.phase !== 'qi-approach-choice') return state
      const approach = quietIndexApproaches.find((choice) => choice.id === event.id)
      if (!approach) return state
      return { ...state, phase: 'qi-approach', lineIndex: 0, quietIndexApproach: approach.id }
    }
    case 'FINISH_ILEX_INTRO':
      if (state.phase !== 'qi-intro-shot') return state
      return { ...state, phase: 'qi-intro', lineIndex: 0 }
    case 'REPLAY_QUIET_INDEX':
      if (state.phase !== 'qi-complete') return state
      return { ...state, phase: 'qi-arrival', lineIndex: 0 }
    case 'RETURN_TO_MUSEUM':
      if (state.phase !== 'qi-complete') return state
      return { ...state, phase: 'museum-complete', lineIndex: 0 }
    default:
      return state
  }
}
