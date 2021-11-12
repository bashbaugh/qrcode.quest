import type { NextPage } from 'next'
import Layout from 'components/Layout'
import Meta from 'components/Meta'
import Link from 'next/link'
import {
  Flex,
  Heading,
  Button,
  Spacer,
  Grid,
  Box,
  Skeleton,
} from '@chakra-ui/react'
import { signOut, getAuth } from '@firebase/auth'
import { useRouter } from 'next/router'
import { useRequireAuth } from 'lib/hooks'
import { useToast } from 'lib/toast'
import { useEffect, useState } from 'react'
import { useGlobalState } from 'lib/state'
import { GetQuestsResponse } from './api/getquests'
import axios from 'lib/axios'
import create from 'zustand'

const useQuests = create<{
  quests: GetQuestsResponse['quests']
  loaded: boolean
  refreshQuests: () => void
}>((set) => ({
  quests: [],
  loaded: false,
  refreshQuests() {
    axios.get<GetQuestsResponse>('/api/getquests').then((res) => {
      set({ quests: res.data.quests, loaded: true })
    })
  },
}))

const Hunts: NextPage = () => {
  useRequireAuth()
  const toast = useToast()
  const router = useRouter()
  const user = useGlobalState((s) => s.user)
  const { quests, loaded, refreshQuests } = useQuests()

  useEffect(() => {
    if (user) refreshQuests()
  }, [user])

  return (
    <Layout>
      <Meta title="My Quests" />
      <Flex alignItems={'center'}>
        <Heading>My Quests</Heading>
        <Spacer />
        <Button
          onClick={async () => {
            router.push('/')
            await signOut(getAuth())
            toast({
              title: `You've been signed out`,
              status: 'success',
            })
          }}
        >
          Sign Out
        </Button>
      </Flex>
      <Grid templateColumns="repeat(3, 1fr)" gap={4} my="8">
        {loaded && (
          <>
            <Link href="/create">
              <a>
                <Box backgroundColor={'gray.100'} rounded={'xl'} p="8">
                  Add
                </Box>
              </a>
            </Link>
            {quests?.map((q) => (
              <Link key={q.id} href={`/q/${q.id}`}>
                <a>
                  <Box backgroundColor={'gray.100'} rounded={'xl'} p="8">
                    {q.name}
                  </Box>
                </a>
              </Link>
            ))}
          </>
        )}
        {!loaded && (
          <>
            <Skeleton w="full" rounded="xl" p="8">
              hey
            </Skeleton>
            <Skeleton w="full" rounded="xl" p="8">
              hey
            </Skeleton>
            <Skeleton w="full" rounded="xl" p="8">
              hey
            </Skeleton>
            <Skeleton w="full"  rounded="xl" p="8">
              hey
            </Skeleton>
            <Skeleton w="full" rounded="xl" p="8">
              hey
            </Skeleton>
          </>
        )}
      </Grid>
    </Layout>
  )
}

export default Hunts
