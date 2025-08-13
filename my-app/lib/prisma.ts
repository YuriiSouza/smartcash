import { PrismaClient } from "./generated/prisma"

const globalForPrisma = global as unknown as { prisma: PrismaClient | undefined }

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

<<<<<<< HEAD
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
=======
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
>>>>>>> 9b85b48 (feat: create profile page)
