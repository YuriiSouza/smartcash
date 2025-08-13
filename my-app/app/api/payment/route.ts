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

  const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACESS_TOKEN || '' });
  const payment = new Payment(client);

  try {
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
      additional_info: {
        items: itemsPayment,
        shipments: {
          receiver_address: {
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
