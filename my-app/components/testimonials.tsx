import { TestimonialCard } from "./testimonial-card"

export function Testimonials() {
  return (
    <section id="depoimentos" className="py-20 px-4 bg-white">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">O que nossos usuários dizem</h2>
          <p className="text-xl text-gray-600">Histórias de transformação financeira</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <TestimonialCard
            name="Maria Silva"
            role="Estudante, 22 anos"
            testimonial="Finalmente consegui organizar minha vida financeira! As planilhas são super fáceis de usar e os ebooks explicam tudo de forma clara."
            initial="M"
            color="purple"
          />

          <TestimonialCard
            name="João Santos"
            role="Jovem Aprendiz, 19 anos"
            testimonial="Em 3 meses consegui juntar minha primeira reserva de emergência seguindo as dicas dos materiais. Recomendo demais!"
            initial="J"
            color="blue"
          />

          <TestimonialCard
            name="Ana Costa"
            role="Universitária, 21 anos"
            testimonial="Saí do vermelho e hoje tenho controle total dos meus gastos. O kit completo vale cada centavo investido!"
            initial="A"
            color="teal"
          />
        </div>
      </div>
    </section>
  )
}
