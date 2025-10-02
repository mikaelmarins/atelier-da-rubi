"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, Share2, ShoppingCart, X, ChevronLeft, ChevronRight, ZoomIn, Maximize2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import Link from "next/link"
import Image from "next/image"
import { useProduct } from "@/hooks/use-products"
import { ProductService } from "@/lib/product-service"
import { useRouter } from "next/navigation"

type Props = {
  productId: number
}

export default function ProductDetail({ productId }: Props) {
  const router = useRouter()
  const { product, loading } = useProduct(productId)
  const [selectedImage, setSelectedImage] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isZoomed, setIsZoomed] = useState(false)
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 })
  const [relatedProducts, setRelatedProducts] = useState<any[]>([])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [productId])

  useEffect(() => {
    if (product) {
      const related = ProductService.getProductsByCategory(product.category)
        .filter((p) => p.id !== productId)
        .slice(0, 3)
      setRelatedProducts(related)
    }
  }, [product, productId])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Carregando produto...</p>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-gray-600 mb-4">Produto não encontrado</p>
        <Button asChild>
          <Link href="/catalogo">Voltar ao Catálogo</Link>
        </Button>
      </div>
    )
  }

  const whatsappNumber = "5522997890934"
  const whatsappMessage = `Olá! Tenho interesse no produto "${product.name}" (${product.price}). Gostaria de mais informações sobre entrega para minha região!`

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % product.images.length)
  }

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + product.images.length) % product.images.length)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setZoomPosition({ x, y })
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.href,
        })
      } catch (error) {
        console.log("Error sharing:", error)
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert("Link copiado para a área de transferência!")
    }
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6 sm:mb-8">
        <Button asChild variant="ghost" size="sm">
          <Link href="/catalogo">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Catálogo
          </Link>
        </Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Images Section */}
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
          <div className="space-y-4">
            <div className="relative group">
              <div
                className="aspect-square bg-white rounded-2xl shadow-lg overflow-hidden cursor-zoom-in relative"
                onMouseMove={handleMouseMove}
                onMouseEnter={() => setIsZoomed(true)}
                onMouseLeave={() => setIsZoomed(false)}
              >
                <Image
                  src={product.images[selectedImage] || "/placeholder.svg"}
                  alt={`${product.name} - Imagem ${selectedImage + 1}`}
                  width={600}
                  height={600}
                  className={`w-full h-full object-cover transition-transform duration-300 ${
                    isZoomed ? "scale-150" : "scale-100"
                  }`}
                  style={isZoomed ? { transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%` } : {}}
                  onClick={() => setIsModalOpen(true)}
                  priority
                />

                <div className="absolute top-4 right-4 bg-black/60 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <ZoomIn className="h-4 w-4" />
                </div>

                {product.images.length > 1 && (
                  <>
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8 sm:w-10 sm:h-10"
                      onClick={prevImage}
                    >
                      <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8 sm:w-10 sm:h-10"
                      onClick={nextImage}
                    >
                      <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </>
                )}

                <Button
                  variant="outline"
                  size="icon"
                  className="absolute top-2 sm:top-4 left-2 sm:left-4 bg-white/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8 sm:w-10 sm:h-10"
                  onClick={() => setIsModalOpen(true)}
                >
                  <Maximize2 className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>

                {product.images.length > 1 && (
                  <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                    {selectedImage + 1}/{product.images.length}
                  </div>
                )}
              </div>
            </div>

            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                      selectedImage === index
                        ? "border-yellow-400 ring-2 ring-yellow-200 scale-105"
                        : "border-gray-200 hover:border-yellow-300"
                    }`}
                    onClick={() => setSelectedImage(index)}
                  >
                    <Image
                      src={image || "/placeholder.svg"}
                      alt={`${product.name} - Miniatura ${index + 1}`}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Product Info */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="space-y-6"
        >
          <div>
            <Badge variant="secondary" className="mb-4 bg-yellow-100 text-yellow-700 border-yellow-200">
              {product.category.charAt(0).toUpperCase() + product.category.slice(1).replace("-", " ")}
            </Badge>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-dancing font-bold text-gray-800 mb-4">
              {product.name}
            </h1>
            <p className="text-3xl sm:text-4xl font-bold text-yellow-600 mb-6">{product.price}</p>
            <p className="text-gray-600 leading-relaxed text-sm sm:text-base">{product.description}</p>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl p-4 border border-blue-200">
            <h3 className="font-semibold text-gray-800 mb-2">🚚 Informações de Entrega</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>
                • <strong>Região dos Lagos:</strong> Entrega gratuita
              </li>
              <li>
                • <strong>Todo o Brasil:</strong> Frete calculado no WhatsApp
              </li>
              <li>
                • <strong>Prazo:</strong> {product.details.tempo_producao}
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <Button asChild size="lg" className="w-full bg-green-500 hover:bg-green-600 text-white">
              <a
                href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Comprar via WhatsApp
              </a>
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent"
              onClick={handleShare}
            >
              <Share2 className="h-5 w-5 mr-2" />
              Compartilhar
            </Button>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg space-y-4 border border-yellow-200">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">Detalhes do Produto</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <span className="font-medium text-gray-700">Material:</span>
                <p className="text-gray-600 text-sm sm:text-base">{product.details.material}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Cuidados:</span>
                <p className="text-gray-600 text-sm sm:text-base">{product.details.cuidados}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Tempo de Produção:</span>
                <p className="text-gray-600 text-sm sm:text-base">{product.details.tempo_producao}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-16"
        >
          <h2 className="text-2xl font-dancing font-bold text-gray-800 mb-8 text-center">Produtos Relacionados</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <Link key={relatedProduct.id} href={`/catalogo/${relatedProduct.id}`}>
                <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
                  <div className="aspect-square relative overflow-hidden">
                    <Image
                      src={relatedProduct.images[0] || "/placeholder.svg"}
                      alt={relatedProduct.name}
                      width={300}
                      height={300}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2 text-gray-800 line-clamp-2">{relatedProduct.name}</h3>
                    <p className="text-xl font-bold text-yellow-600">{relatedProduct.price}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>
      )}

      {/* Image Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-6xl w-full p-0 m-2">
          <div className="relative bg-black">
            <Button
              variant="outline"
              size="icon"
              className="absolute right-2 top-2 z-10 bg-white/80 backdrop-blur-sm w-8 h-8"
              onClick={() => setIsModalOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>

            <div className="aspect-square max-h-[90vh]">
              <Image
                src={product.images[selectedImage] || "/placeholder.svg"}
                alt={`${product.name} - Imagem ampliada`}
                width={1200}
                height={1200}
                className="w-full h-full object-contain"
                priority
              />
            </div>

            {product.images.length > 1 && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur-sm w-10 h-10"
                  onClick={prevImage}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur-sm w-10 h-10"
                  onClick={nextImage}
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </>
            )}

            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-sm px-4 py-2 rounded-full">
              {selectedImage + 1} de {product.images.length}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
