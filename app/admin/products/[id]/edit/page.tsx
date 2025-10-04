"use client"

import type React from "react"
import AuthGuard from "@/components/auth/auth-guard"

import { useState, useEffect } from "react"
import { ArrowLeft, Save, Loader2, GripVertical, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import type { Product } from "@/data/products"
import Image from "next/image"
import ImageUpload from "@/components/admin/image-upload"

const categories = [
  { value: "jogos-berco", label: "Jogos de Berço" },
  { value: "toalhas", label: "Toalhas RN" },
  { value: "kit-gestante", label: "Kits Gestante" },
  { value: "vestidos", label: "Vestidos" },
  { value: "bodies", label: "Bodies" },
  { value: "macacoes", label: "Macacões" },
  { value: "blusas", label: "Blusas" },
  { value: "conjuntos", label: "Conjuntos" },
]

const tamanhos = ["RN", "P", "M", "G", "1 ano", "2 anos", "Berço Padrão", "Mini Berço", "Único"]

function EditProductPageContent() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [product, setProduct] = useState<Product | null>(null)
  const [images, setImages] = useState<string[]>([])
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  const productId = params.id as string

  useEffect(() => {
    // Carregar produto do localStorage
    const loadProduct = () => {
      try {
        const savedProducts = localStorage.getItem("atelier-products")
        if (savedProducts) {
          const products = JSON.parse(savedProducts)
          const foundProduct = products.find((p: Product) => p.id === Number.parseInt(productId))

          if (foundProduct) {
            setProduct(foundProduct)
            setImages(foundProduct.images || [])
          }
        }
      } catch (error) {
        console.error("Error loading product:", error)
      }
    }

    loadProduct()
  }, [productId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!product) return

    if (images.length === 0) {
      alert("Adicione pelo menos uma imagem do produto")
      return
    }

    setLoading(true)

    try {
      // Atualizar produto com novas informações
      const updatedProduct = {
        ...product,
        images,
      }

      // Salvar no localStorage
      const existingProducts = JSON.parse(localStorage.getItem("atelier-products") || "[]")
      const productIndex = existingProducts.findIndex((p: Product) => p.id === product.id)

      if (productIndex !== -1) {
        existingProducts[productIndex] = updatedProduct
      } else {
        existingProducts.push(updatedProduct)
      }

      localStorage.setItem("atelier-products", JSON.stringify(existingProducts))

      alert("Produto atualizado com sucesso!")

      // Forçar recarregamento da página para atualizar todos os componentes
      window.location.href = "/admin"
    } catch (error) {
      console.error("Error updating product:", error)
      alert("Erro ao atualizar produto")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    if (!product) return
    setProduct((prev) =>
      prev
        ? {
            ...prev,
            [field]: value,
          }
        : null,
    )
  }

  const handleDetailsChange = (field: string, value: any) => {
    if (!product) return
    setProduct((prev) =>
      prev
        ? {
            ...prev,
            details: {
              ...prev.details,
              [field]: value,
            },
          }
        : null,
    )
  }

  const handleTamanhosChange = (tamanho: string, checked: boolean) => {
    if (!product) return
    setProduct((prev) =>
      prev
        ? {
            ...prev,
            details: {
              ...prev.details,
              tamanhos: checked
                ? [...prev.details.tamanhos, tamanho]
                : prev.details.tamanhos.filter((t) => t !== tamanho),
            },
          }
        : null,
    )
  }

  // Drag and Drop para reordenar imagens
  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()

    if (draggedIndex === null) return

    const newImages = [...images]
    const draggedImage = newImages[draggedIndex]

    // Remove o item da posição original
    newImages.splice(draggedIndex, 1)

    // Insere na nova posição
    newImages.splice(dropIndex, 0, draggedImage)

    setImages(newImages)
    setDraggedIndex(null)
  }

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    setImages(newImages)
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center pt-24">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando produto...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 pt-24">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button asChild variant="ghost">
            <Link href="/admin">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-dancing font-bold text-gray-800">Editar Produto</h1>
            <p className="text-gray-600">Edite as informações do produto</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Imagens com Reordenação */}
          <Card>
            <CardHeader>
              <CardTitle>Imagens do Produto (Arraste para Reordenar)</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Imagens Existentes com Drag & Drop */}
              {images.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Ordem das Imagens:</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {images.map((imageUrl, index) => (
                      <div
                        key={index}
                        draggable
                        onDragStart={() => handleDragStart(index)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, index)}
                        className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-move border-2 border-dashed border-gray-300 hover:border-pink-400 transition-colors"
                      >
                        <Image
                          src={imageUrl || "/placeholder.svg"}
                          alt={`Produto ${index + 1}`}
                          fill
                          className="object-cover"
                        />

                        {/* Drag Handle */}
                        <div className="absolute top-2 left-2 bg-black/60 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                          <GripVertical className="h-4 w-4" />
                        </div>

                        {/* Remove Button */}
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 p-0"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>

                        {/* Position Indicator */}
                        <div className="absolute bottom-2 left-2 bg-pink-500 text-white text-xs px-2 py-1 rounded">
                          {index === 0 ? "Principal" : `${index + 1}ª`}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload de Novas Imagens */}
              <ImageUpload
                onImagesUploaded={(newImages) => setImages([...images, ...newImages])}
                maxImages={5 - images.length}
                existingImages={[]}
              />
            </CardContent>
          </Card>

          {/* Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Produto *</Label>
                  <Input
                    id="name"
                    value={product.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Ex: Kit Berço Premium"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Preço *</Label>
                  <Input
                    id="price"
                    value={product.price}
                    onChange={(e) => handleInputChange("price", e.target.value)}
                    placeholder="Ex: R$ 189,90"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoria *</Label>
                <Select value={product.category} onValueChange={(value) => handleInputChange("category", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição *</Label>
                <Textarea
                  id="description"
                  value={product.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Descreva o produto..."
                  rows={4}
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="featured"
                  checked={product.featured}
                  onCheckedChange={(checked) => handleInputChange("featured", checked)}
                />
                <Label htmlFor="featured">Produto em destaque</Label>
              </div>
            </CardContent>
          </Card>

          {/* Detalhes do Produto */}
          <Card>
            <CardHeader>
              <CardTitle>Detalhes do Produto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="material">Material</Label>
                  <Input
                    id="material"
                    value={product.details.material}
                    onChange={(e) => handleDetailsChange("material", e.target.value)}
                    placeholder="Ex: 100% Algodão Premium"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tempo_producao">Tempo de Produção</Label>
                  <Input
                    id="tempo_producao"
                    value={product.details.tempo_producao}
                    onChange={(e) => handleDetailsChange("tempo_producao", e.target.value)}
                    placeholder="Ex: 7 a 10 dias úteis"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Tamanhos Disponíveis</Label>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                  {tamanhos.map((tamanho) => (
                    <div key={tamanho} className="flex items-center space-x-2">
                      <Checkbox
                        id={tamanho}
                        checked={product.details.tamanhos.includes(tamanho)}
                        onCheckedChange={(checked) => handleTamanhosChange(tamanho, checked as boolean)}
                      />
                      <Label htmlFor={tamanho} className="text-sm">
                        {tamanho}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cuidados">Cuidados</Label>
                <Textarea
                  id="cuidados"
                  value={product.details.cuidados}
                  onChange={(e) => handleDetailsChange("cuidados", e.target.value)}
                  placeholder="Ex: Lavar à mão com água fria, secar à sombra"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Botões de Ação */}
          <div className="flex gap-4 justify-end">
            <Button type="button" variant="outline" asChild>
              <Link href="/admin">Cancelar</Link>
            </Button>
            <Button type="submit" disabled={loading} className="bg-pink-500 hover:bg-pink-600">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function EditProductPage() {
  return (
    <AuthGuard>
      <EditProductPageContent />
    </AuthGuard>
  )
}
