// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import { nanoid } from 'nanoid'
import { requireAuth } from 'lib/apiAuth'

const prisma = new PrismaClient()

export type GetQuestResponse = {
  notFound: true 
} | {
  quest: {
    id: string
    name: string
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GetQuestResponse>
) {
  const user = await requireAuth(req, res)
  if (!user) return

  const { slug } = req.body

  const quest = await prisma.quest.findUnique({
    where: {
      slug
    }
  })

  if (!quest || quest.userId !== user.uid) {
    res.json({
      notFound: true
    })
    return
  }

  res.json({
    quest: {
      id: quest.slug,
      name: quest?.name
    },
  })
}
