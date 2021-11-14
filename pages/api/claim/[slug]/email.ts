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
import { validateEmail } from 'lib/email'

const prisma = new PrismaClient()

export interface EmailClaimResponse {
  notAllowed?: boolean
  claimed?: true
}

const returnNotAllowed = (
  res: NextApiResponse<EmailClaimResponse>,
  reason?: string
) => {
  res.json({
    notAllowed: true,
  })
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<EmailClaimResponse>
) {
  const ua = req.headers['user-agent'] || ''
  const isMobile =
    /Mobi|Android|webOS|iPhone|iPad|iPod|BlackBerry|Opera Mini/i.test(ua)

  if (!isMobile) return returnNotAllowed(res)

  const { scannedCodes, claimedQuests } = getCookieData(req)

  const slug = req.query.slug
  const email = req.body.email
  if (typeof slug !== 'string' || !validateEmail(email))
    return returnNotAllowed(res)

  const code = await getCode(slug)

  // Make sure quest exists
  if (!code || !code.quest) return returnNotAllowed(res)

  // Make sure user has all codes
  for (const c of code.quest.codes) {
    if (!scannedCodes.includes(c.slug)) return returnNotAllowed(res)
  }

  // Make sure user has not already claimed quest
  if (claimedQuests.includes(code.quest.slug)) return returnNotAllowed(res)

  const claim = await prisma.claimEmail.create({
    data: {
      questId: code.quest.id,
      email,
    },
  })

  claimedQuests.push(code.quest.slug)
  setCookieHeader(
    res,
    CLAIMED_QUESTS_COOKIE_NAME,
    claimedQuests.join(COOKIE_DELIMITER)
  )

  res.json({
    claimed: true,
  })
}
