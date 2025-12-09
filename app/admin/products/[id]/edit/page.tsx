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
import { Switch } from "@/components/ui/switch"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import Image from "next/image"
import ImageUpload from "@/components/admin/image-upload"
import { useProduct } from "@/hooks/use-products"
import { ProductServiceSupabase, type ProductWithImages } from "@/lib/product-service"
import { supabase } from "@/lib/supabase"
import DetailsEditor from "@/components/admin/details-editor"
import ColorsEditor, { ProductColor } from "@/components/admin/colors-editor"
import { useToast } from "@/hooks/use-toast"

type Category = { id: number; name: string }

const tamanhos = ["RN", "P", "M", "G", "1 ano", "2 anos", "Berço Padrão", "Mini Berço", "Único"]

function EditProductPageContent() {
  const params = useParams()
  const router = useRouter()
  const productId = Number.parseInt(params.id as string)

  const { product: fetchedProduct, loading: loadingProduct, refresh } = useProduct(productId)

  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<ProductWithImages | null>(null)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [newImages, setNewImages] = useState<File[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const { toast } = useToast()

  useEffect(() => {
    const loadCategories = async () => {
      const { data } = await supabase.from("categories").select("id, name").order("name")
      if (data) setCategories(data)
    }
    loadCategories()
  }, [])

  useEffect(() => {
    if (fetchedProduct) {
      // Lógica de compatibilidade: Se os campos novos estiverem vazios mas existirem no details (legado),
      // preenchemos o formData com os dados do details para permitir a migração ao salvar.
      const legacyDetails = fetchedProduct.details || {}

      setFormData({
        ...fetchedProduct,
        material: fetchedProduct.material || legacyDetails.material || "",
        tamanhos: fetchedProduct.tamanhos || legacyDetails.tamanhos || [],
        cuidados: fetchedProduct.cuidados || legacyDetails.cuidados || "",
        tempo_producao: fetchedProduct.tempo_producao || legacyDetails.tempo_producao || "",

        has_colors: fetchedProduct.has_colors || false,
        colors: fetchedProduct.colors || [],
        is_secondary_color: fetchedProduct.is_secondary_color || false,
      })
    }
  }, [fetchedProduct])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData) return

    setSaving(true)

    try {
      // Converter preço se for string formatada
      const priceValue = typeof formData.price === 'string'
        ? Number((formData.price as string).replace(/\D/g, '')) / 100
        : formData.price

      // 1. Atualizar dados do produto e adicionar novas imagens
      await ProductServiceSupabase.updateProduct(
        formData.id,
        {
          name: formData.name,
          description: formData.description,
          price: priceValue,
          category: formData.category,
          category_id: formData.category_id,
          featured: formData.featured,
          material: formData.material,
          tamanhos: formData.tamanhos,
          cuidados: formData.cuidados,
          tempo_producao: formData.tempo_producao,
          details: formData.details,
          weight: formData.weight,
          height: formData.height,
          width: formData.width,
          length: formData.length,
          is_customizable: formData.is_customizable,

          has_colors: formData.has_colors,
          colors: formData.colors,
          is_secondary_color: formData.is_secondary_color,
        },
        newImages
      )

      // 2. Atualizar ordem das imagens existentes
      if (formData.images && formData.images.length > 0) {
        const imageOrders = formData.images.map((img, index) => ({
          id: img.id,
          order: index
        }))
        await ProductServiceSupabase.reorderImages(formData.id, imageOrders)
      }

      toast({
        title: "Produto atualizado! ✅",
        description: `"${formData.name}" foi salvo com sucesso.`,
      })
      router.push("/admin/products")
      router.refresh()
    } catch (error) {
      console.error("Error updating product:", error)
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível salvar as alterações. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    if (!formData) return
    setFormData({ ...formData, [field]: value })
  }

  const handleCategoryChange = (value: string) => {
    if (!formData) return
    const categoryId = Number(value)
    const category = categories.find(c => c.id === categoryId)
    setFormData({
      ...formData,
      category_id: categoryId,
      category: category?.name || ""
    })
  }

  const handleTamanhosChange = (tamanho: string, checked: boolean) => {
    if (!formData) return
    const currentTamanhos = formData.tamanhos || []
    setFormData({
      ...formData,
      tamanhos: checked
        ? [...currentTamanhos, tamanho]
        : currentTamanhos.filter((t) => t !== tamanho),
    })
  }

  const handleDynamicDetailsChange = (newDetails: Record<string, any>) => {
    if (!formData) return
    setFormData({
      ...formData,
      details: {
        ...formData.details,
        ...newDetails
      }
    })
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

    if (draggedIndex === null || !formData) return

    const newImagesList = [...formData.images]
    const draggedImage = newImagesList[draggedIndex]

    // Remove o item da posição original
    newImagesList.splice(draggedIndex, 1)

    // Insere na nova posição
    newImagesList.splice(dropIndex, 0, draggedImage)

    setFormData({ ...formData, images: newImagesList })
    setDraggedIndex(null)
  }

  const removeImage = async (index: number) => {
    if (!formData) return

    const imageToDelete = formData.images[index]

    if (confirm("Tem certeza que deseja remover esta imagem?")) {
      try {
        await ProductServiceSupabase.deleteProductImage(imageToDelete.id, imageToDelete.image_url)

        const newImagesList = formData.images.filter((_, i) => i !== index)
        setFormData({ ...formData, images: newImagesList })
        refresh() // Recarregar dados do servidor para garantir sincronia
      } catch (error) {
        console.error("Error deleting image:", error)
        alert("Erro ao deletar imagem")
      }
    }
  }

  const handleNewImages = (files: File[]) => {
    setNewImages([...newImages, ...files])
  }

  const removeNewImage = (index: number) => {
    setNewImages(newImages.filter((_, i) => i !== index))
  }

  if (loadingProduct || !formData) {
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
            <Link href="/admin/products">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Editar Produto</h1>
            <p className="text-gray-600">Edite as informações do produto</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Imagens com Reordenação */}
          <Card>
            <CardHeader>
              <CardTitle>Imagens do Produto</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Imagens Existentes com Drag & Drop */}
              {formData.images && formData.images.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Imagens Salvas (Arraste para Reordenar):</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {formData.images.map((img, index) => (
                      <div
                        key={img.id}
                        draggable
                        onDragStart={() => handleDragStart(index)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, index)}
                        className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-move border-2 border-dashed border-gray-300 hover:border-pink-400 transition-colors"
                      >
                        <Image
                          src={img.image_url || "/placeholder.svg"}
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

              {/* Novas Imagens (Preview) */}
              {newImages.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Novas Imagens (Serão enviadas ao salvar):</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {newImages.map((file, index) => (
                      <div key={index} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-blue-300">
                        <Image
                          src={URL.createObjectURL(file)}
                          alt={`Nova imagem ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2 w-6 h-6 p-0"
                          onClick={() => removeNewImage(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload de Novas Imagens */}
              <ImageUpload
                onImagesChange={handleNewImages}
                maxImages={10} // Limite maior pois agora suportamos mais imagens
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
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Ex: Kit Berço Premium"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Preço *</Label>
                  <Input
                    id="price"
                    value={formData.price}
                    onChange={(e) => handleInputChange("price", e.target.value)}
                    placeholder="Ex: R$ 189,90"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoria *</Label>
                <Select
                  value={formData.category_id?.toString() || ""}
                  onValueChange={handleCategoryChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição *</Label>
                <Textarea
                  id="description"
                  value={formData.description || ""}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Descreva o produto..."
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weight">Peso (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.001"
                    value={formData.weight || ""}
                    onChange={(e) => handleInputChange("weight", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height">Altura (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    value={formData.height || ""}
                    onChange={(e) => handleInputChange("height", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="width">Largura (cm)</Label>
                  <Input
                    id="width"
                    type="number"
                    value={formData.width || ""}
                    onChange={(e) => handleInputChange("width", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="length">Comprimento (cm)</Label>
                  <Input
                    id="length"
                    type="number"
                    value={formData.length || ""}
                    onChange={(e) => handleInputChange("length", e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_customizable"
                  checked={formData.is_customizable || false}
                  onCheckedChange={(checked) => handleInputChange("is_customizable", checked)}
                />
                <Label htmlFor="is_customizable">Produto Personalizável (Ex: Nome bordado)</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="featured"
                  checked={formData.featured || false}
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
                    value={formData.material || ""}
                    onChange={(e) => handleInputChange("material", e.target.value)}
                    placeholder="Ex: 100% Algodão Premium"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tempo_producao">Tempo de Produção</Label>
                  <Input
                    id="tempo_producao"
                    value={formData.tempo_producao || ""}
                    onChange={(e) => handleInputChange("tempo_producao", e.target.value)}
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
                        checked={(formData.tamanhos || []).includes(tamanho)}
                        onCheckedChange={(checked) => handleTamanhosChange(tamanho, checked as boolean)}
                      />
                      <Label htmlFor={tamanho} className="text-sm">
                        {tamanho}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Seção de Cores */}
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="has_colors"
                    checked={formData.has_colors || false}
                    onCheckedChange={(checked) => handleInputChange("has_colors", checked)}
                  />
                  <Label htmlFor="has_colors" className="font-semibold text-base">Este produto tem opções de cores?</Label>
                </div>

                {formData.has_colors && (
                  <div className="pl-6 space-y-4 border-l-2 border-pink-100">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="is_secondary_color"
                        checked={formData.is_secondary_color || false}
                        onCheckedChange={(checked) => handleInputChange("is_secondary_color", checked)}
                      />
                      <Label htmlFor="is_secondary_color">Permitir escolha de cor secundária?</Label>
                    </div>

                    <div className="space-y-2">
                      <Label>Cores Disponíveis</Label>
                      <ColorsEditor
                        colors={formData.colors || []}
                        onChange={(newColors) => handleInputChange("colors", newColors)}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cuidados">Cuidados</Label>
                <Textarea
                  id="cuidados"
                  value={formData.cuidados || ""}
                  onChange={(e) => handleInputChange("cuidados", e.target.value)}
                  placeholder="Ex: Lavar à mão com água fria, secar à sombra"
                  rows={3}
                />
              </div>

              {/* Dynamic Details Editor */}
              <div className="pt-4 border-t">
                <DetailsEditor
                  value={formData.details || {}}
                  onChange={handleDynamicDetailsChange}
                />
              </div>
            </CardContent>
          </Card>

          {/* Botões de Ação */}
          <div className="flex gap-4 justify-end">
            <Button type="button" variant="outline" asChild>
              <Link href="/admin/products">Cancelar</Link>
            </Button>
            <Button type="submit" disabled={saving} className="bg-pink-500 hover:bg-pink-600">
              {saving ? (
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
