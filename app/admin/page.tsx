"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Plus, Edit, Trash2, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ProductService } from "@/lib/product-service"
import type { Product } from "@/data/products"
import Image from "next/image"
import Link from "next/link"

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      ProductService.initialize()
      const allProducts = ProductService.getAllProducts()
      setProducts(allProducts)
    } catch (error) {
      console.error("Error loading products:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteProduct = async (id: number) => {
    if (!confirm("Tem certeza que deseja deletar este produto?")) return

    try {
      await ProductService.deleteProduct(id)
      await loadProducts()
    } catch (error) {
      console.error("Error deleting product:", error)
      alert("Erro ao deletar produto")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando produtos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 pt-24">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-dancing font-bold text-gray-800">Administração</h1>
            <p className="text-gray-600">Gerencie os produtos do Atelier da Rubi</p>
          </div>

          <Button asChild className="bg-pink-500 hover:bg-pink-600">
            <Link href="/admin/products/new">
              <Plus className="h-4 w-4 mr-2" />
              Novo Produto
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="group"
            >
              <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative aspect-square">
                  <Image
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

                <CardHeader className="pb-2">
                  <CardTitle className="text-lg line-clamp-2">{product.name}</CardTitle>
                  <p className="text-2xl font-bold text-yellow-600">{product.price}</p>
                </CardHeader>

                <CardContent className="pt-0">
                  <p className="text-gray-600 text-sm line-clamp-2 mb-4">{product.description}</p>

                  <div className="flex gap-2">
                    <Button asChild variant="outline" size="sm" className="flex-1 bg-transparent">
                      <Link href={`/catalogo/${product.id}`}>
                        <Eye className="h-4 w-4 mr-1" />
                        Ver
                      </Link>
                    </Button>

                    <Button asChild variant="outline" size="sm" className="flex-1 bg-transparent">
                      <Link href={`/admin/products/${product.id}/edit`}>
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Link>
                    </Button>

                    <Button variant="destructive" size="sm" onClick={() => handleDeleteProduct(product.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">Nenhum produto cadastrado</p>
            <Button asChild className="bg-pink-500 hover:bg-pink-600">
              <Link href="/admin/products/new">
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeiro Produto
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
