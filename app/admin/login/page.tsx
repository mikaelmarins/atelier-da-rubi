"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import LoginForm from "@/components/auth/login-form"

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (credentials: { email: string; password: string }) => {
    setLoading(true)

    try {
      // Simulação de login (sistema desabilitado)
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Por enquanto, sempre redireciona para admin sem validação
      alert("Sistema de autenticação em desenvolvimento. Redirecionando...")
      router.push("/admin")
    } catch (error) {
      console.error("Login error:", error)
      alert("Erro no login")
    } finally {
      setLoading(false)
    }
  }

  return <LoginForm onLogin={handleLogin} loading={loading} />
}
