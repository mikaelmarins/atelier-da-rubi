"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Loader2 } from "lucide-react"

interface AuthGuardProps {
  children: React.ReactNode
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const [checking, setChecking] = useState(true)
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    console.log("AuthGuard: checking auth", { loading, isAuthenticated })
    if (!loading) {
      if (!isAuthenticated) {
        console.log("AuthGuard: not authenticated, redirecting to login")
        router.push("/admin/login")
      } else {
        console.log("AuthGuard: authenticated")
        setChecking(false)
      }
    }
  }, [isAuthenticated, loading, router])

  if (loading || checking) {
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
    return null
  }

  return <>{children}</>
}
