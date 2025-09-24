"use client"

import type React from "react"

import { useState } from "react"
import { ArrowLeft, Save, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import { useRouter } from "next/navigation"
import ImageUpload from "@/components/admin/image-upload"
import type { CreateProductData } from "@/lib/product-service"

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

export default function NewProductPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState<string[]>([])
  const [formData, setFormData] = useState<CreateProductData>({
    name: "",
    description: "",
    price: "",
    category: "",
    featured: false,
    details: {
      material: "",
      tamanhos: [],
      cuidados: "",
      tempo_producao: "",
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (images.length === 0) {
      alert("Adicione pelo menos uma imagem do produto")
      return
    }

    if (!formData.name || !formData.description || !formData.price || !formData.category) {
      alert("Preencha todos os campos obrigatórios")
      return
    }

    setLoading(true)

    try {
      // Como as imagens já foram uploadadas pelo ImageUpload,
      // vamos criar o produto com as URLs das imagens
      const productData = {
        ...formData,
        images,
      }

      // Simular criação do produto (em um app real, isso seria uma API call)
      const newProduct = {
        id: Date.now(),
        ...productData,
      }

      // Salvar no localStorage para demonstração
      const existingProducts = JSON.parse(localStorage.getItem("atelier-products") || "[]")
      existingProducts.push(newProduct)
      localStorage.setItem("atelier-products", JSON.stringify(existingProducts))

      alert("Produto criado com sucesso!")
      router.push("/admin")
    } catch (error) {
      console.error("Error creating product:", error)
      alert("Erro ao criar produto")
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
        tamanhos: checked ? [...prev.details.tamanhos, tamanho] : prev.details.tamanhos.filter((t) => t !== tamanho),
      },
    }))
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
            <h1 className="text-3xl font-dancing font-bold text-gray-800">Novo Produto</h1>
            <p className="text-gray-600">Adicione um novo produto ao catálogo</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Imagens */}
          <Card>
            <CardHeader>
              <CardTitle>Imagens do Produto</CardTitle>
            </CardHeader>
            <CardContent>
              <ImageUpload onImagesUploaded={setImages} maxImages={5} existingImages={images} />
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
                <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
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
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Descreva o produto..."
                  rows={4}
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="featured"
                  checked={formData.featured}
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
                        checked={formData.details.tamanhos.includes(tamanho)}
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
