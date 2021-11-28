// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import { nanoid } from 'nanoid'
import { requireAuth } from 'lib/apiAuth'

const prisma = new PrismaClient()

export interface GetQuestsResponse {
  quests: Array<{
    id: string
    name: string
  }>
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GetQuestsResponse>
) {
  const user = await requireAuth(req, res)
  if (!user) return

  const quests = await prisma.quest.findMany({
    where: {
      userId: user.uid,
    },
    orderBy: {
      createdDate: 'desc',
    },
  })

  res.json({
    quests: quests.map((q) => ({
      id: q.slug,
      name: q.name,
    })),
  })
}
