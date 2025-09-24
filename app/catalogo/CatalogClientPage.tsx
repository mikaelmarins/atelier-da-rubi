"use client"

import CatalogGrid from "@/components/catalog-grid"
import { useEffect } from "react"

export default function CatalogClientPage() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 pt-24">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-dancing font-bold text-gray-800 mb-6">Nosso Catálogo</h1>
          <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-yellow-600 mx-auto rounded-full mb-6"></div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Descubra nossa coleção completa de bordados infantis únicos. Cada peça é criada com carinho e atenção aos
            detalhes.
          </p>
        </div>
        <CatalogGrid />
      </div>
    </main>
  )
}
