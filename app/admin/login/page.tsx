"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { AuthService } from "@/lib/auth"
import LoginForm from "@/components/auth/login-form"

export default function LoginPage() {
  const router = useRouter()

  useEffect(() => {
    // Se já estiver logado, redirecionar para admin
    if (AuthService.isAuthenticated()) {
      router.push("/admin")
    }
  }, [router])

  return <LoginForm />
}
