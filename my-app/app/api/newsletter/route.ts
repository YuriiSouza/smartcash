// app/api/newsletter/route.ts
import { NextResponse } from "next/server"
import prisma from "@/lib/prisma";
import { sendSimpleMessage } from "@/lib/emailService"


export async function POST(req: Request) {
  const htmlContent = `
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml">
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Bem-vindo à Newsletter da SmartCash!</title>
      <style type="text/css">
        /* Estilos básicos inline */
        body {
          margin: 0;
          padding: 0;
          -webkit-text-size-adjust: 100%;
          -ms-text-size-adjust: 100%;
          font-family: Arial, sans-serif;
          background-color: #f4f4f4;
        }
        table {
          border-collapse: collapse;
          mso-table-lspace: 0pt;
          mso-table-rspace: 0pt;
        }
        img {
          border: 0;
          height: auto;
          line-height: 100%;
          outline: none;
          text-decoration: none;
          -ms-interpolation-mode: bicubic;
        }
        a {
          text-decoration: none;
        }
        /* Estilos responsivos */
        @media only screen and (max-width: 600px) {
          .full-width-image img {
            width: 100% !important;
            height: auto !important;
          }
          .container {
            width: 100% !important;
          }
          .header-text {
            font-size: 24px !important;
            line-height: 30px !important;
          }
          .content-padding {
            padding: 20px !important;
          }
          .button {
            width: 100% !important;
            padding-left: 0 !important;
            padding-right: 0 !important;
          }
          .button a {
            width: 100% !important;
            padding: 15px 0 !important;
          }
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
                    <a href="https://ff1be2520a07.ngrok-free.app" style="text-decoration: none;">
                      <img src="https://via.placeholder.com/150x60/8B5CF6/FFFFFF?text=Smartcash" alt="Logo da Smartcash" width="150" style="display: block;" />
                    </a>
                  </td>
                </tr>
                <tr>
                  <td align="center" class="header-text" style="font-size: 28px; font-weight: bold; color: #333333; padding: 0 20px 20px 20px;">
                    Bem-vindo(a) à Família Smartcash!
                  </td>
                </tr>
                <tr>
                  <td class="content-padding" style="padding: 0 40px 30px 40px; color: #555555; font-size: 16px; line-height: 24px;">
                    <p style="margin-bottom: 15px;">Olá!</p>
                    <p style="margin-bottom: 15px;">Ficamos muito felizes em ter você conosco. Prepare-se para receber dicas exclusivas sobre <strong>educação financeira</strong>, insights valiosos e as últimas novidades da Smartcash, direto na sua caixa de entrada!</p>
                    <p style="margin-bottom: 15px;">Nosso objetivo é te ajudar a conquistar seus objetivos financeiros, de forma simples e prática.</p>
                    <p style="margin-bottom: 25px;">Para começar, que tal conferir alguns dos nossos produtos que podem transformar sua vida financeira?</p>
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;">
                      <tr>
                        <td align="center" style="padding-bottom: 20px;">
                          <table border="0" cellpadding="0" cellspacing="0" style="border-collapse: collapse; border-radius: 6px; background-color: #8B5CF6;">
                            <tr>
                              <td align="center" bgcolor="#8B5CF6" style="padding: 15px 25px; border-radius: 6px;">
                                <a href="https://ff1be2520a07.ngrok-free.app/produtos" target="_blank"
                                  style="font-size: 16px; font-weight: bold; color: #ffffff; text-decoration: none; display: block;">
                                  Ver Nossos Produtos
                                </a>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    <p style="margin-top: 0;">Atenciosamente,</p>
                    <p style="margin-top: 0; font-weight: bold;">A Equipe Smartcash</p>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding: 20px 40px; font-size: 12px; color: #aaaaaa; border-top: 1px solid #eeeeee;">
                    <p style="margin-bottom: 5px;">Smartcash &copy; 2025. Todos os direitos reservados.</p>
                    <p style="margin-top: 0;">Se você não desejar mais receber nossos e-mails, pode <a href="https://ff1be2520a07.ngrok-free.app/unsubscribe" style="color: #8B5CF6; text-decoration: underline;">cancelar sua inscrição aqui</a>.</p>
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
    Bem-vindo(a) à Família Smartcash!

    Olá!

    Ficamos muito felizes em ter você conosco. Prepare-se para receber dicas exclusivas sobre educação financeira, insights valiosos e as últimas novidades da Smartcash, direto na sua caixa de entrada!

    Nosso objetivo é te ajudar a conquistar seus objetivos financeiros, de forma simples e prática.

    Para começar, que tal conferir alguns dos nossos produtos que podem transformar sua vida financeira?
    Acesse: https://www.smartcash.com.br/produtos

    Atenciosamente,
    A Equipe Smartcash

    Smartcash © 2025. Todos os direitos reservados.
  `;

  const subjective = 'Boas vindas ao Smartcash';


  try {
    const { email } = await req.json()

    // Basic email validation
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Email inválido." }, { status: 400 })
    }

    // Check if email already exists
    const existingSubscriber = await prisma.newsletterSubscriber.findUnique({
      where: { email },
    })

    if (existingSubscriber) {
      return NextResponse.json({ error: "Este email já está cadastrado." }, { status: 409 }) // 409 Conflict
    }

    // Save email to the database
    const newSubscriber = await prisma.newsletterSubscriber.create({
      data: {
        email,
      },
    })

    sendSimpleMessage(
      email,
      subjective,
      htmlContent,
      textContent,
    )

    return NextResponse.json({ message: "Email cadastrado com sucesso!"}, { status: 200 })
  } catch (error) {
    console.error("Erro ao cadastrar newsletter:", error)
    return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 })
  } 
}