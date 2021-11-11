// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import { nanoid } from 'nanoid'
import { requireAuth } from 'lib/apiAuth'

const prisma = new PrismaClient()

export interface CreateResponse {
  quest: {
    id: string
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CreateResponse>
) {
  const user = await requireAuth(req, res)
  if (!user) return

  const { name, steps } = req.body

  const quest = await prisma.quest.create({
    data: {
      name,
      slug: nanoid(6),
      user: {
        connectOrCreate: {
          where: { uid: user.uid },
          create: { uid: user.uid }
        }
      },
      codes: {
        createMany: {
          data: new Array(steps).fill(null).map((_) => ({
            slug: nanoid(11),
            scans: 0,
          })),
        },
      },
    },
  })

  res.json({
    quest: {
      id: quest.slug,
    },
  })
}
