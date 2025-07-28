"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Search, Filter, BookOpen, Calculator, Package } from "lucide-react"
import { Footer } from "./footer"
import { ProductCard } from "./product-card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { HeaderProducts } from "./header-products"
import axios from "axios"

type ProductType = "all" | "ebook" | "planilha" | "KitCompleto"

interface Product {
  id: string
  title: string
  description: string
  price: number
  originalPrice: number
  discount: number
  rating: number
  reviews: number
  type: "Ebook" | "Planilha" | "KitCompleto"
  icon: React.ReactNode
  gradient: string
  buttonGradient: string
  category: string
  tags: string[]
}

export function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState<ProductType>("all")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
      const fecthData = async () => {
        try {
          setLoading(true)
          setError(null)

          const response = await axios.get('api/productApi')

          setCategories(response.data.categories)
          setProducts(response.data.products)
        } catch (error) {
          console.error('Erro ao coletar as categories', error)
        } finally {
          setLoading(false)
        }
      }

      fecthData();
    }, []);

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesType =
      selectedType === "all" ||
      (selectedType === "ebook" && product.type === "Ebook") ||
      (selectedType === "planilha" && product.type === "Planilha") ||
      (selectedType === "KitCompleto" && product.type === "KitCompleto")

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
                variant={selectedType === "KitCompleto" ? "default" : "outline"}
                onClick={() => setSelectedType("KitCompleto")}
                className="flex items-center gap-2"
              >
                <Package className="h-4 w-4" />
                Kit Completo
              </Button>
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 flex-wrap">
              {categories.map((category: any) => (
                <Badge
                  key={category.id}
                  variant={selectedCategory === category.name ? "default" : "outline"}
                  className="cursor-pointer hover:bg-purple-100"
                  onClick={() => setSelectedCategory(category.name)}
                >
                  {category.name === "all" ? "Todas Categorias" : category.name}
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
                  id={product.id}
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
