import prisma from '@/lib/prisma';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid'; // Para gerar IDs únicos (npm install uuid)

export async function POST(request: Request) {
  const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACESS_TOKEN || '' });
  const payment = new Payment(client);

  try {
    const reqBody = await request.json();
  
    const {
      customerInfo: { 
        email,
        firstName,
        lastName,
        phone,
        cpf,
        zipCode,
        address,
        city,
        state, 
      },
      cartItems,
      paymentMethod, // ID do método de pagamento (obtido do frontend)
      transaction_amount,
      mercadoPagoData          // ID do emissor (obtido do frontend)
    } = reqBody;

    const productIdsInCart: string[] = cartItems.map((item: { productId: string }) => item.productId);

    const _cartItems = cartItems.map(
      (item: { 
        productId: string ,
        unitPrice: string,
        quantity: string,
        }) => {
        return {
          productId: item.productId,
          unitPrice: parseFloat(item.unitPrice),
          quantity: parseInt(item.quantity)
        }
      }
    );


    if (!productIdsInCart) {
      return new Response(JSON.stringify({ error: 'Ids não enviados.' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    let user = await prisma.user.findUnique({
      where: {
        cpf: cpf
      }
    })

    if(!user) {
      user = await prisma.user.create({
        data: {
          email: email,
          cpf: cpf,
          firstName: firstName,
          lastName: lastName,
          phone: phone,
          zipCode: zipCode,
          address: address,
          city: city,
          state: state
        }
      })
    }

    const product = await prisma.product.findMany({
      where: { 
        id: {
          in: productIdsInCart
        },
        isPublished: true
      }
    });
  
    
    if (!product) {
      return new Response(JSON.stringify({ error: 'Produto não encontrado ou não publicado.' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  
    let totalProductPrice: number;

    if (paymentMethod === "pix") {
      let subtotalInCents = product.reduce((sum: number, item: { price: number }) => {
        return sum + item.price;
      }, 0);

      totalProductPrice = subtotalInCents * 0.9;
    } else {
      totalProductPrice = product.reduce((sum: number, item: { price: number }) => {
        return sum + item.price;
      }, 0);
    }

    const totalProductPriceFormatted = (totalProductPrice).toFixed(2);
    const totalProductPriceFloat = parseFloat(totalProductPriceFormatted);
    const _transaction_amount = parseFloat(transaction_amount.toFixed(2))


    if (Number(_transaction_amount) !== Number(totalProductPriceFloat)) {
      return new Response(JSON.stringify({ error: 'Valor da transação não corresponde ao preço do produto.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  
    // --- 2. Registrar a Compra no Banco de Dados (Status Pendente) ---
    const newPurchase = await prisma.purchase.create({
      data: {
        customerEmail: email,
        totalAmount: totalProductPriceFloat,
        status: 'pending', // Inicia como pendente
        mercadoPagoId: '', // Será atualizado pelo webhook
        purchaseItems: {
          createMany: {
            data: _cartItems
          }
        },
        userId: user.id
      },
    });

    const itemsPayment = product.map((item) => {
      return {
        category_id: item.categoryId,
        description: item.description,
        id: item.id,
        quantity: 1,
        title: item.title,
        unit_price: item.price
      }
    })
  
    // --- 3. Criar Pagamento com Mercado Pago ---
    const paymentBody = {
      transaction_amount: Number(totalProductPriceFloat), // Total da compra, já calculado e ajustado
      token: mercadoPagoData.token, // Token do cartão (será undefined para PIX)
      description: `Compra de produtos SmartCash - Pedido #${newPurchase.id}`, // Descrição genérica da compra
      installments: mercadoPagoData?.installments ? Number(mercadoPagoData.installments) : 1, // Número de parcelas (padrão 1 se não houver)
      payment_method_id: mercadoPagoData?.payment_method_id || paymentMethod, // Método de pagamento (ID do MP ou "pix"/"credit")
      issuer_id: mercadoPagoData?.issuer_id ? Number(mercadoPagoData.issuer_id) : undefined, // ID do emissor do cartão

      payer: {
        email: email,
        first_name: firstName,
        last_name: lastName,
        identification: {
          type: 'CPF', // Tipo de documento
          number: cpf, // Número do CPF
        },
        phone: {
          area_code: phone.substring(1, 3), // Extrai o DDD do telefone (ex: (11) 9999-9999 -> 11)
          number: phone.substring(phone.indexOf(")") + 2).replace(/-/g, '') // Extrai o número e remove o hífen
        },
        address: {
          street_name: address.split(',')[0]?.trim() || '', // Pega a rua antes da vírgula
          street_number: address.split(',')[1]?.trim() || '0', // Pega o número depois da vírgula
          zip_code: zipCode,
        }
      },

      external_reference: newPurchase.id,
      notification_url: "https://seusite.com.br/api/webhooks/mercadopago",

      additional_info: {
        items: itemsPayment,
        shipments: {
          receiver_address: {
            zip_code: '75070580',
            state_name: 'GO',
            city_name: 'Anápolis',
            street_name: 'Av. Xavantina Qd1 Lt3',
          }
        }
      }
    };

    const requestOptions = {
      idempotencyKey: newPurchase.id
    }

    // Chamada para a SDK do Mercado Pago
    const mpPaymentResponse = await payment.create({body: paymentBody, requestOptions});
  
    // --- 4. Atualizar o ID do Pagamento do MP na Compra ---
    await prisma.purchase.update({
      where: { id: newPurchase.id },
      data: {
        mercadoPagoId: mpPaymentResponse.id?.toString(), // Salva o ID do pagamento do MP
        status: mpPaymentResponse.status || 'unknown', // Atualiza status inicial (pode ser 'approved', 'in_process', etc.)
      },
    });

  
    // --- 5. Retornar Sucesso para o Frontend ---
    if (paymentMethod === 'pix') {
      return NextResponse.json(
        {
          success: true, // PIX é considerado 'sucesso' porque o QR Code foi gerado
          paymentId: mpPaymentResponse.id,
          status: mpPaymentResponse.status, // Geralmente 'pending' para PIX inicial
          qrCode: mpPaymentResponse.point_of_interaction?.transaction_data?.qr_code,
          qrCodeBase64: mpPaymentResponse.point_of_interaction?.transaction_data?.qr_code_base64,
          purchaseId: newPurchase.id, // O ID da sua compra interna
          message: 'Pagamento PIX gerado com sucesso. Use o código para finalizar a compra.',
        },
        { status: 200 }
      );
    } else { // Método de pagamento é 'credit' (cartão)
      if (mpPaymentResponse.status === 'approved') {
        return NextResponse.json(
          {
            success: true, // Cartão aprovado é sucesso
            paymentId: mpPaymentResponse.id,
            status: mpPaymentResponse.status,
            purchaseId: newPurchase.id,
            message: 'Pagamento com cartão aprovado.',
          },
          { status: 200 }
        );
      } else {
        // Para status 'rejected', 'in_process', 'pending' (se MP retornar para cartão)
        return NextResponse.json(
          {
            success: false, // Indica que a transação não foi aprovada imediatamente
            paymentId: mpPaymentResponse.id,
            status: mpPaymentResponse.status,
            purchaseId: newPurchase.id,
            message: `Pagamento não aprovado. Motivo: ${mpPaymentResponse.status_detail || mpPaymentResponse.status}.`,
          },
          { status: 200 } // Status HTTP 200 para indicar que a API respondeu, mas o pagamento não aprovou
                          // Poderia ser 400 ou 402, mas 200 é comum se a rejeição é "parte do fluxo".
        );
      }
    }

  } catch (error: any) {
    console.error('Erro ao processar pagamento transparente:', error);
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
