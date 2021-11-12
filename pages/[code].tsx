import type { NextPage, NextPageContext } from 'next'
import Layout from 'components/Layout'
import Meta from 'components/Meta'
import { useRouter } from 'next/router'
import { Heading, Skeleton, SkeletonText } from '@chakra-ui/react'
import getCode from 'lib/getCode'
import cookie from 'cookie'

interface CodePageProps {
  code: {
    slug: string
    isNew: boolean
  }
  codesFound: number
  totalCodes: number
  questClaimed: boolean
}

const QuestSettings: NextPage<CodePageProps> = ({ code, codesFound, totalCodes, questClaimed }) => {
  const router = useRouter()

  return (
    <Layout>
      <Meta title={'You found a secret code'} />
      {questClaimed && 'You have already claimed this quest.'}
      You found {codesFound} out of {totalCodes} codes!
    </Layout>
  )
}

export default QuestSettings

const SCANED_CODES_COOKIE_NAME = 'sqrcs'
const CLAIMED_QUESTS_COOKIE_NAME='cquests'
const COOKIE_DELIMITER = ','
export async function getServerSideProps (ctx: NextPageContext) {
  if (typeof ctx.query.code !== 'string') return {
    notFound: true
  }

  const code = await getCode(ctx.query.code)

  if (!code) return {
    notFound: true
  }

  const scannedCodesCookie = cookie.parse(ctx.req?.headers.cookie || '')[SCANED_CODES_COOKIE_NAME]
  const scannedCodes = new Set(scannedCodesCookie?.split(COOKIE_DELIMITER) || [])

  const isNew = !scannedCodes.has(ctx.query.code)
  scannedCodes.add(ctx.query.code)

  let codesFound = 0
  for (const questCode of code.quest.codes) {
    if (scannedCodes.has(questCode.slug)) codesFound ++
  }

  const newCodesString = Array.from(scannedCodes).join(COOKIE_DELIMITER)
  ctx.res?.setHeader('Set-Cookie', [
    SCANED_CODES_COOKIE_NAME + '=' + newCodesString, 
  ])

  const props: CodePageProps = {
    code: {
      slug: code.slug,
      isNew
    },
    codesFound,
    totalCodes: code.quest.codes.length,
    questClaimed: true
  }

  return { props }
}
