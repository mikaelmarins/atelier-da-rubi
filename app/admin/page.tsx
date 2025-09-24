"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Plus, Edit, Eye, ImageIcon, Shuffle, BarChart3, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Product } from "@/data/products"
import { products } from "@/data/products"
import NextImage from "next/image"
import Link from "next/link"

export default function AdminPage() {
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      // Sempre inicializar com produtos padrão se não houver produtos salvos
      const savedProducts = localStorage.getItem("atelier-products")
      if (savedProducts) {
        const parsed = JSON.parse(savedProducts)
        if (parsed.length > 0) {
          setAllProducts(parsed)
        } else {
          // Se array vazio, usar produtos padrão
          setAllProducts(products)
          localStorage.setItem("atelier-products", JSON.stringify(products))
        }
      } else {
        // Se não existe no localStorage, usar produtos padrão
        setAllProducts(products)
        localStorage.setItem("atelier-products", JSON.stringify(products))
      }
    } catch (error) {
      console.error("Error loading products:", error)
      // Em caso de erro, sempre usar produtos padrão
      setAllProducts(products)
      localStorage.setItem("atelier-products", JSON.stringify(products))
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteProduct = async (id: number) => {
    if (!confirm("Tem certeza que deseja deletar este produto?")) return

    try {
      const updatedProducts = allProducts.filter((p) => p.id !== id)
      setAllProducts(updatedProducts)
      localStorage.setItem("atelier-products", JSON.stringify(updatedProducts))
      alert("Produto deletado com sucesso!")
    } catch (error) {
      console.error("Error deleting product:", error)
      alert("Erro ao deletar produto")
    }
  }

  const getCarouselCount = () => {
    try {
      const savedCarousel = localStorage.getItem("carousel-products")
      return savedCarousel ? JSON.parse(savedCarousel).length : 5
    } catch {
      return 5
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 pt-24">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="text-4xl md:text-5xl font-dancing font-bold text-gray-800 mb-4">Painel Administrativo</h1>
            <p className="text-gray-600 text-lg">Atelier da Rubi - Sistema de Gerenciamento</p>
          </motion.div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="h-6 w-6 text-pink-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{allProducts.length}</h3>
                <p className="text-gray-600 text-sm">Total de Produtos</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Eye className="h-6 w-6 text-yellow-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">
                  {allProducts.filter((p) => p.featured).length}
                </h3>
                <p className="text-gray-600 text-sm">Em Destaque</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shuffle className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{getCarouselCount()}</h3>
                <p className="text-gray-600 text-sm">No Carrossel</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">
                  {new Set(allProducts.map((p) => p.category)).size}
                </h3>
                <p className="text-gray-600 text-sm">Categorias</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Main Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <Card className="hover:shadow-xl transition-all duration-300 group">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-pink-400 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Package className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl">Gerenciar Produtos</CardTitle>
                <p className="text-gray-600 text-sm">Criar, editar e organizar produtos do catálogo</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild className="w-full bg-pink-500 hover:bg-pink-600">
                  <Link href="/admin/products/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Produto
                  </Link>
                </Button>
                <div className="text-center text-sm text-gray-500">{allProducts.length} produtos cadastrados</div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Card className="hover:shadow-xl transition-all duration-300 group">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Shuffle className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl">Carrossel Principal</CardTitle>
                <p className="text-gray-600 text-sm">Configure os produtos em destaque na página inicial</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  asChild
                  variant="outline"
                  className="w-full border-purple-300 text-purple-600 hover:bg-purple-50 bg-transparent"
                >
                  <Link href="/admin/carousel">
                    <Shuffle className="h-4 w-4 mr-2" />
                    Configurar Carrossel
                  </Link>
                </Button>
                <div className="text-center text-sm text-gray-500">{getCarouselCount()} produtos selecionados</div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <Card className="hover:shadow-xl transition-all duration-300 group">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <ImageIcon className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl">Gerenciar Imagens</CardTitle>
                <p className="text-gray-600 text-sm">Upload e organização de imagens do sistema</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  asChild
                  variant="outline"
                  className="w-full border-blue-300 text-blue-600 hover:bg-blue-50 bg-transparent"
                >
                  <Link href="/admin/storage">
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Acessar Storage
                  </Link>
                </Button>
                <div className="text-center text-sm text-gray-500">Sistema offline ativo</div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Recent Products Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-2xl">Produtos Recentes</CardTitle>
                  <p className="text-gray-600">Últimos produtos do catálogo</p>
                </div>
                <Button asChild variant="outline" className="bg-transparent">
                  <Link href="/">
                    <Eye className="h-4 w-4 mr-2" />
                    Ver Site
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {allProducts.slice(0, 4).map((product) => (
                  <div key={product.id} className="group">
                    <div className="bg-gray-50 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                      <div className="aspect-square relative">
                        <NextImage
                          src={product.images[0] || "/placeholder.svg"}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                        {product.featured && (
                          <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded">
                            Destaque
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <h3 className="font-medium text-sm truncate mb-1">{product.name}</h3>
                        <p className="text-lg font-bold text-yellow-600 mb-2">{product.price}</p>
                        <div className="flex gap-1">
                          <Button asChild variant="outline" size="sm" className="flex-1 text-xs bg-transparent">
                            <Link href={`/catalogo/${product.id}`}>
                              <Eye className="h-3 w-3 mr-1" />
                              Ver
                            </Link>
                          </Button>
                          <Button asChild variant="outline" size="sm" className="flex-1 text-xs bg-transparent">
                            <Link href={`/admin/products/${product.id}/edit`}>
                              <Edit className="h-3 w-3 mr-1" />
                              Editar
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {allProducts.length > 4 && (
                <div className="text-center mt-6">
                  <p className="text-gray-500 text-sm mb-4">Mostrando 4 de {allProducts.length} produtos</p>
                </div>
              )}

              {allProducts.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-lg mb-4">Nenhum produto cadastrado</p>
                  <Button asChild className="bg-pink-500 hover:bg-pink-600">
                    <Link href="/admin/products/new">
                      <Plus className="h-4 w-4 mr-2" />
                      Criar Primeiro Produto
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="mt-12 text-center"
        >
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Acesso Rápido</h3>
            <div className="flex flex-wrap justify-center gap-3">
              <Button asChild variant="outline" size="sm" className="bg-transparent">
                <Link href="/">
                  <Eye className="h-4 w-4 mr-2" />
                  Ver Site
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="bg-transparent">
                <Link href="/catalogo">
                  <Package className="h-4 w-4 mr-2" />
                  Catálogo
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="bg-transparent">
                <Link href="/admin/products/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Produto
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
