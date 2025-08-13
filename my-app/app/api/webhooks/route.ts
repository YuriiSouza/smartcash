import { MercadoPagoConfig, Payment } from 'mercadopago'; // Import Payment to fetch payment details
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const mpNotification = await request.json();

    if (mpNotification.type === 'payment' && mpNotification.data && mpNotification.data.id) {
      const paymentId = mpNotification.data.id;

      // Opcional: Verifique a autenticidade do webhook (assinatura)

      // --- 1. Consultar o status do pagamento no Mercado Pago API
      const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACESS_TOKEN || '' });
      const paymentMP = new Payment(client);
      const paymentDetails = await paymentMP.get({ id: paymentId });

      const status = paymentDetails.status;
      const externalReference = paymentDetails.external_reference; // O ID da sua compra

      console.log(status)

      if (!externalReference) {
        console.warn('Webhook: external_reference não encontrado no pagamento do MP.', paymentId);
        return new Response(JSON.stringify({ message: 'No external_reference found' }), { status: 400 });
      }

      // --- 2. Atualizar o Status da Compra no DB ---
     const purchase = await prisma.purchase.findUnique({
        where: {
          id: externalReference,
        },
        include: {
          user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
          },
          purchaseItems: {
            include: {
              product: {
                select: {
                  id: true,
                  title: true,
                  fileUrl: true,
                },
              },
            },
          },
        },
      });

      
      if (!purchase) {
        console.error(`Compra com ID ${externalReference} não encontrada no banco de dados.`);
        return new Response(JSON.stringify({ message: 'Purchase not found' }), { status: 404 });
      }

      
      const purchasedProducts = purchase.purchaseItems;

      // Se o status mudou para aprovado E o email ainda não foi enviado
      if (status === 'pending' && purchase.status !== 'approved') {
        await prisma.purchase.update({
          where: { id: purchase.id },
          data: {
            status: 'pending',
            mercadoPagoId: paymentId,
          },
        });

        const userId = purchase.user?.id; // Lembre-se de corrigir o include para pegar o user

        if (userId) {
          // Mapeia os itens comprados para criar os objetos que serão inseridos
          const productAccessData = purchase.purchaseItems.map(item => ({
            userId: userId,
            productId: item.productId,
          }));

          // Usa uma transação para garantir que todos os produtos sejam adicionados
          await prisma.$transaction(
            productAccessData.map(data =>
              prisma.productAccess.create({
                data,
              })
            )
          );
        }

      } else if (status !== 'pending' && purchase.status !== status) {
        // Atualiza status para outros casos (rejected, refunded, etc.)
        await prisma.purchase.update({
          where: { id: purchase.id },
          data: { status: status },
        });
      }

    }

    return new Response(JSON.stringify({ message: 'Webhook processado' }), { status: 200 });

  } catch (error: any) {
    console.error('Erro no processamento do webhook do Mercado Pago:', error);
    return new Response(JSON.stringify({ error: 'Erro interno do servidor.' }), { status: 500 });
  }
}

