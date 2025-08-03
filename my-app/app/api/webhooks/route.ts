import { MercadoPagoConfig, Payment } from 'mercadopago'; // Import Payment to fetch payment details
import prisma from '@/lib/prisma';
import { sendSimpleMessage } from '@/lib/emailService';
import path from 'path';
import fs from "fs/promises"; // Importe o módulo 'fs'
import { PDFDocument, rgb } from "pdf-lib"; // Importe PDFDocument e rgb

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
          id: externalReference, // Busca a compra pelo mercadoPagoId
        },
        include: {
          user: { // Inclui os dados do usuário que fez a compra
            select: {
              id: true,
              firstName: true,
              email: true, // Para garantir que temos o email do usuário
            },
          },
          purchaseItems: { // Inclui os itens da compra
            include: {
              product: { // Para cada item, inclui os detalhes do produto
                select: {
                  id: true,
                  title: true,
                  fileUrl: true,
                  // Inclua outras propriedades do produto que você precisar
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
      if (status === 'approved' && purchase.status !== 'approved' && !purchase.emailSent) {
        await prisma.purchase.update({
          where: { id: purchase.id },
          data: {
            status: 'approved',
            mercadoPagoId: paymentId,
          },
        });

        // --- 3. Enviar o E-mail com o Produto ---
        const productLinks = purchase.purchaseItems.map(item => `- ${item.product.title}: ${item.product.fileUrl}`).join('\n');

        const htmlContent = `
          <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
            <html xmlns="http://www.w3.org/1999/xhtml">
            <head>
              <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
              <title>Seus Produtos Digitais Smartcash - Pedido Confirmado!</title>
              <style type="text/css">
                body { margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4; }
                table { border-collapse: collapse; }
                img { border: 0; display: block; }
                a { text-decoration: none; color: #8B5CF6; }
                @media only screen and (max-width: 600px) {
                  .container { width: 100% !important; }
                  .header-text { font-size: 24px !important; line-height: 30px !important; }
                  .content-padding { padding: 20px !important; }
                }
              </style>
            </head>
            <body style="margin: 0; padding: 0; background-color: #f4f4f4;">
              <center>
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;">
                  <tr>
                    <td align="center" style="padding: 20px 0;">
                      <table border="0" cellpadding="0" cellspacing="0" width="600" class="container" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);">
                        <tr>
                          <td align="center" style="padding: 30px 20px 10px 20px;">
                            <a href="https://www.smartcash.com.br" style="text-decoration: none;">
                              <img src="https://via.placeholder.com/150x60/8B5CF6/FFFFFF?text=Smartcash" alt="Logo da Smartcash" width="150" style="display: block;" />
                            </a>
                          </td>
                        </tr>
                        <tr>
                          <td align="center" class="header-text" style="font-size: 28px; font-weight: bold; color: #333333; padding: 0 20px 20px 20px;">
                            Seu Pedido Smartcash Foi Confirmado!
                          </td>
                        </tr>
                        <tr>
                          <td class="content-padding" style="padding: 0 40px 30px 40px; color: #555555; font-size: 16px; line-height: 24px;">
                            <p style="margin-bottom: 15px;">Olá, ${purchase.user?.firstName}!</p>
                            <p style="margin-bottom: 15px;">Parabéns! Seu pagamento para o pedido **#${purchase.id}** foi confirmado com sucesso. Agradecemos a sua confiança na Smartcash.</p>
                            <p style="margin-bottom: 25px;">Seus produtos digitais estão **anexados a este e-mail** e prontos para serem acessados. Esperamos que eles ajudem você a alcançar seus objetivos financeiros!</p>
                            <p style="font-weight: bold; margin-bottom: 10px;">Detalhes do Pedido:</p>
                            <ul style="margin: 0; padding: 0 0 0 20px;">
                              ${purchasedProducts.map(_product => `- ${_product.product.title}`).join('\n')}
                            </ul>
                            <p style="margin-top: 25px;">Se tiver qualquer dúvida ou precisar de ajuda, não hesite em entrar em contato com nosso suporte.</p>
                            <p style="margin-top: 25px;">Atenciosamente,</p>
                            <p style="margin-top: 0; font-weight: bold;">A Equipe Smartcash</p>
                          </td>
                        </tr>
                        <tr>
                          <td align="center" style="padding: 20px 40px; font-size: 12px; color: #aaaaaa; border-top: 1px solid #eeeeee;">
                            <p style="margin-bottom: 5px;">Smartcash &copy; 2025. Todos os direitos reservados.</p>
                            <p style="margin-top: 0;">Visite nosso site: <a href="https://www.smartcash.com.br" style="color: #8B5CF6; text-decoration: underline;">www.smartcash.com.br</a></p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </center>
            </body>
            </html>
        `;

        const textContent = `
            Olá, ${purchase.user?.firstName}!

            Parabéns! Seu pagamento para o pedido #${purchase.id} foi confirmado com sucesso. Agradecemos a sua confiança na Smartcash.

            Seus produtos digitais estão anexados a este e-mail e prontos para serem acessados. Esperamos que eles ajudem você a alcançar seus objetivos financeiros!

            Detalhes do Pedido:
            ${purchasedProducts.map(_product => `- ${_product.product.title}`).join('\n')}

            Se tiver qualquer dúvida ou precisar de ajuda, entre em contato com nosso suporte.

            Atenciosamente,
            A Equipe Smartcash

            Smartcash © 2025. Todos os direitos reservados.
            Visite nosso site: www.smartcash.com.br
        `;

        // Array para armazenar todos os anexos
        const attachments = [];

        // Itera sobre o array de caminhos de arquivo
        for (const item of purchase.purchaseItems) {
          try {
            const filePath = path.join(process.cwd(), 'data', item.product.fileUrl);
            const originalPdfBytes = await fs.readFile(filePath);
            
            // 1. Carrega o PDF com a biblioteca pdf-lib
            const pdfDoc = await PDFDocument.load(originalPdfBytes);
            const pages = pdfDoc.getPages();
            
            // 2. Cria a marca d'água com o email do usuário
            const watermarkText = `Cópia para: ${purchase.user?.id}`;

          for (const page of pages) {
              const { height } = page.getSize();
              // Adiciona um loop para repetir a marca d'água a cada 200px
              for (let y = height; y >= 0; y -= 200) {
                  page.drawText(watermarkText, {
                      x: 20,
                      y: y,
                      size: 12,
                      color: rgb(0.5, 0.5, 0.5),
                      opacity: 0.3,
                  });
              }
            }
            // 3. Salva o PDF modificado em um Buffer
            const modifiedPdfBytes = await pdfDoc.save();

            // 4. Adiciona o Buffer à lista de anexos
            attachments.push({
              data: Buffer.from(modifiedPdfBytes),
              filename: path.basename(filePath),
            });

          } catch (fileError) {
            console.error(`Erro ao processar arquivo para o produto ${item.product.id}:`, fileError);
            // Continua para o próximo item mesmo com erro
          }
        }
        
        // Prepara o conteúdo do e-mail
        const subjective = `Seu Pedido Smartcash #${purchase.id} Foi Confirmado!`;
        const purchasedProductsTitles = purchase.purchaseItems.map(item => `- ${item.product.title}`).join('\n');
        
        

        try {
          sendSimpleMessage(
            purchase.user?.email,
            subjective,
            htmlContent,
            textContent,
            attachments
          )
        } catch {
          console.error('email não foi enviado')
        }

        try {
          await prisma.purchase.update({
            where: { id: purchase.id },
            data: { emailSent: true, emailSentAt: new Date() },
          });
        } catch (emailError) {
          console.error(`Erro ao enviar email para ${purchase.customerEmail}:`, emailError);
          // Você pode querer registrar isso em um sistema de log de erros ou tentar novamente
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

