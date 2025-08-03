// prisma/seed.ts
import { PrismaClient } from '../lib/generated/prisma/index.js';
import { v4 as uuidv4 } from 'uuid'; // Para gerar IDs únicos (npm install uuid)

const prisma = new PrismaClient();

async function main() {
  // console.log('Iniciando o seeding...');

  // // 1. Limpar dados existentes (ordem importa devido às relações)
  // await prisma.purchaseItem.deleteMany({});
  // await prisma.purchase.deleteMany({});
  // await prisma.review.deleteMany({}); // Limpa reviews antes de products e users
  // await prisma.productTag.deleteMany({});
  // await prisma.tag.deleteMany({});
  // await prisma.product.deleteMany({});
  // await prisma.category.deleteMany({});
  // await prisma.newsletterSubscriber.deleteMany({});
  // await prisma.user.deleteMany({}); // Limpa usuários por último ou antes de purchases/reviews
  // console.log('Dados antigos deletados.');

  // 2. Criar um Usuário de exemplo
  // const user1 = await prisma.user.create({
  //   data: {
  //     id: uuidv4(),
  //     email: 'joao.silva@example.com',
  //     // Se você tiver passwordHash, adicione um hash real aqui (ex: bcrypt.hash('senha123', 10))
  //     // passwordHash: 'hashed_password_example',
  //     cpf: '111.222.333-44',
  //     firstName: 'João',
  //     lastName: 'Silva',
  //     phone: '(11) 98765-4321',
  //     zipCode: '01000-000',
  //     address: 'Rua Exemplo, 123',
  //     city: 'São Paulo',
  //     state: 'SP',
  //     emailVerified: true,
  //   },
  // });
  // const user2 = await prisma.user.create({
  //   data: {
  //     id: uuidv4(),
  //     email: 'maria.souza@example.com',
  //     cpf: '555.666.777-88',
  //     firstName: 'Maria',
  //     lastName: 'Souza',
  //     phone: '(21) 91234-5678',
  //     zipCode: '20000-000',
  //     address: 'Av. Principal, 456',
  //     city: 'Rio de Janeiro',
  //     state: 'RJ',
  //     emailVerified: true,
  //   },
  // });
  // console.log('Usuários criados.');

  // 3. Criar Categorias
  const categoryFinances = await prisma.category.create({
    data: {
      name: 'Finanças Pessoais'
    },
  });
  const categoryMarketing = await prisma.category.create({
    data: {
      name: 'Marketing Digital'
    },
  });
  const investimentos = await prisma.category.create({
    data: {
      name: 'Investimentos'
    },
  });
  console.log('Categorias criadas.');

  // 4. Criar Tags
  const tagEbook = await prisma.tag.create({ data: {  name: 'Ebook' } });
  const tagPlanilha = await prisma.tag.create({ data: { name: 'Planilha' } });
  const tagInvestimento = await prisma.tag.create({ data: {  name: 'Investimento' } });
  const tagSEO = await prisma.tag.create({ data: {  name: 'SEO' } });
  const tagGestaoTempo = await prisma.tag.create({ data: {  name: 'Gestão de Tempo' } });
  const tagFinancas = await prisma.tag.create({ data: {  name: 'Finanças' } });
  console.log('Tags criadas.');

  // 5. Criar Produtos
  const product1 = await prisma.product.create({
    data: {
      
      title: 'Guia Introdutorio',
      description: 'Entenda o basico dos investimentos e tenha um material para rapida consulta quando tiver dúvidas.',
      price: 10.00,
      originalPrice: 20.00,
      discount: 0.5,
      rating: 4.8,
      reviewsCount: 187,
      type: 'Ebook',
      icon: 'BookOpen', // Apenas o nome do ícone
      categoryId: investimentos.id,
      isPublished: true,
      fileUrl: 'guiaIntrodutorio.pdf'
    },
  });

  const product2 = await prisma.product.create({
    data: {
      
      title: 'Como escolher uma ação.',
      description: 'Entenda os criterios e como escolher a ação que melhor encaixa nos seus planos.',
      price: 45.90,
      originalPrice: 50.00,
      discount: 0.9,
      rating: 4.7,
      reviewsCount: 45,
      type: 'Ebook',
      icon: 'Calculator', // Apenas o nome do ícone
      categoryId: investimentos.id,
      isPublished: true,
      fileUrl: 'comoescolheracao.pdf'
    },
  });

  // const product3 = await prisma.product.create({
  //   data: {
  //     id: uuidv4(),
  //     title: 'Como escolher um FII.',
  //     description: 'Entenda os criterios e como escolher o Fundo Imobiliario que melhor encaixa nos seus planos.',
  //     price: 89.90,
  //     originalPrice: 120.00,
  //     discount: 0.33,
  //     rating: 4.8,
  //     reviewsCount: 200,
  //     type: 'Ebook',
  //     icon: 'Lightbulb', // Apenas o nome do ícone (ou "Kit" se você tiver um componente customizado)
  //     categoryId: investimentos.id,
  //     isPublished: true,
  //     fileUrl: 'comoescolherfundoImobiliario.pdf'
  //   },
  // });
  console.log('Produtos criados.');

  // 6. Conectar Tags aos Produtos (ProductTag)
  await prisma.productTag.createMany({
    data: [
      { productId: product1.id, tagId: tagEbook.id },
      { productId: product1.id, tagId: tagInvestimento.id },
      { productId: product2.id, tagId: tagPlanilha.id },
      { productId: product2.id, tagId: tagFinancas.id },
    ],
  });
  console.log('Tags conectadas aos produtos.');

  // // 7. Criar Avaliações (Reviews) e associá-las a um Usuário
  // await prisma.review.createMany({
  //   data: [
  //     {
  //       id: uuidv4(),
  //       productId: product1.id,
  //       userId: user1.id, // <--- Associado ao user1
  //       rating: 5,
  //       comment: 'Excelente guia, muito didático e prático!',
  //       // reviewerName: 'Ana Silva', // Removido se o schema não tem mais
  //     },
  //     {
  //       id: uuidv4(),
  //       productId: product1.id,
  //       userId: user2.id, // <--- Associado ao user2
  //       rating: 4,
  //       comment: 'Bom conteúdo, mas poderia ter mais exemplos práticos.',
  //       // reviewerName: 'Carlos Souza',
  //     },
  //     {
  //       id: uuidv4(),
  //       productId: product2.id,
  //       userId: user1.id, // <--- Associado ao user1
  //       rating: 5,
  //       comment: 'A planilha mudou minha vida financeira!',
  //       // reviewerName: 'Bia Lima',
  //     },
  //   ],
  // });
  // console.log('Avaliações criadas e associadas a usuários.');

  // 8. Criar uma compra de exemplo e associá-la a um Usuário
//   const purchase1 = await prisma.purchase.create({
//     data: {
//       id: uuidv4(),
//       userId: user1.id, // <--- Associado ao user1
//       customerEmail: user1.email, // Opcional, se o userId for o principal
//       totalAmount: product1.price + product2.price,
//       mercadoPagoId: 'MP-1234567890', // ID de exemplo, será atualizado por webhook real
//       status: 'approved', // Status de exemplo para um pedido já pago
//     },
//   });

//   await prisma.purchaseItem.createMany({
//     data: [
//       {
//         id: uuidv4(),
//         purchaseId: purchase1.id,
//         productId: product1.id,
//         quantity: 1,
//         unitPrice: 22.9, // Converte Float para Decimal para unitPrice
//       },
//       {
//         id: uuidv4(),
//         purchaseId: purchase1.id,
//         productId: product2.id,
//         quantity: 1,
//       unitPrice: 36.9,
//       },
//     ],
//   });
//   console.log('Compra de exemplo criada e associada a usuário.');

//   // 9. Criar um subscriber de newsletter
//   await prisma.newsletterSubscriber.create({
//     data: {
//       id: uuidv4(),
//       email: 'newsletter.test@example.com',
//     },
//   });
//   console.log('Assinante de newsletter criado.');


//   console.log('Seeding concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });