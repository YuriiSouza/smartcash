"use client"

import { ArrowRight, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export function Hero() {
  return (
    <section className="py-12 sm:py-16 lg:py-20 px-4">
      <div className="container mx-auto text-center">
        <Badge className="mb-4 sm:mb-6 bg-purple-100 text-purple-700 hover:bg-purple-200 text-xs sm:text-sm">
          🚀 Mais de 1.000 usuários já transformaram suas finanças
        </Badge>
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-purple-600 via-blue-600 to-teal-600 bg-clip-text text-transparent leading-tight">
          Domine suas
          <br />
          <span className="text-gray-900">Finanças Pessoais</span>
        </h1>
        <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
          Ebooks e planilhas práticas para quem querem sair do zero e construir um patrimônio rentave;.
          Aprenda de forma eficaz e aplicável!
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-8 sm:mb-12 px-4">
          <Button
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-sm sm:text-base lg:text-lg px-6 sm:px-8 py-3 sm:py-4"
            onClick={() => (window.location.href = "/produtos")}
          >
            Ver Produtos
            <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="text-sm sm:text-base lg:text-lg px-6 sm:px-8 py-3 sm:py-4 border-2 bg-transparent"
          >
            Baixar Grátis
            <Download className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 max-w-4xl mx-auto px-4">
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-purple-600 mb-2">1k+</div>
            <div className="text-sm sm:text-base text-gray-600">Usuários Transformados</div>
          </div>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-2">500+</div>
            <div className="text-sm sm:text-base text-gray-600">Feedbacks Disponíveis</div>
          </div>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-teal-600 mb-2">4.8★</div>
            <div className="text-sm sm:text-base text-gray-600">Avaliação Média</div>
          </div>
        </div>
      </div>
    </section>
  )
}
