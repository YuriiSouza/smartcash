"use client"

import type React from "react"

import { useState } from "react"
import { ArrowLeft, CreditCard, Lock, Mail, User, MapPin } from "lucide-react"
import Link from "next/link"
import { Header } from "./header"
import { Footer } from "./footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { useCart } from "@/contexts/cart-context"
import { HeaderProducts } from "./header-products"

export function CheckoutPage() {
  const { state } = useCart()
  const [paymentMethod, setPaymentMethod] = useState("credit")
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    cpf: "",
    zipCode: "",
    address: "",
    city: "",
    state: "",
    cardNumber: "",
    cardName: "",
    cardExpiry: "",
    cardCvv: "",
  })

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would integrate with your payment processor
    alert("Pedido processado com sucesso! (Demo)")
  }

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <HeaderProducts />
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-md mx-auto text-center">
            <CardContent className="pt-16 pb-16">
              <h2 className="text-2xl font-bold mb-4">Carrinho vazio</h2>
              <p className="text-gray-600 mb-6">Adicione produtos ao carrinho antes de finalizar a compra.</p>
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
          <Link href="/carrinho" className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Carrinho
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold">Finalizar Compra</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Informações de Contato
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="seu@email.com"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Dados Pessoais
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">Nome *</Label>
                      <Input
                        id="firstName"
                        required
                        value={formData.firstName}
                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                        placeholder="João"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Sobrenome *</Label>
                      <Input
                        id="lastName"
                        required
                        value={formData.lastName}
                        onChange={(e) => handleInputChange("lastName", e.target.value)}
                        placeholder="Silva"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Telefone *</Label>
                      <Input
                        id="phone"
                        required
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        placeholder="(11) 99999-9999"
                      />
                    </div>
                    <div>
                      <Label htmlFor="cpf">CPF *</Label>
                      <Input
                        id="cpf"
                        required
                        value={formData.cpf}
                        onChange={(e) => handleInputChange("cpf", e.target.value)}
                        placeholder="000.000.000-00"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Endereço de Cobrança
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="zipCode">CEP *</Label>
                      <Input
                        id="zipCode"
                        required
                        value={formData.zipCode}
                        onChange={(e) => handleInputChange("zipCode", e.target.value)}
                        placeholder="00000-000"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Label htmlFor="address">Endereço *</Label>
                      <Input
                        id="address"
                        required
                        value={formData.address}
                        onChange={(e) => handleInputChange("address", e.target.value)}
                        placeholder="Rua, número, complemento"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">Cidade *</Label>
                      <Input
                        id="city"
                        required
                        value={formData.city}
                        onChange={(e) => handleInputChange("city", e.target.value)}
                        placeholder="São Paulo"
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">Estado *</Label>
                      <Input
                        id="state"
                        required
                        value={formData.state}
                        onChange={(e) => handleInputChange("state", e.target.value)}
                        placeholder="SP"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Forma de Pagamento
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="credit" id="credit" />
                      <Label htmlFor="credit">Cartão de Crédito</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="pix" id="pix" />
                      <Label htmlFor="pix">PIX (5% de desconto)</Label>
                    </div>
                  </RadioGroup>

                  {paymentMethod === "credit" && (
                    <div className="space-y-4 pt-4 border-t">
                      <div>
                        <Label htmlFor="cardNumber">Número do Cartão *</Label>
                        <Input
                          id="cardNumber"
                          required
                          value={formData.cardNumber}
                          onChange={(e) => handleInputChange("cardNumber", e.target.value)}
                          placeholder="0000 0000 0000 0000"
                        />
                      </div>
                      <div>
                        <Label htmlFor="cardName">Nome no Cartão *</Label>
                        <Input
                          id="cardName"
                          required
                          value={formData.cardName}
                          onChange={(e) => handleInputChange("cardName", e.target.value)}
                          placeholder="João Silva"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="cardExpiry">Validade *</Label>
                          <Input
                            id="cardExpiry"
                            required
                            value={formData.cardExpiry}
                            onChange={(e) => handleInputChange("cardExpiry", e.target.value)}
                            placeholder="MM/AA"
                          />
                        </div>
                        <div>
                          <Label htmlFor="cardCvv">CVV *</Label>
                          <Input
                            id="cardCvv"
                            required
                            value={formData.cardCvv}
                            onChange={(e) => handleInputChange("cardCvv", e.target.value)}
                            placeholder="123"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === "pix" && (
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-sm text-green-700">
                        Após confirmar o pedido, você receberá o código PIX para pagamento.
                        <strong> Desconto de 5% aplicado automaticamente!</strong>
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Resumo do Pedido</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {state.items.map((item) => (
                      <div key={item.id} className="flex justify-between items-start text-sm">
                        <div className="flex-1">
                          <div className="font-medium line-clamp-2">{item.title}</div>
                          <div className="text-gray-500">Qtd: {item.quantity}</div>
                        </div>
                        <div className="text-right ml-2">
                          <div className="font-medium">{item.price}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <hr />

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>{formatPrice(state.total)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Desconto</span>
                      <span>-{formatPrice(state.total * 0.1)}</span>
                    </div>
                    {paymentMethod === "pix" && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Desconto PIX (5%)</span>
                        <span>-{formatPrice(state.total * 0.9 * 0.05)}</span>
                      </div>
                    )}
                    <hr />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span className="text-purple-600">
                        {paymentMethod === "pix"
                          ? formatPrice(state.total * 0.9 * 0.95)
                          : formatPrice(state.total * 0.9)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="terms" required />
                      <Label htmlFor="terms" className="text-sm">
                        Aceito os{" "}
                        <Link href="#" className="text-purple-600 hover:underline">
                          termos e condições
                        </Link>
                      </Label>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    >
                      <Lock className="h-4 w-4 mr-2" />
                      Finalizar Pedido
                    </Button>

                    <div className="text-xs text-gray-500 text-center">
                      🔒 Seus dados estão protegidos com criptografia SSL
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>

      <Footer />
    </div>
  )
}
