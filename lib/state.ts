import create from 'zustand'
import { User } from '@firebase/auth'

export const useGlobalState = create<{
  user?: User | null
}>((set) => ({
  user: undefined,
}))
