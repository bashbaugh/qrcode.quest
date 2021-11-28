import { GetQuestResponse } from 'pages/api/quest/[slug]'
import { useReducer } from 'react'
import axios from './axios'

export interface QuestState {
  quest?: GetQuestResponse['quest']
}

export type QuestStateAction = {
  type: 'setQuest'
  quest: QuestState['quest']
}

export function questStateReducer(state: QuestState, action: QuestStateAction): QuestState {
  switch (action.type) {
    case 'setQuest': {
      return {
        ...state,
        quest: action.quest
      }
    }
    default:
      throw new Error('Invalid questStateReducer action')
  }
}

export const useQuestState = () => {
  return useReducer<typeof questStateReducer>(questStateReducer, {})
}
