import type { NextPage, NextPageContext } from 'next'
import Layout from 'components/Layout'
import Meta from 'components/Meta'
import { useRouter } from 'next/router'
import { Heading, Skeleton, SkeletonText, Box, Stack } from '@chakra-ui/react'
import { useGlobalState } from 'lib/state'
import { useRequireAuth } from 'lib/hooks'
import { useEffect, useState } from 'react'
import { GetQuestResponse } from 'pages/api/getquest'
import axios from 'lib/axios'
import { useToast } from 'lib/toast'
import create from 'zustand'
import { GetQuestsResponse } from 'pages/api/getquests'

const QuestSettings: NextPage = () => {
  useRequireAuth()
  const router = useRouter()
  const user = useGlobalState((s) => s.user)
  const [quest, setQuestData] = useState<GetQuestResponse['quest']>()
  const toast = useToast()

  useEffect(() => {
    if (user)
      axios
        .get<GetQuestResponse>('/api/getquest?id=' + router.query.questId)
        .then((res) => {
          setQuestData(res.data.quest)
          if (res.data.notFound) {
            router.push('/quests')
            toast({
              title: `Quest ${router.query.questId} does not exist`,
              status: 'error',
            })
          }
        })
  }, [user])

  return (
    <Layout>
      {!quest && (
        <>
          <Skeleton h="12" w="72" />
          <SkeletonText mt="12" noOfLines={6} spacing="4" />
        </>
      )}
      {quest && (
        <>
          <Meta title={quest.name} />
          <Heading size="md" color={'gray'} fontWeight={'semibold'}>
            Quest Details
          </Heading>
          <Heading>{quest.name}</Heading>

          <Box my='12'>
          <Heading size="lg" color='gray'>Codes</Heading>
          <Stack spacing={'4'} my='4'>
          {quest.codes.map(c => <Box key={c.slug}>
            {c.slug}, {c.scans}
          </Box>)}
          </Stack>
          </Box>
        </>
      )}
    </Layout>
  )
}

export default QuestSettings
