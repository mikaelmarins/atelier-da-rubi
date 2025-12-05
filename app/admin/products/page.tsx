"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Plus, Search, Filter, Star, Eye, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatCurrency } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import Image from "next/image"
import AuthGuard from "@/components/auth/auth-guard"
import { useProducts } from "@/hooks/use-products"
import { ProductServiceSupabase } from "@/lib/product-service"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

type Category = { id: number; name: string; slug: string }

const ITEMS_PER_PAGE = 12

function ProductsListPageContent() {
  const { products, loading, refresh } = useProducts()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("todos")
  const [categories, setCategories] = useState<Category[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [deleting, setDeleting] = useState<number | null>(null)
  const { toast } = useToast()

  // Carregar categorias do Supabase
  useEffect(() => {
    const loadCategories = async () => {
      const { data } = await supabase
        .from("categories")
        .select("id, name, slug")
        .order("name")
      if (data) setCategories(data)
    }
    loadCategories()
  }, [])

  const filteredProducts = products
    .filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === "todos" ||
        p.category === selectedCategory ||
        p.category_id?.toString() === selectedCategory
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  // Paginação
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  // Reset página quando filtro mudar
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedCategory])

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Tem certeza que deseja excluir "${name}"?`)) return

    setDeleting(id)
    try {
      await ProductServiceSupabase.deleteProduct(id)
      toast({
        title: "Produto excluído",
        description: `"${name}" foi removido com sucesso.`,
      })
      refresh()
    } catch (error) {
      console.error("Error deleting product:", error)
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir o produto. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setDeleting(null)
    }
  }

  // Encontrar nome da categoria
  const getCategoryLabel = (product: typeof products[0]) => {
    if (product.category_id) {
      const cat = categories.find(c => c.id === product.category_id)
      if (cat) return cat.name
    }
    // Fallback para category string
    const cat = categories.find(c => c.slug === product.category || c.name === product.category)
    return cat?.name || product.category || "Sem categoria"
  }

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
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800">Gerenciar Produtos</h1>
            <p className="text-gray-600 mt-2">
              {filteredProducts.length} {filteredProducts.length === 1 ? "produto" : "produtos"} encontrados
            </p>
          </div>

          <Button asChild className="bg-pink-500 hover:bg-pink-600">
            <Link href="/admin/products/new">
              <Plus className="h-4 w-4 mr-2" />
              Novo Produto
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar produtos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="w-full md:w-64">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todas as Categorias</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products Grid */}
        {paginatedProducts.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Nenhum produto encontrado</h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm || selectedCategory !== "todos"
                    ? "Tente ajustar os filtros de busca"
                    : "Comece criando seu primeiro produto"}
                </p>
                {!searchTerm && selectedCategory === "todos" && (
                  <Button asChild className="bg-pink-500 hover:bg-pink-600">
                    <Link href="/admin/products/new">
                      <Plus className="h-4 w-4 mr-2" />
                      Criar Primeiro Produto
                    </Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {paginatedProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group">
                    <div className="relative aspect-square">
                      <Image
                        src={product.images[0]?.image_url || "/placeholder.svg"}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {product.featured && (
                        <div className="absolute top-2 right-2 bg-yellow-500 text-white p-2 rounded-full">
                          <Star className="h-4 w-4 fill-current" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                        <Button asChild size="sm" variant="secondary">
                          <Link href={`/catalogo/${product.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button asChild size="sm" variant="secondary">
                          <Link href={`/admin/products/${product.id}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>

                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg mb-1 line-clamp-1">{product.name}</h3>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{product.description}</p>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xl font-bold text-yellow-600">{formatCurrency(Number(product.price))}</span>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {getCategoryLabel(product)}
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <Button asChild variant="outline" size="sm" className="flex-1 bg-transparent">
                          <Link href={`/admin/products/${product.id}/edit`}>
                            <Edit className="h-3 w-3 mr-1" />
                            Editar
                          </Link>
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(product.id, product.name)}
                          disabled={deleting === product.id}
                          className="flex-1"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          {deleting === product.id ? "..." : "Excluir"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className={currentPage === page ? "bg-pink-500 hover:bg-pink-600" : ""}
                    >
                      {page}
                    </Button>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default function ProductsListPage() {
  return (
    <AuthGuard>
      <ProductsListPageContent />
    </AuthGuard>
  )
}
