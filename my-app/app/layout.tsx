<<<<<<< HEAD
=======
'use client'

>>>>>>> 9b85b48 (feat: create profile page)
import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { CartProvider } from "@/contexts/cart-context"
import { Toaster } from "@/components/toaster"
<<<<<<< HEAD

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SmartCash",
  description: "Ebooks e planilhas práticas para dominar suas finanças",
}

=======
import { SessionProvider } from "next-auth/react"

const inter = Inter({ subsets: ["latin"] })

>>>>>>> 9b85b48 (feat: create profile page)
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
<<<<<<< HEAD
        <CartProvider>
          {children}
          <Toaster />
        </CartProvider>
=======
        <SessionProvider>
          <CartProvider>
            {children}
            <Toaster />
          </CartProvider>
        </SessionProvider>
>>>>>>> 9b85b48 (feat: create profile page)
      </body>
    </html>
  )
}
