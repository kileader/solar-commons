import {
  clues,
  conclusionChoices,
  entryChoices,
  introLines,
  type DialogueLine,
} from '../content/harbor'

export type ScenePhase =
  'intro' | 'entry-choice' | 'response' | 'investigation' | 'decision' | 'ending' | 'complete'

export interface SceneState {
  phase: ScenePhase
  lineIndex: number
  entryChoiceId: string | null
  inspected: readonly string[]
  activeClueId: string | null
  endingChoiceId: string | null
  perception: boolean
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

export const initialSceneState: SceneState = {
  phase: 'intro',
  lineIndex: 0,
  entryChoiceId: null,
  inspected: [],
  activeClueId: null,
  endingChoiceId: null,
  perception: false,
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
      return []
  }
}

/** Evidence panels own their dialogue; NEXT cannot advance or dismiss them. */
export function getCurrentLine(state: SceneState): DialogueLine | null {
  return dialogueForState(state)[state.lineIndex] ?? null
}

export function canConclude(state: SceneState): boolean {
  return clues.every((clue) => state.inspected.includes(clue.id))
}

export function sceneReducer(state: SceneState, event: SceneEvent): SceneState {
  switch (event.type) {
    case 'NEXT': {
      if (!['intro', 'response', 'ending'].includes(state.phase)) return state

      const lines = dialogueForState(state)
      if (state.lineIndex < lines.length - 1) {
        return { ...state, lineIndex: state.lineIndex + 1 }
      }

      const nextPhase: ScenePhase =
        state.phase === 'intro'
          ? 'entry-choice'
          : state.phase === 'response'
            ? 'investigation'
            : 'complete'
      return { ...state, phase: nextPhase, lineIndex: 0 }
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
    default:
      return state
  }
}
