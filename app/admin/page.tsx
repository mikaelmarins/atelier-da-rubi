"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Eye, LogOut, Package, TrendingUp, Shuffle, Plus, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { formatCurrency } from "@/lib/utils"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { ProductServiceSupabase } from "@/lib/product-service"
import { useProducts } from "@/hooks/use-products"
import Image from "next/image"
import AuthGuard from "@/components/auth/auth-guard"

function AdminPageContent() {
  const { user, profile, signOut } = useAuth()
  const router = useRouter()
  const { products, loading } = useProducts()
  const [stats, setStats] = useState({
    totalProducts: 0,
    featuredProducts: 0,
    categories: 0,
  })

  useEffect(() => {
    loadStats()
  }, [products])

  const loadStats = async () => {
    const stats = await ProductServiceSupabase.getStats()
    setStats(stats)
  }

  const handleLogout = () => {
    if (confirm("Tem certeza que deseja sair?")) {
      signOut()
      router.push("/admin/login")
    }
  }

  const recentProducts = products.slice(0, 6)
  const userName = profile?.name || user?.email?.split('@')[0] || 'Admin'

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 pt-24">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">Dashboard</h1>
            <p className="text-gray-600 text-lg">Bem-vinda, {userName}! 👋</p>
          </motion.div>

          <div className="flex items-center gap-3">
            <Button asChild variant="outline" className="bg-white">
              <Link href="/">
                <Eye className="h-4 w-4 mr-2" />
                Ver Site
              </Link>
            </Button>
            <Button onClick={handleLogout} variant="outline" className="bg-white">
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total de Produtos</p>
                    <h3 className="text-3xl font-bold text-gray-900">{stats.totalProducts}</h3>
                  </div>
                  <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                    <Package className="h-6 w-6 text-pink-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <Button asChild size="sm" variant="outline" className="w-full bg-transparent">
                    <Link href="/admin/products">Ver Todos</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Em Destaque</p>
                    <h3 className="text-3xl font-bold text-gray-900">{stats.featuredProducts}</h3>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <Button asChild size="sm" variant="outline" className="w-full bg-transparent">
                    <Link href="/admin/carousel">Gerenciar Carrossel</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Categorias</p>
                    <h3 className="text-3xl font-bold text-gray-900">{stats.categories}</h3>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Shuffle className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <Button asChild size="sm" variant="outline" className="w-full bg-transparent">
                    <Link href="/admin/products">Explorar</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-12"
        >
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Button asChild className="bg-pink-500 hover:bg-pink-600 h-auto py-6">
                  <Link href="/admin/products/new" className="flex flex-col items-center gap-2">
                    <Plus className="h-8 w-8" />
                    <span className="text-lg">Criar Produto</span>
                  </Link>
                </Button>

                <Button asChild variant="outline" className="bg-white h-auto py-6 border-green-200 hover:bg-green-50">
                  <Link href="/admin/orders" className="flex flex-col items-center gap-2 text-green-700">
                    <Package className="h-8 w-8" />
                    <span className="text-lg">Gerenciar Pedidos</span>
                  </Link>
                </Button>

                <Button asChild variant="outline" className="bg-white h-auto py-6">
                  <Link href="/admin/products" className="flex flex-col items-center gap-2">
                    <Edit className="h-8 w-8" />
                    <span className="text-lg">Gerenciar Produtos</span>
                  </Link>
                </Button>

                <Button asChild variant="outline" className="bg-white h-auto py-6">
                  <Link href="/admin/carousel" className="flex flex-col items-center gap-2">
                    <Shuffle className="h-8 w-8" />
                    <span className="text-lg">Configurar Carrossel</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Products */}
        {!loading && recentProducts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Produtos Recentes</CardTitle>
                  <Button asChild variant="outline" size="sm" className="bg-transparent">
                    <Link href="/admin/products">Ver Todos</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {recentProducts.map((product) => (
                    <div key={product.id} className="group">
                      <div className="bg-gray-50 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                        <div className="aspect-square relative">
                          <Image
                            src={product.images[0]?.image_url || "/placeholder.svg"}
                            alt={product.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <div className="p-2">
                          <h3 className="font-medium text-xs truncate mb-1">{product.name}</h3>
                          <p className="text-sm font-bold text-yellow-600">{formatCurrency(Number(product.price))}</p>
                          <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="w-full mt-2 text-xs h-7 bg-transparent"
                          >
                            <Link href={`/admin/products/${product.id}/edit`}>
                              <Edit className="h-3 w-3 mr-1" />
                              Editar
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default function AdminPage() {
  return (
    <AuthGuard>
      <AdminPageContent />
    </AuthGuard>
  )
}
