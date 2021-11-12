// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import { nanoid } from 'nanoid'
import { requireAuth } from 'lib/apiAuth'

const prisma = new PrismaClient()

export interface ScanResponse {
  counted: boolean
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ScanResponse>
) {
  const ua = req.headers['user-agent'] || ''
  const isMobile =
    /Mobi|Android|webOS|iPhone|iPad|iPod|BlackBerry|Opera Mini/i.test(ua)

  const slug = req.body.slug
  if (typeof slug !== 'string') return

  if (isMobile) {
    await prisma.code.update({
      where: { slug },
      data: {
        scans: {
          increment: 1
        }
      },
    })

    return res.json({
      counted: true,
    })
  }

  res.json({
    counted: false,
  })
}
