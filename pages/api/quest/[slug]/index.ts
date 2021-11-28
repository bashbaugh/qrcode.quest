// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { Code, PrismaClient, Quest } from '@prisma/client'
import { requireAuth } from 'lib/apiAuth'
import { getQrCode } from 'lib/qr'

const prisma = new PrismaClient()

export interface GetQuestResponse {
  notFound?: true
  quest?: {
    id: string
    name: string
    enableConfetti: boolean
    completionNote: string
    enableQuest: boolean
    victoryFulfillment: Quest['victoryFulfillment']
    completionsCount: number
    codes: Array<{
      slug: string
      scans: number
      image: string
      name: string | null
      note: string | null
      url: string
    }>
    claimCodes: Array<{
      id: number
      claimed: boolean
      code: number
    }>
    claimEmails: Array<{
      email: string
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
      codes: {
        orderBy: {
          order: 'asc',
        },
      },
      claimCodes: true,
      claimEmails: true,
    },
  })

  if (!quest || quest.userId !== user.uid) {
    // TODO 404
    res.json({
      notFound: true,
    })
    return
  }

  const makeUrl = (slug: string) =>
    process.env.NODE_ENV === 'development'
      ? `http://localhost:3000/${slug}`
      : `https://qrcode.quest/${slug}`

  // TODO more QR code options
  const images = await Promise.all(
    quest.codes.map((c) => getQrCode(makeUrl(c.slug)))
  )

  const codes = quest.codes.map((c, i) => ({
    slug: c.slug,
    scans: c.scans,
    image: images[i],
    name: c.name,
    note: c.note,
    url: makeUrl(c.slug),
  }))

  res.json({
    quest: {
      id: quest.slug,
      name: quest.name,
      enableConfetti: quest.enableConfetti,
      completionNote: quest.completionNote,
      codes,
      victoryFulfillment: quest.victoryFulfillment,
      enableQuest: quest.enableQuest,
      completionsCount: quest.completionsCount,
      claimCodes: quest.claimCodes.map((c) => ({
        id: c.id,
        code: c.code,
        claimed: c.claimed,
      })),
      claimEmails: quest.claimEmails.map((e) => ({
        email: e.email,
      })),
    },
  })
}
