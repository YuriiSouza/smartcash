import { PrismaClient } from '@/lib/generated/prisma';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { v4 as uuidv4 } from 'uuid'; // Para gerar IDs únicos (npm install uuid)


const prisma = new PrismaClient(); // Inicializa o Prisma Client


export async function POST(request: Request) {
  const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACESS_TOKEN || '' });
  const payment = new Payment(client);

  try {

    const reqBody = await request.json();
  
    const idKey = uuidv4();
  
    const {
      productId, // ID do produto que está sendo comprado
      transaction_amount,
      token, // Token do cartão (gerado no frontend pelo MP SDK)
      installments,
      paymentMethodId, // ID do método de pagamento (obtido do frontend)
      issuer,          // ID do emissor (obtido do frontend)
      payer: { email, identification, identificationType, firstName, lastName }, // Dados do pagador
    } = reqBody;
  
    if (!productId || !transaction_amount || !token || !installments || !paymentMethodId || !email || !identification || !identificationType) {
      return new Response(JSON.stringify({ error: 'Dados de pagamento incompletos.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
  
    if (!product || !product.isPublished) {
      return new Response(JSON.stringify({ error: 'Produto não encontrado ou não publicado.' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  
    // Opcional: Verifique se o `transaction_amount` enviado pelo front coincide com o `product.price`
    // Isso previne manipulações de preço no frontend.
    if (Number(transaction_amount) !== Number(product.price)) {
      return new Response(JSON.stringify({ error: 'Valor da transação não corresponde ao preço do produto.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  
    // --- 2. Registrar a Compra no Banco de Dados (Status Pendente) ---
    // Gerar um ID único para a compra que será o external_reference
    const purchaseId = uuidv4();
  
    const newPurchase = await prisma.purchase.create({
      data: {
        id: purchaseId,
        customerEmail: email,
        totalAmount: product.price,
        status: 'pending', // Inicia como pendente
        mercadoPagoId: '', // Será atualizado pelo webhook
        purchaseItems: {
          create: {
            productId: product.id,
            quantity: 1, // Para produto virtual, é 1
            unitPrice: product.price,
          },
        },
      },
    });
  
    // --- 3. Criar Pagamento com Mercado Pago ---
    const paymentBody = {
      transaction_amount: Number(transaction_amount),
      token: token,
      description: product.name, // Descrição do produto
      installments: Number(installments),
      payment_method_id: paymentMethodId,
      issuer_id: issuer ? Number(issuer) : undefined,
      payer: {
        email: email,
        identification: {
          type: identificationType,
          number: identification,
        },
        first_name: firstName,
        last_name: lastName,
      },
      // Chave de idempotência: Garante que a requisição não seja processada mais de uma vez
      request_options: { idempotency_key: purchaseId }, // Usar o ID da compra como idempotencyKey
      // external_reference: para vincular o pagamento à sua compra no banco de dados
      external_reference: purchaseId,
      // URL de notificação para webhooks do Mercado Pago
      notification_url: process.env.MERCADO_PAGO_WEBHOOK_URL,
    };
  
    const mpPaymentResponse = await payment.create({ body: paymentBody });
  
    // --- 4. Atualizar o ID do Pagamento do MP na Compra ---
    await prisma.purchase.update({
      where: { id: newPurchase.id },
      data: {
        mercadoPagoId: mpPaymentResponse.id?.toString(), // Salva o ID do pagamento do MP
        status: mpPaymentResponse.status || 'unknown', // Atualiza status inicial (pode ser 'approved', 'in_process', etc.)
      },
    });
  
    // --- 5. Retornar Sucesso para o Frontend ---
    return new Response(JSON.stringify({
      success: true,
      paymentId: mpPaymentResponse.id,
      status: mpPaymentResponse.status,
      message: 'Pagamento processado com sucesso. Verifique o status para confirmação final.'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Erro ao processar pagamento transparente:', error);
    // Se o erro vier do MP, ele pode ter uma estrutura específica
    let errorMessage = 'Ocorreu um erro desconhecido.';
    if (error.status && error.message) { // Erro do MP SDK
        errorMessage = `Mercado Pago Error (${error.status}): ${error.message}`;
    } else if (error.code) { // Outros erros
        errorMessage = `Erro interno: ${error.message}`;
    }
    return new Response(JSON.stringify({
      error: 'Falha ao processar o pagamento.',
      details: errorMessage
    }), {
      status: error.status || 500, // Usa o status do erro do MP se disponível
      headers: { 'Content-Type': 'application/json' },
    });
  } finally {
    await prisma.$disconnect();
  }
}

// Lida com métodos GET (opcional, retorna 405 se não implementado)
export async function GET(request: Request) {
    return new Response(JSON.stringify({ message: 'GET method not allowed on this endpoint.' }), {
        status: 405,
        headers: {
          'Content-Type': 'application/json',
        },
      });
}
