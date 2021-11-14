import type { NextPage } from 'next'
import Layout from 'components/Layout'
import Meta from 'components/Meta'
import {
  Flex,
  Spacer,
  Image,
  Button,
  Text,
  Heading,
  Box,
} from '@chakra-ui/react'
import { useGlobalState } from 'lib/state'
import Link from 'next/link'
import { useState } from 'react'

const ctaBtnHoverActiveObj = {
  bgGradient: 'linear(to-r, pink.500, purple.500)',
  transform: 'scale(1.05)',
  shadow: '2xl',
}

const Home: NextPage = () => {
  const user = useGlobalState((s) => s.user)

  const [currentDemoCode, setCurrentDemoCode] = useState(0)

  return (
    <Layout>
      <Meta title="Home" />
      <Flex gridGap={'4'} alignItems={'center'}>
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

      <Flex my="12" gridGap={'20'} direction={'column'} alignItems={'center'}>
        <Flex gridGap={'16'} w={'full'} alignItems={'center'}>
          <Box>
            <Heading as="h1" size="lg" mb="4">
              📱 Automate your Scavenger Hunt ✨
            </Heading>
            <Text fontSize="lg">
              Create a series of QR codes for your questers to scan. Then,
              monitor their progress and track your quest&apos;s champions.{' '}
              <Text fontWeight={'bold'} as="span">
                Try it out now by scanning the code to the right with your
                phone&apos;s camera.
              </Text>
            </Text>
          </Box>
          <Box textAlign={'center'}>
            <Image
              p="2"
              my="1"
              borderRadius={'lg'}
              border="1px"
              borderColor={'gray.100'}
              shadow="lg"
              src={`/img/democode${currentDemoCode ? '2' : '1'}.svg`}
              w="35rem"
              alt="QR Code"
            />
            <Button
              color="gray.500"
              variant={'link'}
              onClick={() => setCurrentDemoCode((c) => (c ? 0 : 1))}
            >
              {currentDemoCode ? 'View first code' : 'View second code'}
            </Button>
          </Box>
        </Flex>

        <Link href={user ? '/create' : '/signin?toCreate=1'}>
          <a>
            <Button
              color="white"
              px="12"
              py="6"
              bgGradient={'linear(to-r, pink.500, purple.500)'}
              _hover={ctaBtnHoverActiveObj}
              _active={ctaBtnHoverActiveObj}
              size="lg"
            >
              Make a Quest
            </Button>
          </a>
        </Link>
      </Flex>
    </Layout>
  )
}

export default Home
