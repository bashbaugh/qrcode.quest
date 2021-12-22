// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import { requireAuth } from 'lib/api/auth'

const prisma = new PrismaClient()

export interface UpdateQuestResponse {
  updated?: boolean
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UpdateQuestResponse>
) {
  const user = await requireAuth(req, res)
  if (!user) return

  const quest = await prisma.quest.findUnique({
    where: {
      slug: req.query.slug as string,
    },
  })

  if (!quest || quest.userId !== user.uid) {
    res.status(400).send('Not found' as any)
    return
  }

  const {
    name,
    enableConfetti,
    completionNote,
    victoryFulfillment,
    enableQuest,
  } = req.body.newData

  await prisma.quest.update({
    where: {
      id: quest.id,
    },
    data: {
      name,
      enableConfetti,
      completionNote,
      enableQuest,
      victoryFulfillment,
    },
  })

  res.json({
    updated: true,
  })
}
