import { PrismaClient } from "./generated/prisma"

const globalForPrisma = global as unknown as { prisma: PrismaClient | undefined }

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

// Em ambiente de desenvolvimento, a instância é mantida na variável global
// para evitar que o cliente seja recriado em cada hot reload, o que poderia
// causar erros de conexão.
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma