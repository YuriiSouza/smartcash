"use client"

import { useState } from "react" // Import useState
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "@/hooks/use-toast" // Assuming you have a toast notification system

export function Newsletter() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault() // Prevent default form submission

    if (!email) {
      toast({
        title: "Erro",
        description: "Por favor, insira um email válido.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/newsletter", { // Your API route
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        toast({
          title: "Sucesso!",
          description: "Email cadastrado com sucesso! Em breve você receberá nossas dicas.",
        })
        setEmail("") // Clear the input after successful submission
      } else {
        const errorData = await response.json()
        toast({
          title: "Erro ao cadastrar",
          description: errorData.error || "Ocorreu um erro ao tentar cadastrar o email.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error submitting newsletter:", error)
      toast({
        title: "Erro de conexão",
        description: "Não foi possível conectar ao servidor. Tente novamente mais tarde.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="py-20 px-4 bg-gradient-to-r from-purple-600 to-blue-600">
      <div className="container mx-auto text-center">
        <h2 className="text-4xl font-bold text-white mb-4">Receba dicas gratuitas toda semana</h2>
        <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
          Cadastre-se em nossa newsletter e receba conteúdos exclusivos sobre educação financeira direto no seu email
        </p>

        <form onSubmit={handleSubmit} className="max-w-md mx-auto flex gap-4">
          <Input
            type="email"
            placeholder="Seu melhor email"
            className="bg-white/10 border-white/20 text-white placeholder:text-white/70"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
          />
          <Button
            type="submit" // Set type to submit for form submission
            className="bg-white text-purple-600 hover:bg-gray-100"
            disabled={isLoading} // Disable button while loading
          >
            {isLoading ? "Cadastrando..." : "Cadastrar"}
          </Button>
        </form>

        <p className="text-sm text-purple-200 mt-4">
          📧 Sem spam. Apenas conteúdo de qualidade. Cancele quando quiser.
        </p>
      </div>
    </section>
  )
}