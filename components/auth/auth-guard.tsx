"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AuthService } from "@/lib/auth"
import { Loader2 } from "lucide-react"

interface AuthGuardProps {
  children: React.ReactNode
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = AuthService.isAuthenticated()

      if (!authenticated) {
        router.push("/admin/login")
        return
      }

      // Estender sessão
      AuthService.extendSession()
      setIsAuthenticated(true)
      setLoading(false)
    }

    checkAuth()

    // Verificar autenticação periodicamente
    const interval = setInterval(checkAuth, 60000) // A cada minuto

    return () => clearInterval(interval)
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-pink-500 mx-auto mb-4" />
          <p className="text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Redirecionamento em andamento
  }

  return <>{children}</>
}
