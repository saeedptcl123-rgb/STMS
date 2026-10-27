import { PrismaClient } from '@prisma/client'

const databaseUrl = [
  process.env.DATABASE_URL_POOLED,
  process.env.DATABASE_URL,
  process.env.POSTGRES_PRISMA_URL,
  process.env.POSTGRES_URL,
  process.env.PRISMA_DATABASE_URL,
  process.env.DATABASE_URL_UNPOOLED,
].find((url) => url && /^postgres(ql)?:\/\//i.test(url))

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient(
    databaseUrl ? { datasources: { db: { url: databaseUrl } } } : undefined
  )

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
