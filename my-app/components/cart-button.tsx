"use client"

import { ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/contexts/cart-context"
import Link from "next/link"

export function CartButton() {
  const { state } = useCart()

  return (
    <Link href="/carrinho">
      <Button variant="outline" className="relative bg-transparent">
        <ShoppingCart className="h-4 w-4" />
        <span className="hidden sm:inline ml-2">Carrinho</span>
        {state.itemCount > 0 && (
          <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
            {state.itemCount}
          </Badge>
        )}
      </Button>
    </Link>
  )
}
