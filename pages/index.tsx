import type { NextPage } from 'next'
import Layout from 'components/Layout'
import Meta from 'components/Meta'
import { Flex, Spacer, Image, Button, Text } from '@chakra-ui/react'
import { useGlobalState } from 'lib/state'
import Link from 'next/link'

const Home: NextPage = () => {
  const user = useGlobalState((s) => s.user)

  return (
    <Layout>
      <Meta title="Home" />
      <Flex gridGap={'4'}>
        <Image src="/img/logo1.svg" alt="QRCode.Quest" h="9" />
        <Text></Text>
        <Spacer />
        {user && (
          <Link href="/quests">
            <a>
              <Button>My Quests</Button>
            </a>
          </Link>
        )}
        {!user && (
          <>
            <Link href="/signin">
              <a>
                <Button variant={'outline'}>Sign In</Button>
              </a>
            </Link>
            <Link href="/signin?toCreate=1">
              <a>
                <Button colorScheme={'green'}>Make a Quest</Button>
              </a>
            </Link>
          </>
        )}
      </Flex>
    </Layout>
  )
}

export default Home
