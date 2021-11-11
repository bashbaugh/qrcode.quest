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
  useToast,
} from '@chakra-ui/react'
import { signOut, getAuth } from '@firebase/auth'
import { useRouter } from 'next/router'
import { useRequireAuth } from 'lib/hooks'

const Hunts: NextPage = () => {
  const toast = useToast({
    position: 'top',
  })
  const router = useRouter()

  useRequireAuth()

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
        <Link href="/create">
          <a>
            <Box backgroundColor={'gray.100'} rounded={'xl'} p="8">
              Add
            </Box>
          </a>
        </Link>
      </Grid>
    </Layout>
  )
}

export default Hunts
