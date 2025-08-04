import Link from "next/link"
import { TrendingUp } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12 px-4">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-6 w-6 text-purple-400" />
              <span className="text-xl font-bold">SmartCash</span>
            </div>
            <p className="text-gray-400">Invista com alta perfomance e rendimentos a partir de esforço e estudo.</p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Produtos</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/produtos" className="hover:text-white transition-colors">
                  Ebooks
                </Link>
              </li>
              <li>
                <Link href="/produtos" className="hover:text-white transition-colors">
                  Planilhas
                </Link>
              </li>
              <li>
                <Link href="/produtos" className="hover:text-white transition-colors">
                  Kit Completo
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Suporte</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/faq" className="hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/contato" className="hover:text-white transition-colors">
                  Contato
                </Link>
              </li>
              <li>
                <Link href="/politicas" className="hover:text-white transition-colors">
                  Política de Privacidade
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Redes Sociais</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Instagram
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2025 Pumock. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
