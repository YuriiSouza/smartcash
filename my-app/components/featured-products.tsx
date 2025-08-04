"use client"

import { BookOpen, Calculator } from "lucide-react"
import { ProductCard } from "./product-card"
import { useEffect, useState } from "react"
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
  reviews: string
  type: "Ebook" | "Planilha" | "KitCompleto"
  icon: string
  category: string
  tags: string[]
}

export function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
      const fecthData = async () => {
        try {

          const response = await axios.get('api/productApi')

          setCategories(response.data.categories)
          console.log(categories)
          setProducts(response.data.products)

          console.log(response.data.categories)
        } catch (error) {
          console.error('Erro ao coletar as categories', error)
        }
      }

      fecthData();
    }, []);
  
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
            {products.map((product) => (
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
              />
            ))}
        </div>
      </div>
    </section>
  )
}
