"use client"

import { useState } from "react"
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Header } from "./header"
import { Footer } from "./footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/contexts/cart-context"

export function CartPage() {
  const { state, dispatch } = useCart()
  const [couponCode, setCouponCode] = useState("")

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      dispatch({ type: "REMOVE_ITEM", payload: id })
    } else {
      dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } })
    }
  }

  const removeItem = (id: string) => {
    dispatch({ type: "REMOVE_ITEM", payload: id })
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price)
  }

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-md mx-auto text-center">
            <CardContent className="pt-16 pb-16">
              <ShoppingBag className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h2 className="text-2xl font-bold mb-4">Seu carrinho está vazio</h2>
              <p className="text-gray-600 mb-6">Adicione alguns produtos incríveis para começar!</p>
              <Link href="/produtos">
                <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                  Ver Produtos
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/produtos" className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Continuar Comprando
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold">Seu Carrinho</h1>
          <p className="text-gray-600">
            {state.itemCount} {state.itemCount === 1 ? "item" : "itens"} no seu carrinho
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {state.items.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="w-full sm:w-24 h-24 bg-gradient-to-br from-purple-400 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-sm">{item.type}</span>
                    </div>

                    <div className="flex-grow">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-4">
                        <div>
                          <h3 className="font-semibold text-sm sm:text-base line-clamp-2">{item.title}</h3>
                          <Badge variant="outline" className="mt-1 text-xs">
                            {item.type}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-purple-600 text-sm sm:text-base">{item.price}</div>
                          <div className="text-xs text-gray-500 line-through">{item.originalPrice}</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="h-8 w-8 p-0"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-sm">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="h-8 w-8 p-0"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="hidden sm:inline ml-1">Remover</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Resumo do Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>
                      Subtotal ({state.itemCount} {state.itemCount === 1 ? "item" : "itens"})
                    </span>
                    <span>{formatPrice(state.total)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Desconto</span>
                    <span>-{formatPrice(state.total * 0.2)}</span>
                  </div>
                  <hr />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-purple-600">{formatPrice(state.total * 0.8)}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Código do cupom"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="text-sm"
                    />
                    <Button variant="outline" size="sm" className="whitespace-nowrap bg-transparent">
                      Aplicar
                    </Button>
                  </div>
                </div>

                <Link href="/checkout" className="block">
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                    Finalizar Compra
                  </Button>
                </Link>

                <div className="text-xs text-gray-500 text-center">🔒 Compra 100% segura e protegida</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
