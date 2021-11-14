import type { NextPage, NextPageContext } from 'next'
import Layout from 'components/Layout'
import Meta from 'components/Meta'
import { useRouter } from 'next/router'
import { Badge, Box, Button, Flex, Heading, Tag, Text } from '@chakra-ui/react'
import getCode from 'lib/getCode'
import cookie from 'cookie'
import { useEffect, useRef, useState } from 'react'
import ConfettiGenerator from 'confetti-js'
import axios from 'lib/axios'
import { ClaimCodeResponse } from './api/claim/[slug]/code'
import { useToast } from 'lib/toast'
import { InfoIcon } from '@chakra-ui/icons'
import { Quest } from '@prisma/client'
import { setCookieHeader } from 'lib/cookies'

export const DEFAULT_COMPLETION_NOTE = 'Congrats, you found all the codes!'

export const CLAIM_CODE_LENGTH = 5

interface CodePageProps {
  data:
    | {
        questDeleted: true
      }
    | {
        questDeleted: false
        slug: string
        note?: string | null
        isFinalCode: boolean
        isFirstCode: boolean
        isNewCode: boolean
        codesFound: number
        totalCodes: number
        questClaimed: boolean
        enableConfetti: boolean
        completionNote: string | null
        victoryFulfillment: Quest['victoryFulfillment']
        enableQuest: boolean
      }
}

const QuestSettings: NextPage<CodePageProps> = ({ data }) => {
  const confettiCanvasRef = useRef<HTMLCanvasElement>(null)
  const router = useRouter()
  const [claiming, setClaiming] = useState(false)
  const [claimNotAllowed, setClaimNoteAllowed] = useState(false)
  const [claimCode, setClaimCode] = useState<string>()
  const [alreadyClaimed, setAlreadyClaimed] = useState(false)
  const toast = useToast()

  const testMode = !!router.query.testMode

  useEffect(() => {
    // // On iPhone safari, need to reload to work around problem which blocks cookies when scanning from QR code
    // if (
    //   /iPhone|iPad|iPod/i.test(navigator.userAgent) &&
    //   !router.query.iphoneReloaded
    // ) {
    //   router
    //     .replace('?iphoneReloaded=1', undefined, {})
    //     .then(() => router.reload())
    // }

    if (!data.questDeleted && (data.enableQuest || testMode)) {
      // const questAlreadyClaimed = document.cookie
      //   ?.split('; ')
      //   ?.find((row) => row.startsWith(CLAIMED_QUESTS_COOKIE_NAME + '='))
      //   ?.split('=')[1]
      //   .split(COOKIE_DELIMITER)
      //   .includes(data.slug)

      // if (questAlreadyClaimed) setAlreadyClaimed(true)

      if (!testMode && !router.query.scanTracked) {
        // Track the scan and mark this as a completion if it's the final code.
        axios.post('/api/trackscan', {
          slug: data.slug,
          completed: data.isNewCode && data.isFinalCode,
        })
        router.replace(window.location.href + '?scanTracked=1', undefined, {
          scroll: false,
          shallow: true,
        })
      }

      if (data.enableConfetti && data.isFinalCode) {
        const confetti = new ConfettiGenerator({
          target: confettiCanvasRef.current,
          max: '100',
          size: '1',
          animate: true,
          props: ['circle', 'square', 'triangle', 'line'],
          colors: [
            [165, 104, 246],
            [230, 61, 135],
            [0, 199, 228],
            [253, 214, 126],
          ],
          clock: '16',
          rotate: true,
          start_from_edge: false,
          respawn: true,
        })
        confetti.render()

        return () => {
          confetti.clear()
        }
      }
    }
  }, [])

  const claimQuest = async () => {
    if (data.questDeleted || testMode) {
      toast({
        title: `You can't claim a quest in test mode. Try scanning the QR codes.`,
      })
      return
    }
    setClaiming(true)
    try {
      const res = await axios.post<ClaimCodeResponse>(`/api/claim/${data.slug}/code`)

      if (res.data.claimCode) {
        let codeString = res.data.claimCode.toString()
        for (let i = 0; i < CLAIM_CODE_LENGTH - codeString.length; i++)
          codeString = '0' + codeString
        setClaimCode(codeString)
      } else if (res.data.notAllowed) setClaimNoteAllowed(true)
    } catch (err) {
      console.log(err)
      toast({
        title: `Please try again`,
        status: 'error',
      })
    } finally {
      setClaiming(false)
    }
  }

  return (
    <Layout>
      <Meta title={'You found a secret code'} />
      <canvas
        ref={confettiCanvasRef}
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          width: '100%',
          height: '100%',
          zIndex: -1,
        }}
      />
      <Flex
        sx={{
          flexDirection: 'column',
          position: 'absolute',
          top: 0,
          left: 0,
          minHeight: '100vh',
          w: '100%',
          justifyContent: 'center',
          p: '4',
        }}
      >
        <Box>
          {!data.questDeleted && (data.enableQuest || testMode) && (
            <>
              <Flex
                w="full"
                gridGap={'6'}
                direction="column"
                alignItems={'center'}
              >
                <Heading
                  size="lg"
                  bgGradient="linear(to-l, #7928CA, #FF0080)"
                  bgClip="text"
                >
                  {!data.isFinalCode && 'You found a secret code!'}
                  {data.isFinalCode && 'You found all the codes!'}
                </Heading>
                {!data.isNewCode && !data.isFinalCode && (
                  <Text fontSize="sm">(but you already found this one)</Text>
                )}
                {!data.isFinalCode && (
                  <Text fontWeight={'bold'}>
                    There are{' '}
                    <Badge colorScheme={'purple'} fontSize={'lg'}>
                      {data.totalCodes - data.codesFound}
                    </Badge>{' '}
                    codes left to scan 🎉
                  </Text>
                )}
                {data.isFinalCode && <Text fontWeight={'bold'}>Nice job!</Text>}
                {(data.note || data.isFinalCode) && (
                  <Box
                    p="4"
                    border="1px"
                    borderColor={'violet'}
                    rounded="lg"
                    shadow="xl"
                    backgroundColor={'white'}
                    opacity={'0.8'}
                  >
                    <Text fontSize={'md'} textAlign={'center'}>
                      {data.isFinalCode && data.completionNote
                        ? data.completionNote
                        : data.note ||
                          (data.isFinalCode ? DEFAULT_COMPLETION_NOTE : '')}
                    </Text>
                  </Box>
                )}
                {data.isFinalCode && data.victoryFulfillment === 'CLAIM_CODE' && (
                  <>
                    {!claimCode && !claimNotAllowed && !alreadyClaimed && (
                      <Button
                        onClick={claimQuest}
                        bgGradient="linear(to-l, #7928CA, #FF0080)"
                        color="white"
                        _hover={{
                          bgGradient: 'linear(to-l, #7928CA, #FF0080)',
                        }}
                        _active={{
                          bgGradient: 'linear(to-l, #7928CA, #FF0080)',
                        }}
                        isLoading={claiming}
                        loadingText="Please wait"
                      >
                        Claim Victory
                      </Button>
                    )}
                    {claimCode && (
                      <>
                        <Text
                          fontWeight={'bold'}
                          textAlign={'center'}
                          fontSize={'sm'}
                          rounded={'md'}
                          backgroundColor={'white'}
                        >
                          <InfoIcon /> Copy this code down and send it to the
                          creator of this quest. You won't be able to access it
                          again.
                        </Text>
                        <Tag colorScheme={'purple'} size="lg" fontSize={'4xl'}>
                          {claimCode}
                        </Tag>
                      </>
                    )}
                    {claimNotAllowed && (
                      <Text textAlign={'center'}>
                        Sorry, you aren't allowed to claim this quest. Maybe you
                        already claimed it?
                      </Text>
                    )}
                  </>
                )}
                {data.isFinalCode &&
                  data.victoryFulfillment === 'COLLECT_EMAIL' && (
                    <>
                      <Text>Email collections coming soon.</Text>
                    </>
                  )}
              </Flex>
            </>
          )}
          {data.questDeleted && (
            <>
              <Text textAlign={'center'}>This quest has been disabled.</Text>
            </>
          )}
          {!data.questDeleted && !data.enableQuest && !testMode && (
            <>
              <Text textAlign={'center'}>
                This QR code quest is not active right now. Please try again
                later.
              </Text>
            </>
          )}
        </Box>
      </Flex>
    </Layout>
  )
}

