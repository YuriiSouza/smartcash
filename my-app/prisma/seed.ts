// prisma/seed.ts

import { PrismaClient } from "@/lib/generated/prisma"

const prisma = new PrismaClient()

async function main() {
  console.log(`Start seeding ...`)

  // Exemplo de produto virtual financeiro
  const ebook = await prisma.product.upsert({
    where: { name: 'E-book: Primeiros Passos em Investimentos' },
    update: {},
    create: {
      name: 'E-book: Primeiros Passos em Investimentos',
      description: 'Um guia completo para iniciantes no mundo dos investimentos. Aprenda o básico de renda fixa e variável.',
      price: 49.90, // Use Decimal, não int
      fileUrl: 'https://seusmartcash.com.br/downloads/ebook_investimentos_iniciantes.pdf', // URL REAL do arquivo
      isPublished: true,
    },
  })

  const planilha = await prisma.product.upsert({
    where: { name: 'Planilha de Controle Financeiro Pessoal' },
    update: {},
    create: {
      name: 'Planilha de Controle Financeiro Pessoal',
      description: 'Uma planilha intuitiva para organizar suas finanças, registrar gastos e planejar seu orçamento.',
      price: 29.90,
      fileUrl: 'https://seusmartcash.com.br/downloads/planilha_controle_financeiro.xlsx', // URL REAL do arquivo
      isPublished: true,
    },
  })

  console.log(`Seeding finished.`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })