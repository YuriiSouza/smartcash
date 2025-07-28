// prisma/seed.ts
import { PrismaClient } from '../lib/generated/prisma/index.js';
import { v4 as uuidv4 } from 'uuid'; // Para gerar IDs únicos (npm install uuid)

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando o seeding...');

  // 1. Limpar dados existentes (ordem importa devido às relações)
  await prisma.purchaseItem.deleteMany({});
  await prisma.purchase.deleteMany({});
  await prisma.review.deleteMany({}); // Limpa reviews antes de products e users
  await prisma.productTag.deleteMany({});
  await prisma.tag.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.newsletterSubscriber.deleteMany({});
  await prisma.user.deleteMany({}); // Limpa usuários por último ou antes de purchases/reviews
  console.log('Dados antigos deletados.');

  // 2. Criar um Usuário de exemplo
  const user1 = await prisma.user.create({
    data: {
      id: uuidv4(),
      email: 'joao.silva@example.com',
      // Se você tiver passwordHash, adicione um hash real aqui (ex: bcrypt.hash('senha123', 10))
      // passwordHash: 'hashed_password_example',
      cpf: '111.222.333-44',
      firstName: 'João',
      lastName: 'Silva',
      phone: '(11) 98765-4321',
      zipCode: '01000-000',
      address: 'Rua Exemplo, 123',
      city: 'São Paulo',
      state: 'SP',
      emailVerified: true,
    },
  });
  const user2 = await prisma.user.create({
    data: {
      id: uuidv4(),
      email: 'maria.souza@example.com',
      cpf: '555.666.777-88',
      firstName: 'Maria',
      lastName: 'Souza',
      phone: '(21) 91234-5678',
      zipCode: '20000-000',
      address: 'Av. Principal, 456',
      city: 'Rio de Janeiro',
      state: 'RJ',
      emailVerified: true,
    },
  });
  console.log('Usuários criados.');

  // 3. Criar Categorias
  const categoryFinances = await prisma.category.create({
    data: {
      id: uuidv4(),
      name: 'Finanças Pessoais'
    },
  });
  const categoryMarketing = await prisma.category.create({
    data: {
      id: uuidv4(),
      name: 'Marketing Digital'
    },
  });
  const categoryProdutividade = await prisma.category.create({
    data: {
      id: uuidv4(),
      name: 'Produtividade'
    },
  });
  console.log('Categorias criadas.');

  // 4. Criar Tags
  const tagEbook = await prisma.tag.create({ data: { id: uuidv4(), name: 'Ebook' } });
  const tagPlanilha = await prisma.tag.create({ data: { id: uuidv4(), name: 'Planilha' } });
  const tagInvestimento = await prisma.tag.create({ data: { id: uuidv4(), name: 'Investimento' } });
  const tagSEO = await prisma.tag.create({ data: { id: uuidv4(), name: 'SEO' } });
  const tagGestaoTempo = await prisma.tag.create({ data: { id: uuidv4(), name: 'Gestão de Tempo' } });
  const tagFinancas = await prisma.tag.create({ data: { id: uuidv4(), name: 'Finanças' } });
  console.log('Tags criadas.');

  // 5. Criar Produtos
  const product1 = await prisma.product.create({
    data: {
      id: uuidv4(),
      title: 'Guia Essencial de Investimentos',
      description: 'Aprenda a investir do zero e faça seu dinheiro render.',
      price: 79.90,
      originalPrice: 120.00,
      discount: 0.334,
      rating: 4.9,
      reviewsCount: 150,
      type: 'Ebook',
      icon: 'BookOpen', // Apenas o nome do ícone
      gradient: 'bg-gradient-to-br from-purple-400 to-blue-500',
      buttonGradient: 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700',
      categoryId: categoryFinances.id,
      isPublished: true,
      fileUrl: 'data/guiaessencialinvestimentos'
    },
  });

  const product2 = await prisma.product.create({
    data: {
      id: uuidv4(),
      title: 'Planilha Mestre de Orçamento Doméstico',
      description: 'Controle suas despesas e receitas de forma prática.',
      price: 39.90,
      originalPrice: 50.00,
      discount: 0.202,
      rating: 4.7,
      reviewsCount: 90,
      type: 'Planilha',
      icon: 'Calculator', // Apenas o nome do ícone
      gradient: 'bg-gradient-to-br from-blue-400 to-teal-500',
      buttonGradient: 'bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700',
      categoryId: categoryFinances.id,
      isPublished: true,
      fileUrl: 'data/guiaessencialinvestimentos'
    },
  });

  const product3 = await prisma.product.create({
    data: {
      id: uuidv4(),
      title: 'Kit Completo de Marketing de Conteúdo',
      description: 'Tudo que você precisa para criar conteúdo que engaja e vende.',
      price: 149.90,
      originalPrice: 200.00,
      discount: 0.250,
      rating: 4.8,
      reviewsCount: 200,
      type: 'KitCompleto',
      icon: 'Lightbulb', // Apenas o nome do ícone (ou "Kit" se você tiver um componente customizado)
      gradient: 'bg-gradient-to-br from-teal-400 to-purple-500',
      buttonGradient: 'bg-gradient-to-r from-teal-600 to-purple-600 hover:from-teal-700 hover:to-purple-700',
      categoryId: categoryMarketing.id,
      isPublished: true,
      fileUrl: 'data/kitcompletomarketing'
    },
  });
  console.log('Produtos criados.');

  // 6. Conectar Tags aos Produtos (ProductTag)
  await prisma.productTag.createMany({
    data: [
      { productId: product1.id, tagId: tagEbook.id },
      { productId: product1.id, tagId: tagInvestimento.id },
      { productId: product2.id, tagId: tagPlanilha.id },
      { productId: product2.id, tagId: tagFinancas.id },
      { productId: product3.id, tagId: tagEbook.id },
      { productId: product3.id, tagId: tagSEO.id },
    ],
  });
  console.log('Tags conectadas aos produtos.');

  // 7. Criar Avaliações (Reviews) e associá-las a um Usuário
  await prisma.review.createMany({
    data: [
      {
        id: uuidv4(),
        productId: product1.id,
        userId: user1.id, // <--- Associado ao user1
        rating: 5,
        comment: 'Excelente guia, muito didático e prático!',
        // reviewerName: 'Ana Silva', // Removido se o schema não tem mais
      },
      {
        id: uuidv4(),
        productId: product1.id,
        userId: user2.id, // <--- Associado ao user2
        rating: 4,
        comment: 'Bom conteúdo, mas poderia ter mais exemplos práticos.',
        // reviewerName: 'Carlos Souza',
      },
      {
        id: uuidv4(),
        productId: product2.id,
        userId: user1.id, // <--- Associado ao user1
        rating: 5,
        comment: 'A planilha mudou minha vida financeira!',
        // reviewerName: 'Bia Lima',
      },
    ],
  });
  console.log('Avaliações criadas e associadas a usuários.');

  // 8. Criar uma compra de exemplo e associá-la a um Usuário
  const purchase1 = await prisma.purchase.create({
    data: {
      id: uuidv4(),
      userId: user1.id, // <--- Associado ao user1
      customerEmail: user1.email, // Opcional, se o userId for o principal
      totalAmount: product1.price + product2.price,
      mercadoPagoId: 'MP-1234567890', // ID de exemplo, será atualizado por webhook real
      status: 'approved', // Status de exemplo para um pedido já pago
    },
  });

  await prisma.purchaseItem.createMany({
    data: [
      {
        id: uuidv4(),
        purchaseId: purchase1.id,
        productId: product1.id,
        quantity: 1,
        unitPrice: 22.9, // Converte Float para Decimal para unitPrice
      },
      {
        id: uuidv4(),
        purchaseId: purchase1.id,
        productId: product2.id,
        quantity: 1,
      unitPrice: 36.9,
      },
    ],
  });
  console.log('Compra de exemplo criada e associada a usuário.');

  // 9. Criar um subscriber de newsletter
  await prisma.newsletterSubscriber.create({
    data: {
      id: uuidv4(),
      email: 'newsletter.test@example.com',
    },
  });
  console.log('Assinante de newsletter criado.');


  console.log('Seeding concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });