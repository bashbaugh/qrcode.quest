// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import { nanoid } from 'nanoid'
import { requireAuth } from 'lib/apiAuth'
import { getQrCode } from 'lib/qr'

const prisma = new PrismaClient()

export interface GetQuestResponse {
  notFound?: true
  quest?: {
    id: string
    name: string
    codes: Array<{
      slug: string
      scans: number
      image: string
      name: string | null
      note: string | null
      url: string
    }>
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GetQuestResponse>
) {
  const user = await requireAuth(req, res)
  if (!user) return

  const id = req.query.slug

  const quest = await prisma.quest.findUnique({
    where: {
      slug: id as string,
    },
    include: {
      codes: true,
    },
  })

  if (!quest || quest.userId !== user.uid) {
    res.json({
      notFound: true,
    })
    return
  }

  const images = await Promise.all(quest.codes.map((c) => getQrCode(c.slug)))

  const codes = quest.codes.map((c, i) => ({
    slug: c.slug,
    scans: c.scans,
    image: images[i],
    name: c.name,
    note: c.note,
    url:
      process.env.NODE_ENV === 'development'
        ? `http://localhost:3000/${c.slug}`
        : `https://qrcode.quest/${c.slug}`,
  }))

  res.json({
    quest: {
      id: quest.slug,
      name: quest?.name,
      codes,
    },
  })
}
