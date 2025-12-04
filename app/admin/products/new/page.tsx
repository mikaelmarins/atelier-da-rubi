"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { ArrowLeft, Save, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import Link from "next/link"
import { useRouter } from "next/navigation"
import ImageUpload from "@/components/admin/image-upload"
import { ProductServiceSupabase } from "@/lib/product-service"
import AuthGuard from "@/components/auth/auth-guard"
import { supabase } from "@/lib/supabase"
import DetailsEditor from "@/components/admin/details-editor"

type Category = { id: number; name: string }

const tamanhos = ["RN", "P", "M", "G", "1 ano", "2 anos", "Berço Padrão", "Mini Berço", "Único"]

function NewProductPageContent() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [imageFiles, setImageFiles] = useState<File[]>([])

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    category_id: null as number | null,
    featured: false,
    details: {
      material: "",
      tamanhos: [] as string[],
      cuidados: "",
      tempo_producao: "",
    } as Record<string, any>,
    weight: "",
    height: "",
    width: "",
    length: "",
    is_customizable: false,
  })

  useEffect(() => {
    const loadCategories = async () => {
      const { data } = await supabase.from("categories").select("id, name").order("name")
      if (data) setCategories(data)
    }
    loadCategories()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (imageFiles.length === 0) {
      alert("Adicione pelo menos uma imagem do produto")
      return
    }

    if (!formData.name || !formData.description || !formData.price || !formData.category_id) {
      alert("Preencha todos os campos obrigatórios")
      return
    }

    setLoading(true)

    try {
      const product = await ProductServiceSupabase.createProduct({
        ...formData,
        price: Number(formData.price),
        weight: Number(formData.weight) || 0,
        height: Number(formData.height) || 0,
        width: Number(formData.width) || 0,
        length: Number(formData.length) || 0
      }, imageFiles)

      if (product) {
        alert("Produto criado com sucesso!")
        router.push("/admin/products")
      } else {
        alert("Erro ao criar produto")
      }
    } catch (error) {
      console.error("Error creating product:", error)
      alert("Erro ao criar produto: " + (error instanceof Error ? error.message : "Erro desconhecido"))
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleCategoryChange = (value: string) => {
    const categoryId = Number(value)
    const category = categories.find(c => c.id === categoryId)
    setFormData(prev => ({
      ...prev,
      category_id: categoryId,
      category: category?.name || ""
    }))
  }

  const handleDetailsChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      details: {
        ...prev.details,
        [field]: value,
      },
    }))
  }

  const handleTamanhosChange = (tamanho: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      details: {
        ...prev.details,
        tamanhos: checked
          ? [...(prev.details.tamanhos || []), tamanho]
          : (prev.details.tamanhos || []).filter((t: string) => t !== tamanho),
      },
    }))
  }

  const handleDynamicDetailsChange = (newDetails: Record<string, any>) => {
    setFormData(prev => ({
      ...prev,
      details: {
        ...prev.details,
        ...newDetails
      }
    }))
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 pt-24">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <Button asChild variant="ghost">
            <Link href="/admin/products">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Novo Produto</h1>
            <p className="text-gray-600">Adicione um novo produto ao catálogo</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Imagens do Produto</CardTitle>
            </CardHeader>
            <CardContent>
              <ImageUpload onImagesChange={setImageFiles} maxImages={5} existingImages={[]} />
            </CardContent>
          </Card>

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
                  value={formData.description}
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
                    name="weight"
                    type="number"
                    step="0.001"
                    value={formData.weight}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height">Altura (cm)</Label>
                  <Input
                    id="height"
                    name="height"
                    type="number"
                    value={formData.height}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="width">Largura (cm)</Label>
                  <Input
                    id="width"
                    name="width"
                    type="number"
                    value={formData.width}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="length">Comprimento (cm)</Label>
                  <Input
                    id="length"
                    name="length"
                    type="number"
                    value={formData.length}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_customizable"
                  checked={formData.is_customizable}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, is_customizable: checked }))}
                />
                <Label htmlFor="is_customizable">Produto Personalizável (Ex: Nome bordado)</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, featured: checked }))}
                />
                <Label htmlFor="featured">Destaque na Home</Label>
              </div>
            </CardContent>
          </Card>

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
                    value={formData.details.material}
                    onChange={(e) => handleDetailsChange("material", e.target.value)}
                    placeholder="Ex: 100% Algodão Premium"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tempo_producao">Tempo de Produção</Label>
                  <Input
                    id="tempo_producao"
                    value={formData.details.tempo_producao}
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
                        checked={(formData.details.tamanhos || []).includes(tamanho)}
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
                  value={formData.details.cuidados}
                  onChange={(e) => handleDetailsChange("cuidados", e.target.value)}
                  placeholder="Ex: Lavar à mão com água fria, secar à sombra"
                  rows={3}
                />
              </div>

              {/* Dynamic Details Editor */}
              <div className="pt-4 border-t">
                <DetailsEditor
                  value={Object.fromEntries(
                    Object.entries(formData.details).filter(([key]) =>
                      !['material', 'tamanhos', 'cuidados', 'tempo_producao'].includes(key)
                    )
                  )}
                  onChange={handleDynamicDetailsChange}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4 justify-end">
            <Button type="button" variant="outline" asChild disabled={loading}>
              <Link href="/admin/products">Cancelar</Link>
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
                  Salvar Produto
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function NewProductPage() {
  return (
    <AuthGuard>
      <NewProductPageContent />
    </AuthGuard>
  )
}
