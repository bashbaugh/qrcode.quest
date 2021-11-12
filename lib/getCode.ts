import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function getCode(slug: string) {
  return await prisma.code.findUnique({
    where: {
      slug,
    },
    include: {
      quest: {
        include: {
          codes: true,
        },
      },
    },
  })
}
