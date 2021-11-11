// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import { nanoid } from 'nanoid'
import { requireAuth } from 'lib/apiAuth'

const prisma = new PrismaClient()

export interface GetQuestResponse {
  notFound?: false
  quest?: {
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

  const { id } = req.query

  const quest = await prisma.quest.findUnique({
    where: {
      slug: id as string
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
