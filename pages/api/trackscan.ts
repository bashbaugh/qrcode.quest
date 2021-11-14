// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import { nanoid } from 'nanoid'
import { requireAuth } from 'lib/apiAuth'
import cookie from 'cookie'
import { getCookieData } from 'lib/cookies'

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

  const { slug, completed } = req.body
  if (typeof slug !== 'string') return

  if (isMobile) {
    const code = await prisma.code.update({
      where: { slug },
      data: {
        scans: {
          increment: 1,
        },
      },
      include: {
        quest: {
          include: {
            codes: {
              select: {
                slug: true,
              },
            },
          },
        },
      },
    })

    let hasAllCodes = true
    const { scannedCodes } = getCookieData(req)
    // Make sure user has all codes
    for (const c of code.quest!.codes) {
      if (!scannedCodes.includes(c.slug)) hasAllCodes = false
    }

    // Track if the user just completed the quest.
    if (hasAllCodes && completed)
      await prisma.quest.update({
        where: { id: code.quest!.id },
        data: {
          completionsCount: {
            increment: 1,
          },
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
