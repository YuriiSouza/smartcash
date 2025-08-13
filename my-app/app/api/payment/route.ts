<<<<<<< HEAD
import prisma from '@/lib/prisma';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
=======
import { prisma } from '@/lib/prisma';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

type IncomingCustomer = {
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  cpf?: string | null;
  zipCode?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
};

function diffUpdate<T extends Record<string, any>>(incoming: T, current: Record<string, any>) {
  const out: Record<string, any> = {};
  (Object.keys(incoming)).forEach((k) => {
    const v = incoming[k];
    if (v !== undefined && v !== current[k]) out[k as string] = v;
  });
  return out;
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  const sessionEmail = session.user.email;

>>>>>>> 9b85b48 (feat: create profile page)
  const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACESS_TOKEN || '' });
  const payment = new Payment(client);

  try {
<<<<<<< HEAD
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
      notification_url: "https://smartcash-black.vercel.app/api/webhooks",

=======
    const body = await request.json();
    const {
      customerInfo,
      cartItems,
      paymentMethod,
      transaction_amount,
      mercadoPagoData,
    }: {
      customerInfo: IncomingCustomer;
      cartItems: { productId: string; unitPrice: string | number; quantity: string | number }[];
      paymentMethod: 'pix' | 'credit' | string;
      transaction_amount: number;
      mercadoPagoData: any;
    } = body;

    // 1) Carrega o usuário da sessão
    let user = await prisma.user.findUnique({ where: { email: sessionEmail } });
    if (!user) {
      // Normalmente NextAuth sempre terá criado, mas se não, cria o mínimo
      user = await prisma.user.create({
        data: { email: sessionEmail, name: `${customerInfo.firstName ?? ''} ${customerInfo.lastName ?? ''}`.trim() },
      });
    }

    // 2) Atualiza campos do User se mudaram
    const incomingUser = {
      // opcionalmente, atualize name também
      name: [customerInfo.firstName, customerInfo.lastName].filter(Boolean).join(' ') || user.name,
      cpf: customerInfo.cpf ?? user.cpf ?? undefined,
      phone: customerInfo.phone ?? user.phone ?? undefined,
      zipCode: customerInfo.zipCode ?? user.zipCode ?? undefined,
      address: customerInfo.address ?? user.address ?? undefined,
      city: customerInfo.city ?? user.city ?? undefined,
      state: customerInfo.state ?? user.state ?? undefined,
    };
    const patch = diffUpdate(incomingUser, user);
    if (Object.keys(patch).length) {
      try {
        user = await prisma.user.update({ where: { id: user.id }, data: patch });
      } catch (e: any) {
        // cpf é @unique
        if (e?.code === 'P2002') {
          return NextResponse.json({ error: 'CPF já está vinculado a outro usuário.' }, { status: 409 });
        }
        throw e;
      }
    }

    // 3) Validar carrinho/produtos
    const productIds = (cartItems ?? []).map((i) => i.productId);
    if (!productIds.length) return NextResponse.json({ error: 'Ids não enviados.' }, { status: 400 });

    const normalizedItems = cartItems.map((i) => ({
      productId: i.productId,
      unitPrice: Number(i.unitPrice),
      quantity: Number(i.quantity),
    }));

    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, isPublished: true },
    });
    if (!products.length) {
      return NextResponse.json({ error: 'Produto não encontrado ou não publicado.' }, { status: 404 });
    }

    // 4) Calcular total e validar com o enviado
    const sum = products.reduce((acc, p) => acc + Number(p.price || 0), 0);
    const total = paymentMethod === 'pix' ? sum * 0.9 : sum;
    const totalFloat = Number(total.toFixed(2));
    const txAmount = Number(Number(transaction_amount).toFixed(2));
    if (txAmount !== totalFloat) {
      return NextResponse.json({ error: 'Valor da transação não corresponde ao preço do produto.' }, { status: 400 });
    }

    // 5) Criar compra pendente (agora com userId de User)
    const purchase = await prisma.purchase.create({
      data: {
        customerEmail: customerInfo.email ?? sessionEmail,
        totalAmount: totalFloat,
        status: 'pending',
        mercadoPagoId: '',
        purchaseItems: { createMany: { data: normalizedItems } },
        userId: user.id, // 👈 agora é User
      },
    });

    const itemsPayment = products.map((p) => ({
      category_id: p.categoryId,
      description: p.description ?? '',
      id: p.id,
      quantity: 1,
      title: p.title,
      unit_price: Number(p.price),
    }));

    // 6) Criar pagamento no MP
    const paymentBody = {
      transaction_amount: totalFloat,
      token: mercadoPagoData?.token,
      description: `Compra - Pedido #${purchase.id}`,
      installments: mercadoPagoData?.installments ? Number(mercadoPagoData.installments) : 1,
      payment_method_id: mercadoPagoData?.payment_method_id || paymentMethod,
      issuer_id: mercadoPagoData?.issuer_id ? Number(mercadoPagoData.issuer_id) : undefined,
      payer: {
        email: customerInfo.email ?? sessionEmail,
        first_name: customerInfo.firstName ?? undefined,
        last_name: customerInfo.lastName ?? undefined,
        identification: { type: 'CPF', number: customerInfo.cpf ?? undefined },
        phone: {
          area_code: customerInfo.phone ? customerInfo.phone.substring(1, 3) : undefined,
          number: customerInfo.phone
            ? customerInfo.phone.substring(customerInfo.phone.indexOf(')') + 2).replace(/-/g, '')
            : undefined,
        },
        address: {
          street_name: customerInfo.address?.split(',')[0]?.trim() || '',
          street_number: customerInfo.address?.split(',')[1]?.trim() || '0',
          zip_code: customerInfo.zipCode || '',
        },
      },
      external_reference: purchase.id,
      notification_url: 'https://smartcash-black.vercel.app/api/webhooks',
>>>>>>> 9b85b48 (feat: create profile page)
      additional_info: {
        items: itemsPayment,
        shipments: {
          receiver_address: {
<<<<<<< HEAD
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
=======
            zip_code: customerInfo.zipCode || '00000000',
            state_name: customerInfo.state || '',
            city_name: customerInfo.city || '',
            street_name: customerInfo.address?.split(',')[0]?.trim() || '',
          },
        },
      },
    };

    const requestOptions = { idempotencyKey: purchase.id };
    const mp = await payment.create({ body: paymentBody, requestOptions });

    // 7) Atualiza compra com dados do MP
    await prisma.purchase.update({
      where: { id: purchase.id },
      data: {
        mercadoPagoId: mp.id?.toString() || '',
        status: (mp.status as string) || 'unknown',
      },
    });

    // 8) Resposta
    if (paymentMethod === 'pix') {
      return NextResponse.json({
        success: true,
        paymentId: mp.id,
        status: mp.status,
        qrCode: mp.point_of_interaction?.transaction_data?.qr_code,
        qrCodeBase64: mp.point_of_interaction?.transaction_data?.qr_code_base64,
        purchaseId: purchase.id,
        message: 'Pagamento PIX gerado com sucesso. Use o código para finalizar a compra.',
      });
    }
    if (mp.status === 'approved') {
      return NextResponse.json({
        success: true,
        paymentId: mp.id,
        status: mp.status,
        purchaseId: purchase.id,
        message: 'Pagamento com cartão aprovado.',
      });
    }
    return NextResponse.json({
      success: false,
      paymentId: mp.id,
      status: mp.status,
      purchaseId: purchase.id,
      message: `Pagamento não aprovado. Motivo: ${mp.status_detail || mp.status}.`,
    });
  } catch (error: any) {
    console.error('Erro ao processar pagamento:', error);
    const details =
      error?.status && error?.message
        ? `Mercado Pago Error (${error.status}): ${error.message}`
        : error?.code
        ? `Erro interno: ${error.message}`
        : 'Ocorreu um erro desconhecido.';
    return NextResponse.json({ error: 'Falha ao processar o pagamento.', details }, { status: error?.status || 500 });
  }
}
>>>>>>> 9b85b48 (feat: create profile page)
