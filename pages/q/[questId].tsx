import type { NextPage, NextPageContext } from 'next'
import Layout from 'components/Layout'
import Meta from 'components/Meta'
import { useRouter } from 'next/router'
import { Heading } from '@chakra-ui/react'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const QuestSettings: NextPage<{
  quest: {
    id: string,
    name: string
  }
}> = ({ quest }) => {
  const router = useRouter()

  return (
    <Layout>
      <Meta title={quest.name} />
      <Heading>Quest Details</Heading>
      <Heading size="md">{quest.name}</Heading>
    </Layout>
  )
}

export default QuestSettings
