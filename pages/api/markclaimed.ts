// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import { nanoid } from 'nanoid'
import { requireAuth } from 'lib/api/auth'
import { getQrCode } from 'lib/api/qr'

const prisma = new PrismaClient()

export interface MarkClaimResponse {
  success: true
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<MarkClaimResponse>
) {
  const user = await requireAuth(req, res)
  if (!user) return

  const { codeId } = req.body

  const claimCode = await prisma.claimCode.findUnique({
    where: {
      id: codeId,
    },
    include: {
      quest: {
        select: {
          userId: true,
        },
      },
    },
  })

  console.log(claimCode, user.uid)

  if (!claimCode?.quest?.userId || claimCode?.quest?.userId !== user.uid) return

  await prisma.claimCode.update({
    where: { id: claimCode.id },
    data: {
      claimed: true,
    },
  })

  res.json({
    success: true,
  })
}
