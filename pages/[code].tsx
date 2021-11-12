import type { NextPage, NextPageContext } from 'next'
import Layout from 'components/Layout'
import Meta from 'components/Meta'
import { useRouter } from 'next/router'
import { chakra, Heading, Skeleton, SkeletonText } from '@chakra-ui/react'
import getCode from 'lib/getCode'
import cookie from 'cookie'
import { useEffect, useRef } from 'react'
import ConfettiGenerator from 'confetti-js'

interface CodePageProps {
  data: {
    questDeleted: true
  } | {
    questDeleted: false
    slug: string
    isNewCode: boolean
    codesFound: number
    totalCodes: number
    questClaimed: boolean
    enableConfetti: boolean
  }
}

const QuestSettings: NextPage<CodePageProps> = ({
  data
}) => {
  const confettiCanvasRef = useRef<HTMLCanvasElement>(null)
  const router = useRouter()

  useEffect(() => {
    if (!data.questDeleted && data.enableConfetti) {
      const confetti = new ConfettiGenerator({
        target: confettiCanvasRef.current,
        max: '300',
        size: '1',
        animate: true,
        props: ['circle', 'square', 'triangle', 'line'],
        colors: [
          [165, 104, 246],
          [230, 61, 135],
          [0, 199, 228],
          [253, 214, 126]
        ],
        clock: '20',
        rotate: true,
        start_from_edge: false,
        respawn: true
      })
      confetti.render()

      return () => {
        confetti.clear()
      }
    }

  }, [])

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
          zIndex: -1
        }}
      />
      {/* {data.questClaimed && 'You have already claimed this quest.'} */}
      {!data.questDeleted && <>
        You found {data.codesFound} out of {data.totalCodes} codes!
      </>}
    </Layout>
  )
}

export default QuestSettings

const SCANED_CODES_COOKIE_NAME = 'sqrcs'
const CLAIMED_QUESTS_COOKIE_NAME = 'clquests'
const COOKIE_DELIMITER = ','
export async function getServerSideProps(ctx: NextPageContext) {
  if (typeof ctx.query.code !== 'string')
    return {
      notFound: true,
    }

  const code = await getCode(ctx.query.code)

  if (!code) return {
      notFound: true,
    }

  if (!code.quest) {
    const props: CodePageProps = {
      data: {
        questDeleted: true
      }
    }
    return { props }
  }

  const scannedCodesCookie = cookie.parse(ctx.req?.headers.cookie || '')[
    SCANED_CODES_COOKIE_NAME
  ]
  const scannedCodes = new Set(
    scannedCodesCookie?.split(COOKIE_DELIMITER) || []
  )

  const isNewCode= !scannedCodes.has(ctx.query.code)
  scannedCodes.add(ctx.query.code)

  let codesFound = 0
  for (const questCode of code.quest.codes) {
    if (scannedCodes.has(questCode.slug)) codesFound++
  }

  const newCodesString = Array.from(scannedCodes).join(COOKIE_DELIMITER)
  ctx.res?.setHeader('Set-Cookie', [
    SCANED_CODES_COOKIE_NAME + '=' + newCodesString,
  ])

  const props: CodePageProps = {
    data: {
      questDeleted: false,
      slug: code.slug,
      isNewCode,
      codesFound,
      totalCodes: code.quest.codes.length,
      questClaimed: false,
      enableConfetti: code.quest.enableConfetti
    }
  }

  return { props }
}
