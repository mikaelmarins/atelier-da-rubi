"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, Share2, ShoppingCart, X, ChevronLeft, ChevronRight, ZoomIn, MessageCircle, Truck, ShieldCheck, Ruler } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import Image from "next/image"
import { useProduct, useProducts } from "@/hooks/use-products"
import { formatCurrency } from "@/lib/utils"
import { useCart } from "@/context/cart-context"
import { useToast } from "@/hooks/use-toast"

type Props = {
  productId: number
}

export default function ProductDetail({ productId }: Props) {
  const { product, loading } = useProduct(productId)
  const { products } = useProducts()
  const { addToCart } = useCart()
  const { toast } = useToast()

  const [selectedImage, setSelectedImage] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [relatedProducts, setRelatedProducts] = useState<any[]>([])
  const [customizationName, setCustomizationName] = useState("")

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [productId])

  useEffect(() => {
    if (product && products.length > 0) {
      const related = products
        .filter((p) => p.category === product.category && p.id !== productId)
        .slice(0, 4)
      setRelatedProducts(related)
    }
  }, [product, products, productId])

  const handleAddToCart = () => {
    if (product) {
      if (product.is_customizable && !customizationName.trim()) {
        toast({
          title: "Personalização necessária",
          description: "Por favor, informe o nome para o bordado.",
          variant: "destructive"
        })
        return
      }

      addToCart(product, 1, customizationName)
      toast({
        title: "Produto adicionado!",
        description: `${product.name} foi adicionado ao seu carrinho.`,
      })
      setCustomizationName("")
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.name,
          text: product?.description,
          url: window.location.href,
        })
      } catch (error) {
        console.log("Error sharing:", error)
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast({ title: "Link copiado!", description: "Link copiado para a área de transferência." })
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-24 text-center min-h-[60vh] flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mb-4"></div>
        <p className="text-gray-500 font-playfair italic">Carregando detalhes...</p>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <p className="text-gray-600 mb-6 text-lg">Produto não encontrado</p>
        <Button asChild className="bg-pink-500 hover:bg-pink-600">
          <Link href="/catalogo">Voltar ao Catálogo</Link>
        </Button>
      </div>
    )
  }

  const whatsappNumber = "5522997890934"
  const whatsappMessage = `Olá! Tenho interesse no produto "${product.name}" (${product.price}). Gostaria de mais informações!`

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Breadcrumb / Back */}
      <div className="mb-8">
        <Link href="/catalogo" className="inline-flex items-center text-gray-500 hover:text-pink-600 transition-colors text-sm font-medium">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para o Catálogo
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-16">
        {/* Left Column: Images */}
        <div className="space-y-6">
          {/* Main Image */}
          <div
            className="relative aspect-square bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 shadow-sm group cursor-zoom-in"
            onClick={() => setIsModalOpen(true)}
          >
            <Image
              src={product.images[selectedImage]?.image_url || "/placeholder.svg"}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              priority
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
            <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full text-xs font-medium text-gray-700 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
              Clique para ampliar
            </div>
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
              {product.images.map((img, idx) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(idx)}
                  className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${selectedImage === idx
                      ? "border-pink-500 ring-2 ring-pink-100"
                      : "border-transparent hover:border-gray-200"
                    }`}
                >
                  <Image
                    src={img.image_url}
                    alt={`View ${idx + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Product Info (Sticky) */}
        <div className="lg:sticky lg:top-24 h-fit space-y-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="secondary" className="bg-pink-50 text-pink-700 hover:bg-pink-100 border-pink-100 px-3 py-1">
                {product.category}
              </Badge>
              {product.is_customizable && (
                <Badge variant="outline" className="text-purple-600 border-purple-200 bg-purple-50">
                  Personalizável
                </Badge>
              )}
            </div>

            <h1 className="text-4xl sm:text-5xl font-playfair font-bold text-gray-900 mb-4 leading-tight">
              {product.name}
            </h1>

            <div className="flex items-baseline gap-4 mb-6">
              <span className="text-3xl font-playfair font-bold text-gray-900">
                {formatCurrency(Number(product.price))}
              </span>
              <span className="text-sm text-gray-500">
                Em até 12x no cartão
              </span>
            </div>

            <div className="prose prose-gray text-gray-600 leading-relaxed mb-8">
              <p>{product.description}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-6">
            {/* Customization Input */}
            {product.is_customizable && (
              <div className="space-y-3">
                <Label htmlFor="customization" className="text-base font-medium text-gray-900">
                  Personalização do Bordado
                </Label>
                <div className="relative">
                  <Input
                    id="customization"
                    placeholder="Digite o nome para bordar (Ex: Maria Alice)"
                    value={customizationName}
                    onChange={(e) => setCustomizationName(e.target.value)}
                    className="pl-4 pr-10 py-6 text-lg border-gray-200 focus:border-pink-300 focus:ring-pink-100"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <span className="text-xs">Grátis</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  * Verifique a grafia correta. O nome será bordado exatamente como digitado.
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-3">
              <Button
                size="lg"
                className="w-full bg-pink-600 hover:bg-pink-700 text-white h-14 text-lg font-medium shadow-md hover:shadow-lg transition-all"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Adicionar ao Carrinho
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="w-full border-green-500 text-green-600 hover:bg-green-50 h-12"
                asChild
              >
                <a
                  href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Tirar dúvidas no WhatsApp
                </a>
              </Button>
            </div>
          </div>

          {/* Features / Trust Badges */}
          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <Truck className="h-6 w-6 text-pink-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900 text-sm">Entrega Garantida</h4>
                <p className="text-xs text-gray-500 mt-1">Enviamos para todo o Brasil com segurança.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <ShieldCheck className="h-6 w-6 text-pink-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900 text-sm">Qualidade Premium</h4>
                <p className="text-xs text-gray-500 mt-1">Materiais 100% algodão e acabamento fino.</p>
              </div>
            </div>
          </div>

          {/* Product Details Accordion/List */}
          <div className="border-t border-gray-100 pt-8 space-y-4">
            <h3 className="font-playfair font-bold text-xl text-gray-900">Especificações</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 text-sm">
              <div className="flex justify-between border-b border-gray-50 pb-2">
                <span className="text-gray-500">Material</span>
                <span className="font-medium text-gray-900">{product.material || "Algodão"}</span>
              </div>
              <div className="flex justify-between border-b border-gray-50 pb-2">
                <span className="text-gray-500">Tempo de Produção</span>
                <span className="font-medium text-gray-900">{product.tempo_producao || "7 dias úteis"}</span>
              </div>
              {(product.width > 0 || product.height > 0) && (
                <div className="flex justify-between border-b border-gray-50 pb-2">
                  <span className="text-gray-500">Dimensões</span>
                  <span className="font-medium text-gray-900">
                    {product.height}cm x {product.width}cm
                  </span>
                </div>
              )}
              <div className="col-span-full">
                <span className="block text-gray-500 mb-1">Cuidados</span>
                <p className="text-gray-700">{product.cuidados || "Lavar à mão, não usar alvejante."}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-24 border-t border-gray-100 pt-16">
          <h2 className="text-3xl font-playfair font-bold text-gray-900 mb-8 text-center">
            Você também pode gostar
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((related) => (
              <Link key={related.id} href={`/catalogo/${related.id}`} className="group">
                <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-gray-100">
                  <div className="aspect-square relative bg-gray-100 overflow-hidden">
                    <Image
                      src={related.images[0]?.image_url || "/placeholder.svg"}
                      alt={related.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 line-clamp-1 group-hover:text-pink-600 transition-colors">
                      {related.name}
                    </h3>
                    <p className="text-lg font-bold text-gray-900 mt-1">
                      {formatCurrency(Number(related.price))}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Image Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-5xl w-full p-0 bg-black/95 border-none text-white">
          <div className="relative h-[80vh] w-full flex items-center justify-center">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 text-white hover:bg-white/20 z-50"
              onClick={() => setIsModalOpen(false)}
            >
              <X className="h-6 w-6" />
            </Button>

            <Image
              src={product.images[selectedImage]?.image_url || "/placeholder.svg"}
              alt={product.name}
              fill
              className="object-contain"
              priority
            />

            {product.images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedImage((prev) => (prev - 1 + product.images.length) % product.images.length)
                  }}
                >
                  <ChevronLeft className="h-8 w-8" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedImage((prev) => (prev + 1) % product.images.length)
                  }}
                >
                  <ChevronRight className="h-8 w-8" />
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
