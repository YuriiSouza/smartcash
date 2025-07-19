"use client"

import { Search, Filter, BookOpen, Calculator, Package } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

type ProductType = "all" | "ebook" | "planilha" | "kit"

interface ProductFiltersProps {
  searchTerm: string
  setSearchTerm: (term: string) => void
  selectedType: ProductType
  setSelectedType: (type: ProductType) => void
  selectedCategory: string
  setSelectedCategory: (category: string) => void
  categories: string[]
}

export function ProductFilters({
  searchTerm,
  setSearchTerm,
  selectedType,
  setSelectedType,
  selectedCategory,
  setSelectedCategory,
  categories,
}: ProductFiltersProps) {
  return (
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
  )
}
