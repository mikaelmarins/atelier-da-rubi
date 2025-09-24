"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { getProductById } from "@/data/products"

export default function FeaturedCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [itemsPerView, setItemsPerView] = useState(3)
  const [featuredProductIds, setFeaturedProductIds] = useState<number[]>([])

  // Carregar configuração do carrossel
  useEffect(() => {
    const savedCarousel = localStorage.getItem("carousel-products")
    if (savedCarousel) {
      setFeaturedProductIds(JSON.parse(savedCarousel))
    } else {
      // IDs padrão do carrossel
      setFeaturedProductIds([1, 2, 3, 4, 5])
    }
  }, [])

  // Buscar produtos específicos pelos IDs configurados
  const featuredItems = featuredProductIds.map((id) => getProductById(id)).filter(Boolean)

  // Responsive items per view
  useEffect(() => {
    const updateItemsPerView = () => {
      if (window.innerWidth >= 1280) {
        setItemsPerView(4) // xl screens
      } else if (window.innerWidth >= 1024) {
        setItemsPerView(3) // lg screens
      } else if (window.innerWidth >= 768) {
        setItemsPerView(2) // md screens
      } else {
        setItemsPerView(1) // sm screens
      }
    }

    updateItemsPerView()
    window.addEventListener("resize", updateItemsPerView)
    return () => window.removeEventListener("resize", updateItemsPerView)
  }, [])

  // Auto-rotate carousel
  useEffect(() => {
    if (!isHovered && featuredItems.length > 0) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => {
          const maxIndex = Math.max(0, featuredItems.length - itemsPerView)
          return prev >= maxIndex ? 0 : prev + 1
        })
      }, 4000) // Change slide every 4 seconds

      return () => clearInterval(interval)
    }
  }, [isHovered, featuredItems.length, itemsPerView])

  const nextSlide = () => {
    const maxIndex = Math.max(0, featuredItems.length - itemsPerView)
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1))
  }

  const prevSlide = () => {
    const maxIndex = Math.max(0, featuredItems.length - itemsPerView)
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1))
  }

  if (featuredItems.length === 0) {
    return null
  }

  const maxIndex = Math.max(0, featuredItems.length - itemsPerView)

  return (
    <section className="py-20 bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-dancing font-bold text-gray-800 mb-6">Peças em Destaque</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Conheça algumas das nossas criações mais especiais, cada uma feita com carinho e atenção aos detalhes.
          </p>
        </motion.div>

        <div
          className="relative max-w-7xl mx-auto"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Enhanced Desktop Carousel */}
          <div className="hidden md:block overflow-hidden">
            <motion.div
              className="flex gap-6"
              animate={{
                x: `${-currentIndex * (100 / itemsPerView)}%`,
              }}
              transition={{
                duration: 0.8,
                ease: "easeInOut",
              }}
              style={{
                width: `${(featuredItems.length / itemsPerView) * 100}%`,
              }}
            >
              {featuredItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  className="group"
                  style={{
                    width: `${100 / featuredItems.length}%`,
                    minWidth: `${100 / itemsPerView}%`,
                  }}
                  whileHover={{ y: -8 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden relative h-full">
                    <div className="relative overflow-hidden">
                      <div className="aspect-square">
                        <Image
                          src={item.images[0] || "/placeholder.svg"}
                          alt={item.name}
                          width={400}
                          height={400}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          loading="lazy"
                        />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end justify-center pb-4">
                        <Button asChild size="sm" className="bg-white text-gray-800 hover:bg-gray-100 shadow-lg">
                          <Link href={`/catalogo/${item.id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            Ver Detalhes
                          </Link>
                        </Button>
                      </div>

                      {/* Product badge */}
                      {item.featured && (
                        <div className="absolute top-3 left-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
                          Destaque
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <h3 className="font-semibold text-lg mb-2 text-gray-800 line-clamp-2 group-hover:text-pink-600 transition-colors">
                        {item.name}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-yellow-600">{item.price}</span>
                        <Button
                          asChild
                          size="sm"
                          variant="outline"
                          className="border-yellow-300 text-yellow-600 hover:bg-yellow-50 bg-transparent group-hover:border-yellow-500 transition-colors"
                        >
                          <Link href={`/catalogo/${item.id}`}>Ver Mais</Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Enhanced Mobile Carousel */}
          <div className="md:hidden">
            <div className="relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden"
                >
                  <div className="aspect-square relative">
                    <Image
                      src={featuredItems[currentIndex].images[0] || "/placeholder.svg"}
                      alt={featuredItems[currentIndex].name}
                      width={400}
                      height={400}
                      className="w-full h-full object-cover"
                      priority
                    />
                    {featuredItems[currentIndex].featured && (
                      <div className="absolute top-3 left-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
                        Destaque
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="font-semibold text-lg text-gray-800 mb-2">{featuredItems[currentIndex].name}</h3>
                    <p className="text-gray-600 text-sm mb-3">{featuredItems[currentIndex].description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-yellow-600">{featuredItems[currentIndex].price}</span>
                      <Button
                        asChild
                        size="sm"
                        variant="outline"
                        className="border-yellow-300 text-yellow-600 hover:bg-yellow-50 bg-transparent"
                      >
                        <Link href={`/catalogo/${featuredItems[currentIndex].id}`}>Ver Mais</Link>
                      </Button>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Enhanced Navigation Buttons */}
          {maxIndex > 0 && (
            <>
              <Button
                variant="outline"
                size="icon"
                className="absolute left-2 md:left-4 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm border-yellow-200 hover:bg-yellow-50 transition-all duration-300 shadow-lg w-10 h-10 md:w-12 md:h-12"
                onClick={prevSlide}
              >
                <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" />
              </Button>

              <Button
                variant="outline"
                size="icon"
                className="absolute right-2 md:right-4 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm border-yellow-200 hover:bg-yellow-50 transition-all duration-300 shadow-lg w-10 h-10 md:w-12 md:h-12"
                onClick={nextSlide}
              >
                <ChevronRight className="h-4 w-4 md:h-5 md:w-5" />
              </Button>
            </>
          )}

          {/* Enhanced Dots Indicator */}
          <div className="flex justify-center mt-8 space-x-2">
            {Array.from({ length: maxIndex + 1 }).map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex ? "bg-yellow-500 scale-125 shadow-lg" : "bg-yellow-200 hover:bg-yellow-300"
                }`}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </div>
        </div>

        <div className="text-center mt-12">
          <Button
            asChild
            size="lg"
            className="bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-white px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Link href="/catalogo">Ver Catálogo Completo</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
