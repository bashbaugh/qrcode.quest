// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import { nanoid } from 'nanoid'
import { requireAuth } from 'lib/apiAuth'

const prisma = new PrismaClient()

export interface DeleteResponse {
  deleted?: boolean
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<DeleteResponse>
) {
  const user = await requireAuth(req, res)
  if (!user) return

  const quest = await prisma.quest.findUnique({
    where: {
      slug: req.query.slug as string,
    },
  })

  if (!quest) {
    res.status(400).send('Not found' as any)
    return
  }

  await prisma.quest.delete({
    where: {
      id: quest.id,
    },
  })

  res.json({
    deleted: true,
  })
}