export default QuestSettings

export const SCANNED_CODES_COOKIE_NAME = 'sqrcs'
export const CLAIMED_QUESTS_COOKIE_NAME = 'clquests'
export const COOKIE_DELIMITER = ','
export async function getServerSideProps(ctx: NextPageContext) {
  if (typeof ctx.query.code !== 'string')
    return {
      notFound: true,
    }

  const code = await getCode(ctx.query.code)

  if (!code)
    return {
      notFound: true,
    }

  if (!code.quest) {
    const props: CodePageProps = {
      data: {
        questDeleted: true,
      },
    }
    return { props }
  }

  const scannedCodesCookie = cookie.parse(ctx.req?.headers.cookie || '')[
    SCANNED_CODES_COOKIE_NAME
  ]
  const scannedCodes = new Set(
    scannedCodesCookie?.split(COOKIE_DELIMITER) || []
  )

  const isNewCode = !scannedCodes.has(ctx.query.code)
  scannedCodes.add(ctx.query.code)

  let codesFound = 0
  for (const questCode of code.quest.codes) {
    if (scannedCodes.has(questCode.slug)) codesFound++
  }

  const isFinalCode = codesFound === code.quest.codes.length
  const isFirstCode = codesFound === 1

  const newCodesString = Array.from(scannedCodes).join(COOKIE_DELIMITER)

  // Only set the cookie if the quest is enabled
  if (code.quest.enableQuest)
    setCookieHeader(ctx.res!, SCANNED_CODES_COOKIE_NAME, newCodesString)

  const props: CodePageProps = {
    data: {
      questDeleted: false,
      slug: code.slug,
      isNewCode,
      codesFound,
      totalCodes: code.quest.codes.length,
      questClaimed: false,
      enableConfetti: code.quest.enableConfetti,
      note: code.note,
      isFinalCode,
      isFirstCode,
      victoryFulfillment: code.quest.victoryFulfillment,
      enableQuest: code.quest.enableQuest,
      completionNote: isFinalCode ? code.quest.completionNote : null,
    },
  }

  return { props }
}
