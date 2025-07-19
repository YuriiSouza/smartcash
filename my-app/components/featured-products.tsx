import { BookOpen, Calculator } from "lucide-react"
import { ProductCard } from "./product-card"

export function FeaturedProducts() {
  return (
    <section id="produtos" className="py-12 sm:py-16 lg:py-20 px-4 bg-white">
      <div className="container mx-auto">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">Produtos em Destaque</h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto px-4">
            Materiais práticos e didáticos para você começar sua jornada financeira hoje mesmo
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          <ProductCard
            id="1"
            title="Guia Completo: Primeiros Passos nas Finanças"
            description="Aprenda os fundamentos essenciais para organizar sua vida financeira do zero"
            price="R$ 29,90"
            originalPrice="R$ 49,90"
            discount="40% OFF"
            rating={5}
            reviews={127}
            type="Ebook"
            icon={<BookOpen className="h-12 w-12 sm:h-16 sm:w-16 text-white" />}
            gradient="bg-gradient-to-br from-purple-400 to-blue-500"
            buttonGradient="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          />

          <ProductCard
            id="2"
            title="Planilha de Controle Financeiro Pessoal"
            description="Controle completo de receitas, gastos e metas financeiras em uma planilha intuitiva"
            price="R$ 19,90"
            originalPrice="R$ 39,90"
            discount="50% OFF"
            rating={5}
            reviews={89}
            type="Planilha"
            icon={<Calculator className="h-12 w-12 sm:h-16 sm:w-16 text-white" />}
            gradient="bg-gradient-to-br from-blue-400 to-teal-500"
            buttonGradient="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
          />

          <div className="sm:col-span-2 lg:col-span-1">
            <ProductCard
              id="3"
              title="Kit Jovem Financeiro"
              description="Combo com 5 ebooks + 10 planilhas + bônus exclusivos para dominar suas finanças"
              price="R$ 97,00"
              originalPrice="R$ 297,00"
              discount="67% OFF"
              rating={5}
              reviews={234}
              type="Kit Completo"
              icon={
                <div className="flex gap-2 sm:gap-4">
                  <BookOpen className="h-8 w-8 sm:h-12 sm:w-12 text-white" />
                  <Calculator className="h-8 w-8 sm:h-12 sm:w-12 text-white" />
                </div>
              }
              gradient="bg-gradient-to-br from-teal-400 to-purple-500"
              buttonGradient="bg-gradient-to-r from-teal-600 to-purple-600 hover:from-teal-700 hover:to-purple-700"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
