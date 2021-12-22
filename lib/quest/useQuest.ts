import type { Quest } from '@prisma/client'
import axios from 'lib/axios'
import { useGlobalState } from 'lib/state'
import { useToast } from 'lib/toast'
import { useRouter } from 'next/router'
import { GetQuestResponse } from 'pages/api/quest/[slug]'
import { DeleteResponse } from 'pages/api/quest/[slug]/delete'
import { UpdateQuestCodeResponse } from 'pages/api/quest/[slug]/updatecode'
import { useEffect, useState } from 'react'

// TODO useCb?
const useQuest = () => {
  const router = useRouter()
  const user = useGlobalState((s) => s.user)
  const [quest, setQuestData] = useState<GetQuestResponse['quest']>()
  // const quest = state.quest

  const toast = useToast()

  const [_refreshTrigger, _setRefreshTrigger] = useState(0)
  const refreshQuest = () => _setRefreshTrigger((i) => i + 1)
  useEffect(() => {
    if (user)
      axios
        .get<GetQuestResponse>('/api/quest/' + router.query.questId)
        .then((res) => {
          setQuestData(res.data.quest)
          // setVictoryType(res.data.quest?.victoryFulfillment)
          if (res.data.notFound) {
            router.push('/quests')
            toast({
              title: `Quest ${router.query.questId} does not exist`,
              status: 'error',
            })
            return
          }
        })
  }, [user, _refreshTrigger])

  const [deleting, setDeleting] = useState(false)
  const deleteQuest = async () => {
    setDeleting(true)
    try {
      const res = await axios.post<DeleteResponse>(
        `/api/quest/${quest?.id}/delete`
      )
      if (res.data.deleted) {
        toast({
          title: 'Quest deleted succesfully',
        })
        router.push('/quests')
      }
    } catch (err) {
      console.error(err)
      setDeleting(false)
      // setDeleteOpen(false)
    }
  }

  const [questSaving, setQuestSaving] = useState<boolean>(false)
  const [errorSaving, setErrorSaving] = useState<boolean>(false)
  const updateQuest = async (
    newData: Partial<{
      name: string
      enableConfetti: boolean
      enableQuest: boolean
      victoryFulfillment: Quest['victoryFulfillment']
      completionNote: string
    }>
  ) => {
    setQuestSaving(true)
    setErrorSaving(false)
    try {
      const res = await axios.post<UpdateQuestCodeResponse>(
        `/api/quest/${quest?.id}/update`,
        {
          newData: {
            ...newData,
            // ...newQuestData,
          },
        }
      )
      return true
      // refreshQuest()
      // updateQuest(null)
    } catch (err) {
      // toast({
      //   title: `Error saving quest`,
      //   status: 'error',
      // })
      setErrorSaving(true)

      throw err
    } finally {
      setQuestSaving(false)
    }
  }

  /** Map of code slugs to saving bools  */
  const [codesSaving, setCodesSaving] = useState<Record<string, boolean>>({})
  const updateCode = async (
    slug: string,
    newData: Partial<{
      note: string
      name: string
    }>
  ) => {
    setCodesSaving((s) => ({ ...s, [slug]: true }))
    try {
      const res = await axios.post<UpdateQuestCodeResponse>(
        `/api/quest/${quest?.id}/updatecode`,
        {
          slug,
          newData,
        }
      )
      toast({
        title: 'Code updated',
        status: 'success',
        duration: 1000,
      })
    } catch (err) {
      // console.error(err)
      toast({
        title: `Error saving code data`,
        status: 'error',
      })

      throw err
    } finally {
      setCodesSaving((s) => ({ ...s, [slug]: false }))
    }
  }

  return {
    quest,
    deleteQuest,
    deleting,
    refreshQuest,
    questSaving,
    errorSaving,
    updateQuest,
    codesSaving,
    updateCode,
  }
}

export default useQuest
