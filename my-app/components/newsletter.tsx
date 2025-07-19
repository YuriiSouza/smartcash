import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function Newsletter() {
  return (
    <section className="py-20 px-4 bg-gradient-to-r from-purple-600 to-blue-600">
      <div className="container mx-auto text-center">
        <h2 className="text-4xl font-bold text-white mb-4">Receba dicas gratuitas toda semana</h2>
        <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
          Cadastre-se em nossa newsletter e receba conteúdos exclusivos sobre educação financeira direto no seu email
        </p>

        <div className="max-w-md mx-auto flex gap-4">
          <Input
            type="email"
            placeholder="Seu melhor email"
            className="bg-white/10 border-white/20 text-white placeholder:text-white/70"
          />
          <Button className="bg-white text-purple-600 hover:bg-gray-100">Cadastrar</Button>
        </div>

        <p className="text-sm text-purple-200 mt-4">
          📧 Sem spam. Apenas conteúdo de qualidade. Cancele quando quiser.
        </p>
      </div>
    </section>
  )
}
