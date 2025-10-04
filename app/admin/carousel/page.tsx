"use client"

import type React from "react"
import AuthGuard from "@/components/auth/auth-guard"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, Save, GripVertical, X, Eye, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import { useProducts } from "@/hooks/use-products"
import Image from "next/image"

const CarouselManagementPageContent: React.FC = () => {
  const { products, loading } = useProducts()
  const [selectedProducts, setSelectedProducts] = useState<number[]>([])
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    // Carregar configuração atual do carrossel do localStorage
    const savedCarousel = localStorage.getItem("carousel-products")
    if (savedCarousel) {
      try {
        setSelectedProducts(JSON.parse(savedCarousel))
      } catch (error) {
        console.error("Error loading carousel:", error)
        setSelectedProducts([])
      }
    }
  }, [])

  const handleProductToggle = (productId: number, checked: boolean) => {
    if (checked) {
      if (selectedProducts.length < 8) {
        setSelectedProducts([...selectedProducts, productId])
      } else {
        alert("Máximo de 8 produtos no carrossel")
      }
    } else {
      setSelectedProducts(selectedProducts.filter((id) => id !== productId))
    }
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()

    if (draggedIndex === null) return

    const newOrder = [...selectedProducts]
    const draggedId = newOrder[draggedIndex]

    newOrder.splice(draggedIndex, 1)
    newOrder.splice(dropIndex, 0, draggedId)

    setSelectedProducts(newOrder)
    setDraggedIndex(null)
  }

  const removeFromCarousel = (productId: number) => {
    setSelectedProducts(selectedProducts.filter((id) => id !== productId))
  }

  const saveCarouselConfig = async () => {
    setSaving(true)
    try {
      localStorage.setItem("carousel-products", JSON.stringify(selectedProducts))
      alert("Configuração do carrossel salva com sucesso!")
    } catch (error) {
      console.error("Error saving carousel config:", error)
      alert("Erro ao salvar configuração")
    } finally {
      setSaving(false)
    }
  }

  const getProductById = (id: number) => products.find((p) => p.id === id)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center pt-24">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando produtos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 pt-24">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost">
              <Link href="/admin">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-dancing font-bold text-gray-800">Gerenciar Carrossel</h1>
              <p className="text-gray-600">Escolha e ordene os produtos do carrossel da página inicial</p>
            </div>
          </div>

          <Button onClick={saveCarouselConfig} disabled={saving} className="bg-pink-500 hover:bg-pink-600">
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Salvar
              </>
            )}
          </Button>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Produtos no Carrossel ({selectedProducts.length}/8)</CardTitle>
              <p className="text-sm text-gray-600">Arraste para reordenar</p>
            </CardHeader>
            <CardContent>
              {selectedProducts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>Nenhum produto selecionado</p>
                  <p className="text-sm">Selecione produtos na lista ao lado</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedProducts.map((productId, index) => {
                    const product = getProductById(productId)
                    if (!product) return null

                    return (
                      <motion.div
                        key={productId}
                        draggable
                        onDragStart={() => handleDragStart(index)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, index)}
                        className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm border-2 border-dashed border-gray-200 hover:border-pink-300 cursor-move group"
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="text-gray-400 group-hover:text-pink-500">
                          <GripVertical className="h-5 w-5" />
                        </div>

                        <div className="flex-shrink-0 w-8 h-8 bg-pink-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>

                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          <Image
                            src={product.images[0]?.image_url || "/placeholder.svg"}
                            alt={product.name}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-800 truncate">{product.name}</h3>
                          <p className="text-sm text-gray-500 truncate">{product.description}</p>
                          <p className="text-sm font-bold text-yellow-600">{product.price}</p>
                        </div>

                        <div className="flex gap-2 flex-shrink-0">
                          <Button variant="outline" size="sm" asChild className="bg-transparent">
                            <Link href={`/catalogo/${product.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => removeFromCarousel(productId)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Todos os Produtos</CardTitle>
              <p className="text-sm text-gray-600">Selecione produtos para adicionar ao carrossel</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Checkbox
                      checked={selectedProducts.includes(product.id)}
                      onCheckedChange={(checked) => handleProductToggle(product.id, checked as boolean)}
                      disabled={!selectedProducts.includes(product.id) && selectedProducts.length >= 8}
                    />

                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                      <Image
                        src={product.images[0]?.image_url || "/placeholder.svg"}
                        alt={product.name}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-800 truncate">{product.name}</h3>
                      <p className="text-xs text-gray-500 truncate">{product.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm font-bold text-yellow-600">{product.price}</span>
                        {product.featured && (
                          <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">Destaque</span>
                        )}
                      </div>
                    </div>

                    <Button variant="outline" size="sm" asChild className="bg-transparent flex-shrink-0">
                      <Link href={`/catalogo/${product.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Preview do Carrossel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {selectedProducts.slice(0, 4).map((productId, index) => {
                const product = getProductById(productId)
                if (!product) return null

                return (
                  <div key={productId} className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="aspect-square relative">
                      <Image
                        src={product.images[0]?.image_url || "/placeholder.svg"}
                        alt={product.name}
                        width={200}
                        height={200}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 left-2 bg-pink-500 text-white text-xs px-2 py-1 rounded">
                        {index + 1}º
                      </div>
                    </div>
                    <div className="p-3">
                      <h3 className="font-medium text-sm truncate">{product.name}</h3>
                      <p className="text-xs text-gray-500 truncate">{product.description}</p>
                      <p className="text-sm font-bold text-yellow-600 mt-1">{product.price}</p>
                    </div>
                  </div>
                )
              })}
            </div>
            {selectedProducts.length > 4 && (
              <p className="text-center text-gray-500 text-sm mt-4">
                + {selectedProducts.length - 4} produtos adicionais no carrossel
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function CarouselManagementPage() {
  return (
    <AuthGuard>
      <CarouselManagementPageContent />
    </AuthGuard>
  )
}
