"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { AuthServiceSupabase } from "@/lib/auth"
import LoginForm from "@/components/auth/login-form"

export default function LoginPage() {
  const router = useRouter()

  useEffect(() => {
    // Se já estiver logado, redirecionar para admin
    const checkAuth = async () => {
      const isAuth = await AuthServiceSupabase.isAuthenticated()
      if (isAuth) {
        router.push("/admin")
      }
    }

    checkAuth()
  }, [router])

  return <LoginForm />
}
