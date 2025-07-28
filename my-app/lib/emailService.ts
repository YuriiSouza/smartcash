import FormData from "form-data"; // form-data v4.0.1
import Mailgun from "mailgun.js"; // mailgun.js v11.1.0

export async function sendSimpleMessage(to: any, subjective: any, htmlContent: any, textContent: any, attachmentData?: any) {
  const mailgun = new Mailgun(FormData);

  const mg = mailgun.client({
    username: "api",
    key: process.env.EMAIL_API_KEY || "API_KEY",
    // When you have an EU-domain, you must specify the endpoint:
    url: "https://api.mailgun.net"
  });
  try {
    const data = await mg.messages.create("sandbox79411476ba8b49a9b7d90e8943ce5ccc.mailgun.org", {
      from: "Contact <postmaster@sandbox79411476ba8b49a9b7d90e8943ce5ccc.mailgun.org>",
      to: to || ["Yuri Peixoto de Souza <yuripeixoto1112@gmail.com>"],
      subject: subjective || "Hello Yuri Peixoto de Souza",
      text: textContent || '',
      html: htmlContent || '',
      attachment: attachmentData || null
    });

    console.log(data); // logs response data
  } catch (error) {
    console.log(error); //logs any error
  }
}