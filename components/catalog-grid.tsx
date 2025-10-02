"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Eye, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import Image from "next/image"
import { useProducts } from "@/hooks/use-products"

const categories = [
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

export default function CatalogGrid() {
  const { products, loading } = useProducts()
  const [selectedCategory, setSelectedCategory] = useState("todos")

  const filteredItems =
    selectedCategory === "todos" ? products : products.filter((p) => p.category === selectedCategory)

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Carregando produtos...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-4 mb-8 p-4 sm:p-6 bg-white rounded-2xl shadow-lg border border-yellow-200">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-yellow-600" />
          <span className="font-medium text-gray-700">Filtros:</span>
        </div>

        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Categoria" />
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {filteredItems.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
          >
            <div className="relative overflow-hidden">
              <div className="aspect-square">
                <Image
                  src={item.images[0]?.image_url || "/placeholder.svg"}
                  alt={item.name}
                  width={400}
                  height={400}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Button asChild size="sm" className="bg-white text-gray-800 hover:bg-gray-100">
                    <Link href={`/catalogo/${item.id}`}>
                      <Eye className="h-4 w-4 mr-2" />
                      Ver
                    </Link>
                  </Button>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-6">
              <h3 className="font-semibold text-lg mb-2 text-gray-800 line-clamp-2">{item.name}</h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{item.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xl sm:text-2xl font-bold text-yellow-600">{item.price}</span>
                <Button
                  asChild
                  size="sm"
                  className="bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-white"
                >
                  <Link href={`/catalogo/${item.id}`}>Ver Detalhes</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Nenhum produto encontrado nesta categoria.</p>
        </div>
      )}
    </div>
  )
}
