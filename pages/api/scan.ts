// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import { nanoid } from 'nanoid'
import { requireAuth } from 'lib/apiAuth'

const prisma = new PrismaClient()

export interface ScanResponse {
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ScanResponse>
) {

  res.json({
    quest: {
      id: quest.slug,
    },
  })
}
