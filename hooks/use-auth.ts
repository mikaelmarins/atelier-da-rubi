"use client"

import { useState, useEffect } from "react"
import { AuthService, type User, type LoginCredentials } from "@/lib/auth"

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar se há usuário logado
    const currentUser = AuthService.getCurrentUser()
    setUser(currentUser)
    setLoading(false)

    // Estender sessão se usuário estiver logado
    if (currentUser) {
      AuthService.extendSession()
    }
  }, [])

  const login = async (credentials: LoginCredentials) => {
    const result = await AuthService.login(credentials)

    if (result.success && result.user) {
      setUser(result.user)
    }

    return result
  }

  const logout = () => {
    AuthService.logout()
    setUser(null)
  }

  const isAuthenticated = user !== null

  return {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
  }
}
