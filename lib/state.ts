import create from 'zustand'
import { User } from '@firebase/auth'
import { GetQuestsResponse } from 'pages/api/getquests'

export const useGlobalState = create<{
  user?: User | null
}>((set) => ({
  user: undefined,
}))
