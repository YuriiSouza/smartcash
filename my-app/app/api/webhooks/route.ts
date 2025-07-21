import { MercadoPagoConfig, Payment } from 'mercadopago'; // Import Payment to fetch payment details
import { PrismaClient } from '@/lib/generated/prisma';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

// Configuração do Nodemailer (use um serviço de email transacional como Resend ou SendGrid em produção)
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,    // ex: 'smtp.resend.com' ou 'smtp.sendgrid.net'
  port: Number(process.env.EMAIL_PORT), // ex: 587
  secure: process.env.EMAIL_SECURE === 'true', // Use 'true' para 465 (SSL), 'false' para 587 (TLS)
  auth: {
    user: process.env.EMAIL_USER,    // Sua chave de API ou usuário SMTP
    pass: process.env.EMAIL_PASS,    // Sua senha de API ou senha SMTP
  },
});

export async function POST(request: Request) {
  try {
    const mpNotification = await request.json();
    console.log('Webhook Mercado Pago Recebido:', mpNotification);

    if (mpNotification.type === 'payment' && mpNotification.data && mpNotification.data.id) {
      const paymentId = mpNotification.data.id;

      // Opcional: Verifique a autenticidade do webhook (assinatura)

      // --- 1. Consultar o status do pagamento no Mercado Pago API
      const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACESS_TOKEN || '' });
      const paymentMP = new Payment(client);
      const paymentDetails = await paymentMP.get({ id: paymentId });

      console.log('Detalhes do pagamento do MP:', paymentDetails);

      const status = paymentDetails.status;
      const externalReference = paymentDetails.external_reference; // O ID da sua compra

      if (!externalReference) {
        console.warn('Webhook: external_reference não encontrado no pagamento do MP.', paymentId);
        return new Response(JSON.stringify({ message: 'No external_reference found' }), { status: 400 });
      }

      // --- 2. Atualizar o Status da Compra no DB ---
      const purchase = await prisma.purchase.findUnique({
        where: { id: externalReference },
        include: { purchaseItems: { include: { product: true } } }, 
      });

      if (!purchase) {
        console.error(`Compra com ID ${externalReference} não encontrada no banco de dados.`);
        return new Response(JSON.stringify({ message: 'Purchase not found' }), { status: 404 });
      }

      // Se o status mudou para aprovado E o email ainda não foi enviado
      if (status === 'approved' && purchase.status !== 'approved' && !purchase.emailSent) {
        await prisma.purchase.update({
          where: { id: purchase.id },
          data: {
            status: 'approved',
            mercadoPagoId: paymentId,
          },
        });

        // --- 3. Enviar o E-mail com o Produto ---
        const productLinks = purchase.purchaseItems.map(item => `- ${item.product.name}: ${item.product.fileUrl}`).join('\n');

        const mailOptions = {
          from: process.env.EMAIL_USER, // Seu e-mail de envio
          to: purchase.customerEmail,
          subject: `Seu produto Smart Cash está disponível!`,
          html: `
            <h1>Obrigado pela sua compra no Smart Cash!</h1>
            <p>Seu pagamento foi confirmado com sucesso.</p>
            <p>Aqui estão os links para acessar seus produtos:</p>
            <pre>${productLinks}</pre>
            <p>Se tiver qualquer dúvida, entre em contato conosco.</p>
            <p>Atenciosamente,<br>Equipe Smart Cash</p>
          `,
        };

        try {
          await transporter.sendMail(mailOptions);
          await prisma.purchase.update({
            where: { id: purchase.id },
            data: { emailSent: true, emailSentAt: new Date() },
          });
          console.log(`Email de produto enviado para ${purchase.customerEmail} para compra ${purchase.id}`);
        } catch (emailError) {
          console.error(`Erro ao enviar email para ${purchase.customerEmail}:`, emailError);
          // Você pode querer registrar isso em um sistema de log de erros ou tentar novamente
        }

      } else if (status !== 'approved' && purchase.status !== status) {
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
  } finally {
    await prisma.$disconnect();
  }
}