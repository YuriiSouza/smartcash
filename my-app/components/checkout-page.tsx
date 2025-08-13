"use client"

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
import axios from "axios"
import React, { useEffect, useMemo, useState, useCallback } from "react"
import { CardPayment, initMercadoPago } from "@mercadopago/sdk-react"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import { useSession } from "next-auth/react"

type CustomerFormData = {
  email: string
  firstName: string
  lastName: string
  phone: string
  cpf: string
  zipCode: string
  address: string
  city: string
  state: string // <- padronizado para bater com o backend
  neighborhood: string
}

type BackendProfile = Partial<CustomerFormData>

const PUBLIC_KEY = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY || " "

export function CheckoutPage() {
  const { state: cartState } = useCart()
  const { dispatch } = useCart()
  const router = useRouter()
  const { data: session, status } = useSession()

  const [paymentMethod, setPaymentMethod] = useState<"pix" | "credit">("pix")
  const [isLoading, setIsLoading] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [formLoading, setFormLoading] = useState(false)

  // defaults a partir da sessão
  const fullName = session?.user?.name ?? ""
  const nameParts = fullName.trim().split(" ")
  const firstNameDefault = nameParts[0] ?? ""
  const lastNameDefault = nameParts.length > 1 ? nameParts.slice(1).join(" ") : ""
  const [cepLoading, setCepLoading] = useState(false);
  const [cepError, setCepError] = useState<string | null>(null);

  const onlyDigits = (s: string) => s.replace(/\D/g, "");
  const maskCEP = (cep: string) =>
    cep.replace(/\D/g, "").replace(/^(\d{5})(\d{0,3}).*$/, (_, a, b) => (b ? `${a}-${b}` : a));
  

  const handlePostalCodeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const digits = onlyDigits(raw);

    // atualiza o campo com máscara enquanto digita
    setFormData(prev => ({ ...prev, zipCode: maskCEP(digits) }));
    setCepError(null);

    // só consulta quando tiver 8 dígitos
    if (digits.length !== 8) return;

    try {
      setCepLoading(true);
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      if (data?.erro) {
        setCepError("CEP não encontrado.");
        return;
      }

      // monta endereço (você pode ajustar como preferir)
      const logradouro = data.logradouro || "";
      const bairro = data.bairro || "";
      const cidade = data.localidade || "";
      const uf = data.uf || "";

      setFormData(prev => ({
        ...prev,
        address: logradouro,     // ex.: "Rua Exemplo" (o número o usuário preenche)
        city: cidade,
        state: uf,
        neighborhood: bairro,
      }));
    } catch (err) {
      console.error("Erro ao buscar o CEP:", err);
      setCepError("Erro ao buscar CEP. Tente novamente.");
    } finally {
      setCepLoading(false);
    }
  };

  const [formData, setFormData] = useState<CustomerFormData>({
    email: session?.user?.email ?? "",
    firstName: firstNameDefault,
    lastName: lastNameDefault,
    neighborhood: "",
    phone: "",
    cpf: "",
    zipCode: "",
    address: "",
    city: "",
    state: "",
  })

  useEffect(() => {
    if (status === "unauthenticated") router.replace(`/login`)
  }, [status, router])

  // Mercado Pago
  useEffect(() => {
    if (PUBLIC_KEY && PUBLIC_KEY.trim() !== "") {
      initMercadoPago(PUBLIC_KEY, { locale: "pt-BR" })
    } else {
      console.error("Mercado Pago Public Key ausente/ inválida (.env.local)")
    }
  }, [])

  // preenche do backend quando autenticado
  useEffect(() => {
    if (status !== "authenticated") return
    ;(async () => {
      try {
        setFormLoading(true)
        const res = await axios.get<BackendProfile>("/api/user")
        const d = res.data || {}
        setFormData((prev) => ({
          email: session?.user?.email ?? prev.email,
          firstName: prev.firstName || firstNameDefault,
          lastName: prev.lastName || lastNameDefault,
          phone: d.phone ?? prev.phone,
          cpf: d.cpf ?? prev.cpf,
          zipCode: d.zipCode ?? prev.zipCode,
          address: d.address ?? prev.address,
          city: d.city ?? prev.city,
          state: d.state ?? prev.state, // <— backend deve devolver 'state'
          neighborhood: d.neighborhood ?? prev.neighborhood
        }))
      } catch (e) {
        console.error("Erro ao carregar perfil", e)
      } finally {
        setFormLoading(false)
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  const handleChange =
    (key: keyof CustomerFormData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [key]: e.target.value }))
    }

  const { items, total } = cartState

  const clearCart = () => dispatch({ type: "CLEAR_CART" })

  const amountToPay = useMemo(() => (paymentMethod === "pix" ? total * 0.9 : total), [total, paymentMethod])

  const initializationConfig = useMemo(() => ({ amount: amountToPay }), [amountToPay])

  const customizationConfig = useMemo(
    () => ({
      visual: { hideFormTitle: true, hidePaymentButton: false },
    }),
    []
  )

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(price)

  const validateRequired = (d: CustomerFormData) => {
    const missing =
      !d.email ||
      !d.firstName ||
      !d.lastName ||
      !d.phone ||
      !d.cpf ||
      !d.zipCode ||
      !d.address ||
      !d.city ||
      !d.state ||
      !d.neighborhood
    return !missing
  }

  const handlePaymentSubmission = useCallback(
    async (customer: CustomerFormData, paymentDataFromMP: any = {}) => {
      setIsLoading(true)
      try {
        const response = await axios.post("/api/payment", {
          customerInfo: customer,
          cartItems: items.map((it) => ({ productId: it.id, unitPrice: it.price, quantity: it.quantity })),
          paymentMethod,
          transaction_amount: amountToPay,
          mercadoPagoData: paymentDataFromMP,
        })

        if (response.data && response.data.success) {
          if (paymentMethod === "pix" && response.data.qrCode && response.data.qrCodeBase64) {
            router.push(
              `/pixDetails?qrCode=${encodeURIComponent(response.data.qrCode)}&qrCodeBase64=${encodeURIComponent(
                response.data.qrCodeBase64
              )}`
            )
          } else {
            router.push("/orderSuccess")
          }
          toast({
            title: "Pedido processado!",
            description: response.data.message || "Sua transação foi iniciada com sucesso.",
          })
          clearCart()
        } else {
          toast({
            title: "Status do Pagamento",
            description: response.data.message || "Não foi possível finalizar seu pagamento.",
            variant: "destructive",
          })
        }
      } catch (error: any) {
        console.error("Erro ao realizar pagamento:", error.response?.data || error.message)
        let msg = "Ocorreu um erro inesperado ao processar o pagamento."
        if (axios.isAxiosError(error) && error.response?.data?.error) msg = error.response.data.error
        toast({ title: "Erro Crítico", description: msg, variant: "destructive" })
      } finally {
        setIsLoading(false)
      }
    },
    [items, paymentMethod, amountToPay, router]
  )

  // sem itens no carrinho
  if (items.length === 0) {
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

  const onFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateRequired(formData)) {
      toast({ title: "Campos obrigatórios", description: "Preencha todos os campos marcados com *.", variant: "destructive" })
      return
    }
    if (paymentMethod === "credit") {
      // o CardPayment chamará handlePaymentSubmission no onSubmit com os dados tokenizados
      toast({ title: "Dados validados", description: "Preencha os dados do cartão para prosseguir." })
    } else {
      await handlePaymentSubmission(formData)
    }
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

        <form onSubmit={onFormSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
                      onChange={handleChange("email")}
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
                      <Input id="firstName" required value={formData.firstName} onChange={handleChange("firstName")} placeholder="João" />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Sobrenome *</Label>
                      <Input id="lastName" required value={formData.lastName} onChange={handleChange("lastName")} placeholder="Silva" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Telefone *</Label>
                      <Input id="phone" required value={formData.phone} onChange={handleChange("phone")} placeholder="(11) 99999-9999" />
                    </div>
                    <div>
                      <Label htmlFor="cpf">CPF *</Label>
                      <Input id="cpf" required value={formData.cpf} onChange={handleChange("cpf")} placeholder="000.000.000-00" />
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
                        onChange={handlePostalCodeChange}   // ← aqui
                        onBlur={handlePostalCodeChange}     // ← opcional: garante consulta ao sair do campo
                        placeholder="00000-000"
                        inputMode="numeric"
                        maxLength={9}                       // 8 dígitos + hífen
                      />
                      {cepLoading && <span className="text-xs text-zinc-500">Consultando CEP…</span>}
                      {cepError && <span className="text-xs text-red-500">{cepError}</span>}
                    </div>
                    <div className="sm:col-span-2">
                      <Label htmlFor="address">Endereço *</Label>
                      <Input
                        id="address"
                        required
                        value={formData.address}
                        onChange={handleChange("address")}
                        placeholder="Rua, número, complemento"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Label htmlFor="neighborhood">Bairro</Label>
                      <Input
                        id="neighborhood"
                        required
                        value={formData.neighborhood}
                        onChange={handleChange("neighborhood")}
                        placeholder="Bairro"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">Cidade *</Label>
                      <Input id="city" required value={formData.city} onChange={handleChange("city")} placeholder="São Paulo" />
                    </div>
                    <div>
                      <Label htmlFor="state">Estado *</Label>
                      <Input id="state" required value={formData.state} onChange={handleChange("state")} placeholder="SP" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <div className="space-y-4" />
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="terms"
                      required
                      checked={termsAccepted}
                      onCheckedChange={(checked) => setTermsAccepted(!!checked)}
                    />
                    <Label htmlFor="terms" className="text-sm">
                      Aceito os{" "}
                      <Link href="/politicas" className="text-purple-600 hover:underline">
                        termos e condições
                      </Link>
                    </Label>
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
                  <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as "pix" | "credit")}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="credit" id="credit" />
                      <Label htmlFor="credit">Cartão de Crédito</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="pix" id="pix" />
                      <Label htmlFor="pix">PIX (10% de desconto)</Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>

              {termsAccepted && (
                <Card>
                  <CardContent>
                    {paymentMethod === "credit" && (
                      <div className="space-y-4 pt-4 border-t">
                        {PUBLIC_KEY && PUBLIC_KEY.trim() !== "" ? (
                          <CardPayment
                            initialization={initializationConfig}
                            onSubmit={async (mpPaymentData) => {
                              await handlePaymentSubmission(formData, mpPaymentData) // usa state
                            }}
                            customization={customizationConfig}
                          />
                        ) : (
                          <p className="text-red-500">A chave pública do Mercado Pago não está configurada...</p>
                        )}
                      </div>
                    )}

                    {paymentMethod === "pix" && (
                      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-sm text-green-700">
                          Ao clicar em "Finalizar Pedido", você receberá o código PIX para pagamento.
                          <strong> Desconto de 10% aplicado automaticamente!</strong>
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Resumo do Pedido</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={item.id} className="flex justify-between items-start text-sm">
                        <div className="flex-1">
                          <div className="font-medium line-clamp-2">{item.title}</div>
                          <div className="text-gray-500">Qtd: {item.quantity}</div>
                        </div>
                        <div className="text-right ml-2">
                          <div className="font-medium">{formatPrice(Number(item.price))}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <hr />

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>{formatPrice(total)}</span>
                    </div>
                    {paymentMethod === "pix" && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Desconto PIX (10%)</span>
                        <span>-{formatPrice(total * 0.1)}</span>
                      </div>
                    )}
                    <hr />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span className="text-purple-600">{formatPrice(amountToPay)}</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {paymentMethod === "pix" && (
                      <Button
                        type="submit"
                        disabled={isLoading || !termsAccepted || formLoading}
                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                      >
                        {isLoading || formLoading ? "Processando..." : (
                          <>
                            <Lock className="h-4 w-4 mr-2" />
                            Finalizar Pedido
                          </>
                        )}
                      </Button>
                    )}

                    <div className="text-xs text-gray-500 text-center">🔒 Seus dados estão protegidos com criptografia SSL</div>
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
