// app/order-success/page.tsx
"use client"

import { CheckCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function OrderSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <Header />
      <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[calc(100vh-150px)]"> {/* Ajusta altura para centralizar */}
        <Card className="max-w-xl mx-auto text-center p-8 shadow-lg">
          <CardContent className="flex flex-col items-center justify-center space-y-6">
            <CheckCircle className="h-24 w-24 text-green-500" />
            <h1 className="text-3xl sm:text-4xl font-bold text-green-700">Pagamento Aprovado!</h1>
            <p className="text-lg text-gray-700 leading-relaxed">
              Sua compra foi realizada com sucesso! Um e-mail de confirmação com os detalhes dos seus produtos e instruções de acesso foi enviado para o seu endereço de e-mail.
            </p>
            <p className="text-base text-gray-600">
              Agradecemos a sua preferência!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <Link href="/meus-produtos"> {/* Link para uma página de "Meus Produtos" ou Dashboard */}
                <Button className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-6 py-3 text-lg">
                  Acessar Meus Produtos
                </Button>
              </Link>
              <Link href="/produtos">
                <Button variant="outline" className="w-full sm:w-auto px-6 py-3 text-lg">
                  Continuar Comprando
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  )
}