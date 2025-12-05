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
  const { user, session, loading } = useAuth()
  const router = useRouter()

  // DEV MODE: Bypass auth for testing (set DEV_BYPASS_AUTH=true in .env.local)
  const bypassAuth = process.env.NEXT_PUBLIC_DEV_BYPASS_AUTH === "true"

  // Check if user is authenticated
  const isAuthenticated = !!session && !!user

  useEffect(() => {
    console.log("AuthGuard: checking auth", { loading, isAuthenticated, bypassAuth })

    if (bypassAuth) {
      console.log("AuthGuard: DEV MODE - bypassing authentication")
      setChecking(false)
      return
    }

    if (!loading) {
      if (!isAuthenticated) {
        console.log("AuthGuard: not authenticated, redirecting to login")
        router.push("/admin/login")
      } else {
        console.log("AuthGuard: authenticated")
        setChecking(false)
      }
    }
  }, [isAuthenticated, loading, router, bypassAuth])

  if (bypassAuth) {
    return <>{children}</>
  }

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
