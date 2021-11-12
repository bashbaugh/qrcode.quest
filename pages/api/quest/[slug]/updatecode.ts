// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import { requireAuth } from 'lib/apiAuth'

const prisma = new PrismaClient()

export interface UpdateQuestCodeResponse {
  success?: boolean
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UpdateQuestCodeResponse>
) {
  const user = await requireAuth(req, res)
  if (!user) return

  const slug: string = req.body.slug

  const code = await prisma.code.findUnique({
    where: {
      slug,
    },
    include: {
      quest: true,
    },
  })

  if (
    !code ||
    !code.quest ||
    code.quest.slug !== req.query.slug ||
    code.quest.userId !== user.uid
  ) {
    res.status(400).send('Not found' as any)
    return
  }

  const { name, note }: { name?: string; note?: string } = req.body.newData

  await prisma.code.update({
    where: {
      id: code.id,
    },
    data: {
      name,
      note,
    },
  })

  res.json({
    success: true,
  })
}