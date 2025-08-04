"use client"

import type React from "react"
import { Star, ShoppingCart, BookOpen, Calculator } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/contexts/cart-context"
import { toast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface ProductCardProps {
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
}

export function ProductCard({
  id,
  title,
  description,
  price,
  originalPrice,
  discount,
  reviews,
  type
}: ProductCardProps) {
  const { dispatch } = useCart()

  const route = useRouter();

  const typeColors = {
    Ebook: "bg-green-100 text-green-700",
    Planilha: "bg-blue-100 text-blue-700",
    KitCompleto: "bg-teal-100 text-teal-700",
  }

  const _price = price.toString()
  const _originalPrice = originalPrice.toString()

  const handleAddToCart = () => {
    dispatch({
      type: "ADD_ITEM",
      payload: {
        id,
        title,
        price: _price,
        originalPrice: _originalPrice,
        type,
      },
    })

    toast({
      title: "Produto adicionado!",
      description: `${title} foi adicionado ao seu carrinho.`,
    })
  }

  const handleAddToCartBuy = () => {
    dispatch({
      type: "ADD_ITEM",
      payload: {
        id,
        title,
        price: _price,
        originalPrice: _originalPrice,
        type,
      },
    })

    toast({
      title: "Produto adicionado!",
      description: `${title} foi adicionado ao seu carrinho.`,
    })

    route.push('/carrinho')
  }

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-purple-200 h-full flex flex-col">
      <CardHeader className="flex-shrink-0">
        <div className={`w-full h-32 sm:h-40 md:h-48 rounded-lg mb-4 flex items-center justify-center bg-gradient-to-r from-purple-600 via-indigo-500 to-blue-500 text-white`}>
          {type==='Ebook' &&
            <BookOpen className="h-16 w-16 text-white" />
          }
          {type=='Planilha' &&
            <Calculator className="h-16 w-16 text-white" />
          }
          {type=='KitCompleto' &&
            (
              <div className="flex gap-4">
                <BookOpen className="h-12 w-12 text-white" />
                <Calculator className="h-12 w-12 text-white" />
              </div>

            )
          }
        </div>
        <Badge className={`w-fit ${typeColors[type]}`}>{type}</Badge>
        <CardTitle className="text-lg sm:text-xl group-hover:text-purple-600 transition-colors line-clamp-2">
          {title}
        </CardTitle>
        <CardDescription className="text-sm sm:text-base line-clamp-3">{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col justify-end">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-3 w-3 sm:h-4 sm:w-4 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
          <span className="text-xs sm:text-sm text-gray-600">({reviews} avaliações)</span>
        </div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-xl sm:text-2xl font-bold text-purple-600">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(price)}
            </span>
            <span className="text-xs sm:text-sm text-gray-500 line-through ml-2">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(originalPrice)}
            </span>
          </div>
          <Badge variant="secondary" className="text-xs sm:text-sm">
            {`${(discount * 100).toFixed(2)}%`}
          </Badge>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={handleAddToCart} variant="outline" className="flex-1 text-xs sm:text-sm bg-transparent">
            <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            Carrinho
          </Button>
          <Button onClick={handleAddToCartBuy} className={`flex-1 text-xs sm:text-sm`}>Comprar</Button>
        </div>
      </CardContent>
    </Card>
  )
}
