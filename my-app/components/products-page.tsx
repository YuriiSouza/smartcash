"use client"

import type React from "react"

import { useState } from "react"
import { Search, Filter, BookOpen, Calculator, Package } from "lucide-react"
import { Header } from "./header"
import { Footer } from "./footer"
import { ProductCard } from "./product-card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { HeaderProducts } from "./header-products"

type ProductType = "all" | "ebook" | "planilha" | "kit"

interface Product {
  id: string
  title: string
  description: string
  price: string
  originalPrice: string
  discount: string
  rating: number
  reviews: number
  type: "Ebook" | "Planilha" | "Kit Completo"
  icon: React.ReactNode
  gradient: string
  buttonGradient: string
  category: string
  tags: string[]
}

const products: Product[] = [
  {
    id: "1",
    title: "Guia Completo: Primeiros Passos nas Finanças",
    description: "Aprenda os fundamentos essenciais para organizar sua vida financeira do zero",
    price: "R$ 29,90",
    originalPrice: "R$ 49,90",
    discount: "40% OFF",
    rating: 5,
    reviews: 127,
    type: "Ebook",
    icon: <BookOpen className="h-16 w-16 text-white" />,
    gradient: "bg-gradient-to-br from-purple-400 to-blue-500",
    buttonGradient: "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700",
    category: "Iniciante",
    tags: ["básico", "organização", "fundamentos"],
  },
  {
    id: "2",
    title: "Planilha de Controle Financeiro Pessoal",
    description: "Controle completo de receitas, gastos e metas financeiras em uma planilha intuitiva",
    price: "R$ 19,90",
    originalPrice: "R$ 39,90",
    discount: "50% OFF",
    rating: 5,
    reviews: 89,
    type: "Planilha",
    icon: <Calculator className="h-16 w-16 text-white" />,
    gradient: "bg-gradient-to-br from-blue-400 to-teal-500",
    buttonGradient: "bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700",
    category: "Ferramentas",
    tags: ["controle", "gastos", "receitas", "metas"],
  },
  {
    id: "3",
    title: "Kit Jovem Financeiro",
    description: "Combo com 5 ebooks + 10 planilhas + bônus exclusivos para dominar suas finanças",
    price: "R$ 97,00",
    originalPrice: "R$ 297,00",
    discount: "67% OFF",
    rating: 5,
    reviews: 234,
    type: "Kit Completo",
    icon: (
      <div className="flex gap-4">
        <BookOpen className="h-12 w-12 text-white" />
        <Calculator className="h-12 w-12 text-white" />
      </div>
    ),
    gradient: "bg-gradient-to-br from-teal-400 to-purple-500",
    buttonGradient: "bg-gradient-to-r from-teal-600 to-purple-600 hover:from-teal-700 hover:to-purple-700",
    category: "Completo",
    tags: ["combo", "completo", "ebooks", "planilhas", "bônus"],
  },
  {
    id: "4",
    title: "Ebook: Investimentos para Iniciantes",
    description: "Guia prático para começar a investir com segurança e inteligência",
    price: "R$ 39,90",
    originalPrice: "R$ 59,90",
    discount: "33% OFF",
    rating: 5,
    reviews: 156,
    type: "Ebook",
    icon: <BookOpen className="h-16 w-16 text-white" />,
    gradient: "bg-gradient-to-br from-green-400 to-blue-500",
    buttonGradient: "bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700",
    category: "Investimentos",
    tags: ["investimentos", "iniciante", "segurança", "renda fixa"],
  },
  {
    id: "5",
    title: "Planilha de Planejamento de Aposentadoria",
    description: "Calcule quanto precisa poupar para se aposentar com tranquilidade",
    price: "R$ 24,90",
    originalPrice: "R$ 49,90",
    discount: "50% OFF",
    rating: 5,
    reviews: 73,
    type: "Planilha",
    icon: <Calculator className="h-16 w-16 text-white" />,
    gradient: "bg-gradient-to-br from-orange-400 to-red-500",
    buttonGradient: "bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700",
    category: "Planejamento",
    tags: ["aposentadoria", "planejamento", "longo prazo", "previdência"],
  },
  {
    id: "6",
    title: "Ebook: Como Sair das Dívidas",
    description: "Estratégias comprovadas para quitar dívidas e reconquistar sua liberdade financeira",
    price: "R$ 27,90",
    originalPrice: "R$ 44,90",
    discount: "38% OFF",
    rating: 5,
    reviews: 198,
    type: "Ebook",
    icon: <BookOpen className="h-16 w-16 text-white" />,
    gradient: "bg-gradient-to-br from-red-400 to-pink-500",
    buttonGradient: "bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700",
    category: "Dívidas",
    tags: ["dívidas", "quitação", "estratégias", "liberdade financeira"],
  },
]

