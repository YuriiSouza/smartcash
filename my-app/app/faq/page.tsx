'use client'

import FAQItem from '@/components/faq-page';
import { HeaderProducts } from '@/components/header-products';
import React, { useState } from 'react';

export default function FAQPage() {
  const faqs = [
    {
      category: "Sobre os Produtos",
      questions: [
        {
          question: "O que são os produtos virtuais do Smart Cash?",
          answer:
            "Oferecemos uma variedade de produtos digitais focados em finanças, incluindo e-books, cursos online (em vídeo e texto), planilhas de controle financeiro, calculadoras de investimento e modelos de planejamento. Nosso objetivo é descomplicar o mundo das finanças para você.",
        },
        {
          question: "Qual o formato dos materiais após a compra?",
          answer:
            "Nossos e-books e guias geralmente estão em formato PDF. Os cursos são acessados por meio de nossa plataforma de membros, com vídeos e materiais complementares. As planilhas são entregues em formato Excel ou Google Sheets (com link para cópia).",
        },
        {
          question: "Como faço para acessar/baixar o material após a compra?",
          answer:
            "Assim que seu pagamento for confirmado, você receberá um e-mail com as instruções de acesso ou links para download. Se for um curso, você terá acesso a uma área de membros exclusiva. Verifique sua caixa de entrada, lixo eletrônico e spam.",
        },
        {
          question: "Por quanto tempo terei acesso aos produtos digitais?",
          answer:
            "A maioria dos nossos produtos, como e-books e planilhas, oferece acesso vitalício (você baixa e é seu para sempre). Para cursos online, o acesso é geralmente vitalício ou por um período prolongado (ex: 2 anos), conforme especificado na página de vendas de cada produto.",
        },
      ],
    },
    {
      category: "Compra e Pagamento",
      questions: [
        {
          question: "Quais formas de pagamento são aceitas?",
          answer:
            "Aceitamos pagamentos via Cartão de Crédito (Visa, Mastercard, Elo, etc.), Pix, Boleto Bancário e, em alguns casos, PayPal. As opções exatas são exibidas na página de checkout.",
        },
        {
          question: "É seguro comprar no Smart Cash?",
          answer:
            "Sim, a segurança é nossa prioridade! Todas as transações são processadas por plataformas de pagamento seguras e renomadas (como Hotmart, Eduzz ou Stripe), que utilizam criptografia de ponta para proteger seus dados financeiros. Não armazenamos informações de cartão de crédito em nossos servidores.",
        },
        {
          question: "Recebo Nota Fiscal da minha compra?",
          answer:
            "Sim, após a confirmação do pagamento, a Nota Fiscal será emitida e enviada para o e-mail cadastrado na compra. Se precisar de uma segunda via, entre em contato conosco.",
        },
      ],
    },
    {
      category: "Suporte e Contato",
      questions: [
        {
          question: "Como posso entrar em contato com o Smart Cash?",
          answer:
            "Você pode nos contatar através do formulário em nossa página de Contato, ou enviar um e-mail diretamente para [yuripeixoto1112@gmail.com]. Nosso tempo de resposta é de até 24 horas úteis.",
        },
        {
          question: "Vocês oferecem consultoria individual?",
          answer:
            "No momento, nosso foco principal é oferecer produtos digitais de alta qualidade para autoaprendizagem. No entanto, estamos sempre avaliando novas opções de serviços, como consultorias. Fique de olho em nossas atualizações!",
        },
      ],
    },
  ];

  return (
    <div>
        <HeaderProducts />
        <div className="max-w-4xl mx-auto p-5 md:p-10 font-sans leading-relaxed text-gray-700 bg-white shadow-lg rounded-lg my-10">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 text-center mb-8">
            Perguntas Frequentes (FAQ)
        </h1>
        <p className="mb-8 text-lg text-center text-gray-600">
            Encontre as respostas para as dúvidas mais comuns sobre os produtos e serviços do Smart Cash.
        </p>

        {faqs.map((category, index) => (
            <div key={index} className="mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mt-10 mb-6 border-b-2 pb-2 border-blue-500">
                {category.category}
            </h2>
            {category.questions.map((faq, idx) => (
                <FAQItem key={idx} question={faq.question} answer={faq.answer} />
            ))}
            </div>
        ))}
        </div>
    </div>
  );
};