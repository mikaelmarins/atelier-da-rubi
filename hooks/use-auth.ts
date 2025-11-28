"use client"

import { useState, useEffect } from "react"
import { AuthServiceSupabase, type User } from "@/lib/auth"

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar se há usuário logado
    console.log("useAuth: calling getCurrentUser")
    AuthServiceSupabase.getCurrentUser().then((currentUser) => {
      console.log("useAuth: getCurrentUser result", currentUser)
      setUser(currentUser)
      setLoading(false)
    })

    // Ouvir mudanças de autenticação
    const { data: authListener } = AuthServiceSupabase.onAuthStateChange((user) => {
      setUser(user)
      setLoading(false)
    })

    return () => {
      authListener?.subscription.unsubscribe()
    }
  }, [])

  const login = async (email: string, password: string) => {
    const result = await AuthServiceSupabase.login(email, password)
    if (result.success && result.user) {
      setUser(result.user)
    }
    return result
  }

  const logout = async () => {
    await AuthServiceSupabase.logout()
    setUser(null)
  }

  return {
    user,
    loading,
    isAuthenticated: user !== null,
    login,
    logout,
  }
}
