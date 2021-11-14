// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import cookie from 'cookie'
import getCode from 'lib/getCode'
import { randomInt } from 'lib/util'
import {
  CLAIMED_QUESTS_COOKIE_NAME,
  COOKIE_DELIMITER,
  getCookieData,
  setCookieHeader,
} from 'lib/cookies'

const prisma = new PrismaClient()

export interface ClaimCodeResponse {
  notAllowed?: boolean
  notAllowedReason?: string
  claimCode?: number
}

const returnNotAllowed = (
  res: NextApiResponse<ClaimCodeResponse>,
  reason?: string
) => {
  res.json({
    notAllowed: true,
  })
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ClaimCodeResponse>
) {
  const ua = req.headers['user-agent'] || ''
  const isMobile =
    /Mobi|Android|webOS|iPhone|iPad|iPod|BlackBerry|Opera Mini/i.test(ua)

  if (!isMobile) return returnNotAllowed(res)

  const { scannedCodes, claimedQuests } = getCookieData(req)

  const slug = req.query.slug
  if (typeof slug !== 'string') return returnNotAllowed(res)

  const code = await getCode(slug)

  // Make sure quest exists
  if (!code || !code.quest) return returnNotAllowed(res)

  // Make sure user has all codes
  for (const c of code.quest.codes) {
    if (!scannedCodes.includes(c.slug)) return returnNotAllowed(res)
  }

  // Make sure user has not already claimed quest
  if (claimedQuests.includes(code.quest.slug)) return returnNotAllowed(res)

  const claim = await prisma.claimCode.create({
    data: {
      code: randomInt(0, 99_999),
      claimed: false,
      questId: code.quest.id,
    },
  })

  claimedQuests.push(code.quest.slug)
  setCookieHeader(
    res,
    CLAIMED_QUESTS_COOKIE_NAME,
    claimedQuests.join(COOKIE_DELIMITER)
  )

  res.json({
    claimCode: claim.code,
  })
}
