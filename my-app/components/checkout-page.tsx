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
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { CardPayment, initMercadoPago, Payment as MercadoPagoPaymentSDK } from '@mercadopago/sdk-react';
import { useRouter } from 'next/navigation'; // Para App Router
import { useForm, SubmitHandler } from "react-hook-form";
import { toast } from "@/hooks/use-toast"

interface CustomerFormData {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  cpf: string;
  zipCode: string;
  address: string;
  city: string;
  state: string;
}

const PUBLIC_KEY = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY || ' ';

export function CheckoutPage() {
  const { state } = useCart()
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState("pix")
  const [isLoading, setIsLoading] = useState(false); // To manage loading state during submission
  const [termsAccepted, setTermsAccepted] = useState(false); // State for terms checkbox
  const { dispatch } = useCart()


  // Initialize Mercado Pago SDK once when the component mounts
  useEffect(() => {
    if (PUBLIC_KEY && PUBLIC_KEY.trim() !== '') {
      initMercadoPago(PUBLIC_KEY, { locale: 'pt-BR' });
    } else {
      console.error("Mercado Pago Public Key is not set or is invalid. Please check your .env.local file.");
    }
  }, []);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<CustomerFormData>({
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      phone: "",
      cpf: "",
      zipCode: "",
      address: "",
      city: "",
      state: "",
    }
  });

    const clearCart = () => {
    dispatch({
      type: "CLEAR_CART",
    })
  }

  const amountToPay = useMemo(() => {
    return paymentMethod === "pix"
      ? state.total * 0.9
      : state.total * 1;
  }, [state.total, paymentMethod]);

  const initializationConfig = useMemo(() => ({
    amount: amountToPay,
  }), [amountToPay]);

  const customizationConfig = useMemo(() => ({
    visual: {
      hideFormTitle: true,
      hidePaymentButton: false,
    }
  }), []);


  const formatPrice = (price: any) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price)
  }

  const handlePaymentSubmission = useCallback(async (
    customerFormData: CustomerFormData, // Dados do formulário
    paymentDataFromMP: any = {} // Dados do CardPayment do MP
  ) => {
    setIsLoading(true);

    try {
      const response = await axios.post('/api/payment', {
        customerInfo: customerFormData, // Enviando os dados do cliente coletados pelo RHF
        cartItems: state.items.map(item => ({
          productId: item.id,
          unitPrice: item.price,
          quantity: item.quantity
        })),
        paymentMethod: paymentMethod,
        transaction_amount: amountToPay,
        mercadoPagoData: paymentDataFromMP,
      });

          // TRATAMENTO DA RESPOSTA DO BACKEND
    if (response.data && response.data.success) { // Se o backend indicou 'success: true'
      // Se for PIX, redireciona para a página do QR Code
      if (paymentMethod === "pix" && response.data.qrCode && response.data.qrCodeBase64) {
          router.push(`/pixDetails?qrCode=${encodeURIComponent(response.data.qrCode)}&qrCodeBase64=${encodeURIComponent(response.data.qrCodeBase64)}`);
      } else {
          // Se não é PIX (é cartão aprovado), redireciona para a página de sucesso genérica
          router.push('/orderSuccess');
      }
      // Exibe um toast de sucesso
      toast({
        title: "Pedido processado!",
        description: response.data.message || "Sua transação foi iniciada com sucesso.",
        // Adicione um variant 'success' se tiver no seu tema
      });
    } else { // Se o backend indicou 'success: false' (pagamento rejeitado ou pendente)
      // Exibe uma mensagem de erro ou de pagamento pendente
      toast({
        title: "Status do Pagamento",
        description: response.data.message || "Não foi possível finalizar seu pagamento. Por favor, tente novamente.",
        variant: "destructive", // Usa o variant para erros
      });
      // Opcional: Se for cartão rejeitado, pode redirecionar para uma página de erro específica
      // router.push('/payment-failed');
    }
  } catch (error: any) {
    // Este catch lida com erros de rede, erros do Axios, ou erros não tratados pelo backend.
    console.error('Erro ao realizar pagamento:', error.response?.data || error.message);
    let errorMessage = "Ocorreu um erro inesperado ao processar o pagamento.";
    if (axios.isAxiosError(error) && error.response && error.response.data && error.response.data.error) {
      errorMessage = error.response.data.error; // Pega a mensagem de erro do backend
    }
    toast({
      title: "Erro Crítico",
      description: errorMessage,
      variant: "destructive",
    });
  } finally {
    setIsLoading(false);
  }
  }, [paymentMethod, amountToPay, router]); // Dependências da função




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

  const onFormSubmit: SubmitHandler<CustomerFormData> = (data) => {
    if (paymentMethod === "credit") {
      alert("Formulário de cliente validado. Por favor, preencha os detalhes do cartão acima para prosseguir.");
    } else if (paymentMethod === "pix") {
      handlePaymentSubmission(data);
      clearCart;
    }
  };

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

       {/* O formulário agora é envolvido pelo handleSubmit do React Hook Form */}
        <form onSubmit={handleSubmit(onFormSubmit)}>
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
                      {...register("email", { required: true, pattern: /^\S+@\S+$/i })} // Registrar campo
                      placeholder="seu@email.com"
                    />
                    {errors.email && <span className="text-red-500 text-xs">Email é obrigatório e deve ser válido.</span>}
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
                        {...register("firstName", { required: true })} // Registrar campo
                        placeholder="João"
                      />
                      {errors.firstName && <span className="text-red-500 text-xs">Nome é obrigatório.</span>}
                    </div>
                    <div>
                      <Label htmlFor="lastName">Sobrenome *</Label>
                      <Input
                        id="lastName"
                        required
                        {...register("lastName", { required: true })} // Registrar campo
                        placeholder="Silva"
                      />
                      {errors.lastName && <span className="text-red-500 text-xs">Sobrenome é obrigatório.</span>}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Telefone *</Label>
                      <Input
                        id="phone"
                        required
                        {...register("phone", { required: true })} // Registrar campo
                        placeholder="(11) 99999-9999"
                      />
                      {errors.phone && <span className="text-red-500 text-xs">Telefone é obrigatório.</span>}
                    </div>
                    <div>
                      <Label htmlFor="cpf">CPF *</Label>
                      <Input
                        id="cpf"
                        required
                        {...register("cpf", { required: true, minLength: 11, maxLength: 14 })} // Exemplo de validação de CPF
                        placeholder="000.000.000-00"
                      />
                      {errors.cpf && <span className="text-red-500 text-xs">CPF é obrigatório e deve ser válido.</span>}
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
                        {...register("zipCode", { required: true, minLength: 8, maxLength: 9 })} // Exemplo de validação de CEP
                        placeholder="00000-000"
                      />
                      {errors.zipCode && <span className="text-red-500 text-xs">CEP é obrigatório.</span>}
                    </div>
                    <div className="sm:col-span-2">
                      <Label htmlFor="address">Endereço *</Label>
                      <Input
                        id="address"
                        required
                        {...register("address", { required: true })}
                        placeholder="Rua, número, complemento"
                      />
                      {errors.address && <span className="text-red-500 text-xs">Endereço é obrigatório.</span>}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">Cidade *</Label>
                      <Input
                        id="city"
                        required
                        {...register("city", { required: true })}
                        placeholder="São Paulo"
                      />
                      {errors.city && <span className="text-red-500 text-xs">Cidade é obrigatória.</span>}
                    </div>
                    <div>
                      <Label htmlFor="state">Estado *</Label>
                      <Input
                        id="state"
                        required
                        {...register("state", { required: true, minLength: 2, maxLength: 2 })}
                        placeholder="SP"
                      />
                      {errors.state && <span className="text-red-500 text-xs">Estado é obrigatório.</span>}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <div className="space-y-4"></div>
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
                      <div />
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
                  </CardContent>
                </Card>
              {termsAccepted && (
                <Card>
                  <CardContent>
                    {paymentMethod === "credit" && (
                      <div className="space-y-4 pt-4 border-t">
                        {PUBLIC_KEY && PUBLIC_KEY.trim() !== '' ? (
                          <CardPayment
                            initialization={initializationConfig}
                            // Esta é a função que o CardPayment do Mercado Pago chamará
                            // quando ele tiver os dados do cartão tokenizados.
                            // Precisamos de uma "ponte" para pegar esses dados e os dados do formulário principal.
                            onSubmit={async (mpPaymentData) => {
                              const dataUser = watch()
                              await handlePaymentSubmission(dataUser, mpPaymentData);
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
                          <strong> Desconto de 5% aplicado automaticamente!</strong>
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
                    {state.items.map((item) => (
                      <div key={item.id} className="flex justify-between items-start text-sm">
                        <div className="flex-1">
                          <div className="font-medium line-clamp-2">{item.title}</div>
                          <div className="text-gray-500">Qtd: {item.quantity}</div>
                        </div>
                        <div className="text-right ml-2">
                          <div className="font-medium">{formatPrice(item.price)}</div>
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
                    {paymentMethod=="pix" && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Desconto PIX (10%)</span>
                        <span>-{formatPrice(state.total * 0.1)}</span>
                      </div>
                    )}
                    <hr />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span className="text-purple-600">
                        {formatPrice(amountToPay)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {paymentMethod === "pix" && (
                      <Button
                        type="submit" // Mudar para 'submit' para acionar o handleSubmit do React Hook Form
                        disabled={isLoading || !termsAccepted}
                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                      >
                        {isLoading || !termsAccepted ? "Processando..." : (
                          <>
                            <Lock className="h-4 w-4 mr-2" />
                            Finalizar Pedido
                          </>
                        )}
                      </Button>
                      
                    )}

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
  );
}