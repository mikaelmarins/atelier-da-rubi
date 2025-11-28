"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, SlidersHorizontal, X, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import Image from "next/image"
import { useProducts } from "@/hooks/use-products"
import { formatCurrency } from "@/lib/utils"

const CATEGORIES = [
  { value: "todos", label: "Todos os Produtos" },
  { value: "jogos-berco", label: "Jogos de Berço" },
  { value: "toalhas", label: "Toalhas RN" },
  { value: "kit-gestante", label: "Kits Gestante" },
  { value: "vestidos", label: "Vestidos" },
  { value: "bodies", label: "Bodies" },
  { value: "macacoes", label: "Macacões" },
  { value: "blusas", label: "Blusas" },
  { value: "conjuntos", label: "Conjuntos" },
]

const SORT_OPTIONS = [
  { value: "newest", label: "Mais Recentes" },
  { value: "price-asc", label: "Preço: Menor para Maior" },
  { value: "price-desc", label: "Preço: Maior para Menor" },
  { value: "name-asc", label: "Nome: A-Z" },
]

export default function CatalogGrid() {
  const { products, loading } = useProducts()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("todos")
  const [sortBy, setSortBy] = useState("newest")
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false)

  // Filter and Sort Logic
  const filteredAndSortedProducts = useMemo(() => {
    let result = [...products]

    // 1. Filter by Category
    if (selectedCategory !== "todos") {
      result = result.filter((p) => p.category === selectedCategory)
    }

    // 2. Filter by Search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query)
      )
    }

    // 3. Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case "price-asc":
          return Number(a.price) - Number(b.price)
        case "price-desc":
          return Number(b.price) - Number(a.price)
        case "name-asc":
          return a.name.localeCompare(b.name)
        case "newest":
        default:
          return b.id - a.id // Assuming higher ID is newer for now
      }
    })

    return result
  }, [products, selectedCategory, searchQuery, sortBy])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mb-4"></div>
        <p className="text-gray-500 font-playfair italic">Carregando peças exclusivas...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Sidebar Filters (Desktop) */}
      <aside className="hidden lg:block w-64 space-y-8 flex-shrink-0">
        <div className="sticky top-24 space-y-8">
          {/* Search */}
          <div className="space-y-3">
            <h3 className="font-playfair font-bold text-xl text-gray-800">Buscar</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar produtos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-white border-pink-100 focus:border-pink-300 focus:ring-pink-200"
              />
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-3">
            <h3 className="font-playfair font-bold text-xl text-gray-800">Categorias</h3>
            <div className="space-y-2">
              {CATEGORIES.map((category) => (
                <button
                  key={category.value}
                  onClick={() => setSelectedCategory(category.value)}
                  className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${selectedCategory === category.value
                      ? "bg-pink-50 text-pink-700 font-medium"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1">
        {/* Mobile Filter Bar */}
        <div className="lg:hidden mb-6 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-white"
            />
          </div>
          <Sheet open={isMobileFiltersOpen} onOpenChange={setIsMobileFiltersOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="flex gap-2 border-pink-200 text-pink-700">
                <SlidersHorizontal className="h-4 w-4" />
                Filtros
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle className="font-playfair text-2xl">Filtros</SheetTitle>
                <SheetDescription>
                  Refine sua busca por produtos.
                </SheetDescription>
              </SheetHeader>
              <div className="py-6 space-y-6">
                <div className="space-y-3">
                  <h3 className="font-medium text-gray-900">Categorias</h3>
                  <div className="space-y-2">
                    {CATEGORIES.map((category) => (
                      <div key={category.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`mobile-${category.value}`}
                          checked={selectedCategory === category.value}
                          onCheckedChange={() => {
                            setSelectedCategory(category.value)
                            setIsMobileFiltersOpen(false)
                          }}
                        />
                        <Label htmlFor={`mobile-${category.value}`} className="text-base font-normal cursor-pointer">
                          {category.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Sort & Results Count */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <p className="text-gray-500 text-sm">
            Mostrando <span className="font-medium text-gray-900">{filteredAndSortedProducts.length}</span> produtos
          </p>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 hidden sm:inline">Ordenar por:</span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px] bg-white border-gray-200">
                <SelectValue placeholder="Ordenar" />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
          <AnimatePresence mode="popLayout">
            {filteredAndSortedProducts.map((product) => (
              <motion.div
                layout
                key={product.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <Link href={`/catalogo/${product.id}`} className="group block h-full">
                  <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 h-full flex flex-col">
                    {/* Image Container */}
                    <div className="relative aspect-[4/5] overflow-hidden bg-gray-100">
                      <Image
                        src={product.images[0]?.image_url || "/placeholder.svg"}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      {/* Quick Action Overlay (Optional - keeping it clean for now, maybe just a badge) */}
                      {product.is_customizable && (
                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-pink-600 shadow-sm">
                          Personalizável
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-5 flex flex-col flex-1">
                      <div className="mb-2">
                        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                          {CATEGORIES.find(c => c.value === product.category)?.label || product.category}
                        </span>
                      </div>
                      <h3 className="font-playfair font-bold text-lg text-gray-900 mb-2 group-hover:text-pink-600 transition-colors line-clamp-2">
                        {product.name}
                      </h3>
                      <p className="text-gray-500 text-sm line-clamp-2 mb-4 flex-1">
                        {product.description}
                      </p>
                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                        <span className="font-playfair font-bold text-xl text-gray-900">
                          {formatCurrency(Number(product.price))}
                        </span>
                        <span className="text-sm font-medium text-pink-600 group-hover:translate-x-1 transition-transform">
                          Ver Detalhes →
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {filteredAndSortedProducts.length === 0 && (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-200">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhum produto encontrado</h3>
            <p className="text-gray-500">
              Tente ajustar seus filtros ou buscar por outro termo.
            </p>
            <Button
              variant="link"
              className="mt-4 text-pink-600"
              onClick={() => {
                setSearchQuery("")
                setSelectedCategory("todos")
              }}
            >
              Limpar todos os filtros
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