export function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState<ProductType>("all")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  const categories = ["all", ...Array.from(new Set(products.map((p) => p.category)))]

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesType =
      selectedType === "all" ||
      (selectedType === "ebook" && product.type === "Ebook") ||
      (selectedType === "planilha" && product.type === "Planilha") ||
      (selectedType === "kit" && product.type === "Kit Completo")

    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory

    return matchesSearch && matchesType && matchesCategory
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <HeaderProducts />
      
      {/* Hero Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">Nossos Produtos</h1>
          <p className="text-xl text-purple-100 max-w-2xl mx-auto">
            Descubra todos os nossos materiais de educação financeira para transformar sua vida
          </p>
        </div>
      </section>

      {/* Filters and Search */}
      <section className="py-8 px-4 bg-white border-b">
        <div className="container mx-auto">
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Type Filters */}
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={selectedType === "all" ? "default" : "outline"}
                onClick={() => setSelectedType("all")}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Todos
              </Button>
              <Button
                variant={selectedType === "ebook" ? "default" : "outline"}
                onClick={() => setSelectedType("ebook")}
                className="flex items-center gap-2"
              >
                <BookOpen className="h-4 w-4" />
                Ebooks
              </Button>
              <Button
                variant={selectedType === "planilha" ? "default" : "outline"}
                onClick={() => setSelectedType("planilha")}
                className="flex items-center gap-2"
              >
                <Calculator className="h-4 w-4" />
                Planilhas
              </Button>
              <Button
                variant={selectedType === "kit" ? "default" : "outline"}
                onClick={() => setSelectedType("kit")}
                className="flex items-center gap-2"
              >
                <Package className="h-4 w-4" />
                Kits
              </Button>
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 flex-wrap">
              {categories.map((category) => (
                <Badge
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  className="cursor-pointer hover:bg-purple-100"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category === "all" ? "Todas Categorias" : category}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          {/* Results Info */}
          <div className="mb-8">
            <p className="text-gray-600">
              Mostrando {filteredProducts.length} produto{filteredProducts.length !== 1 ? "s" : ""}
              {searchTerm && ` para "${searchTerm}"`}
            </p>
          </div>

          {/* Products Grid */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  title={product.title}
                  description={product.description}
                  price={product.price}
                  originalPrice={product.originalPrice}
                  discount={product.discount}
                  rating={product.rating}
                  reviews={product.reviews}
                  type={product.type}
                  icon={product.icon}
                  gradient={product.gradient}
                  buttonGradient={product.buttonGradient}
                />
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <CardContent>
                <div className="text-gray-400 mb-4">
                  <Search className="h-16 w-16 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Nenhum produto encontrado</h3>
                <p className="text-gray-600 mb-4">Tente ajustar seus filtros ou termo de busca</p>
                <Button
                  onClick={() => {
                    setSearchTerm("")
                    setSelectedType("all")
                    setSelectedCategory("all")
                  }}
                  variant="outline"
                >
                  Limpar Filtros
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Não encontrou o que procurava?</h2>
          <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
            Entre em contato conosco e sugerimos o melhor material para suas necessidades
          </p>
          <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100">
            Falar Conosco
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  )
}
