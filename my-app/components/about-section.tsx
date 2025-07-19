import { BookOpen, Users, TrendingUp } from "lucide-react"

export function AboutSection() {
  return (
    <section id="sobre" className="py-20 px-4 bg-gradient-to-r from-purple-50 to-blue-50">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-bold mb-6">
              Por que escolher o
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                {" "}
                SmartCash
              </span>
              ?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Somos especialistas em educação financeira. Nossos materiais são desenvolvidos especificamente
              para que você entenda de uma vez por toda o que é investir e a partir disso ficar milionário.
            </p>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <BookOpen className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Conteúdo Prático</h3>
                  <p className="text-gray-600">
                    Materiais diretos ao ponto, sem enrolação para você entender a lógica. Tudo que você precisa saber.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Entendimento completo</h3>
                  <p className="text-gray-600">Entenda a logica por trás de conceitos complexos e nunca mais esqueça.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-teal-100 p-2 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-teal-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Resultados Comprovados</h3>
                  <p className="text-gray-600">
                    Mais de 1.000 usuários já transformaram suas vidas financeiras conosco.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="bg-gradient-to-br from-purple-400 to-blue-500 rounded-2xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-4">Transforme sua vida financeira</h3>
              <p className="mb-6">
                Junte-se aos que já saíram do vermelho e estão construindo seu futuro financeiro.
              </p>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-3xl font-bold">92%</div>
                  <div className="text-sm opacity-90">Conseguiram se organizar</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">87%</div>
                  <div className="text-sm opacity-90">Criaram uma reserva</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
