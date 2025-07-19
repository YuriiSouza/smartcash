import Link from "next/link"
import { TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CartButton } from "./cart-button"

export function Header() {
  return (
    <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
          <span className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            SmartCash
          </span>
        </Link>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center gap-2">
          <CartButton />
        </div>

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center gap-4 lg:gap-6">
          <Link href="/produtos" className="text-gray-600 hover:text-purple-600 transition-colors text-sm lg:text-base">
            Produtos
          </Link>
          <Link href="/#sobre" className="text-gray-600 hover:text-purple-600 transition-colors text-sm lg:text-base">
            Sobre
          </Link>
          <Link
            href="/#depoimentos"
            className="text-gray-600 hover:text-purple-600 transition-colors text-sm lg:text-base"
          >
            Depoimentos
          </Link>
          <CartButton />
          <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-sm lg:text-base">
            Começar Agora
          </Button>
        </nav>
      </div>
    </header>
  )
}
