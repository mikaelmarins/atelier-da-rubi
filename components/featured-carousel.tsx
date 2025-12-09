"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Eye, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { useProducts } from "@/hooks/use-products"
import { formatCurrency } from "@/lib/utils"
import { supabase } from "@/lib/supabase"

export default function FeaturedCarousel() {
  const { products } = useProducts()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0) // -1 left, 1 right
  const [featuredProductIds, setFeaturedProductIds] = useState<number[]>([])
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  // Ref para o timer do auto-advance
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const SLIDE_DURATION = 5000

  const minSwipeDistance = 50

  useEffect(() => {
    const loadCarouselConfig = async () => {
      try {
        // 1. Tentar carregar do Supabase (prioridade máxima)
        const { data, error } = await supabase
          .from("carousel_config")
          .select("product_id")
          .order("display_order")

        if (data && data.length > 0) {
          setFeaturedProductIds(data.map((item) => item.product_id))
          return
        }
      } catch (error) {
        console.error("Error loading carousel from Supabase:", error)
      }

      // 2. Fallback para localStorage
      const savedCarousel = localStorage.getItem("carousel-products")
      if (savedCarousel) {
        try {
          setFeaturedProductIds(JSON.parse(savedCarousel))
          return
        } catch (error) {
          console.error("Error parsing localStorage carousel:", error)
        }
      }

      // 3. Fallback final: produtos marcados como destaque no banco
      setFeaturedProductIds(products.filter((p) => p.featured).map((p) => p.id))
    }

    loadCarouselConfig()
  }, [products])

  const featuredItems = featuredProductIds
    .map((id) => products.find((product) => product.id === id))
    .filter((item): item is NonNullable<typeof item> => item !== undefined)

  // Função para reiniciar o timer
  const resetTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    if (featuredItems.length > 1) {
      timerRef.current = setInterval(() => {
        setDirection(1)
        setCurrentIndex((prev) => (prev + 1) % featuredItems.length)
      }, SLIDE_DURATION)
    }
  }, [featuredItems.length])

  // Inicializar e limpar o timer
  useEffect(() => {
    resetTimer()
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [resetTimer])

  const nextSlide = useCallback(() => {
    if (featuredItems.length === 0) return
    setDirection(1)
    setCurrentIndex((prev) => (prev + 1) % featuredItems.length)
    resetTimer() // Reinicia o timer ao clicar
  }, [featuredItems.length, resetTimer])

  const prevSlide = useCallback(() => {
    if (featuredItems.length === 0) return
    setDirection(-1)
    setCurrentIndex((prev) => (prev - 1 + featuredItems.length) % featuredItems.length)
    resetTimer() // Reinicia o timer ao clicar
  }, [featuredItems.length, resetTimer])

  const goToSlide = useCallback((index: number) => {
    setDirection(index > currentIndex ? 1 : -1)
    setCurrentIndex(index)
    resetTimer() // Reinicia o timer ao clicar
  }, [currentIndex, resetTimer])

  // Touch handlers
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe) nextSlide()
    else if (isRightSwipe) prevSlide()
  }

  if (featuredItems.length === 0) {
    return null
  }

  const getVisibleItems = () => {
    const items = []
    for (let i = 0; i < 3; i++) {
      const index = (currentIndex + i) % featuredItems.length
      items.push({ item: featuredItems[index], position: i })
    }
    return items
  }

  // Variantes de animação mais suaves
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? "100%" : "-100%",
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? "100%" : "-100%",
      opacity: 0,
    }),
  }

  // Transição suave com fade
  const fadeVariants = {
    enter: {
      opacity: 0,
      scale: 0.95,
    },
    center: {
      opacity: 1,
      scale: 1,
    },
    exit: {
      opacity: 0,
      scale: 1.05,
    },
  }

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <div className="container mx-auto px-4 max-w-full overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12 md:mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-dancing font-bold text-gray-800 mb-4 md:mb-6">
            Peças em Destaque
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-sm md:text-base px-4">
            Conheça algumas das nossas criações mais especiais, cada uma feita com carinho e atenção aos detalhes.
          </p>
        </motion.div>

        {/* Mobile Carousel */}
        <div
          className="md:hidden relative"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div className="relative overflow-hidden mx-2">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={fadeVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  opacity: { duration: 0.3 },
                  scale: { duration: 0.3 },
                }}
                className="w-full"
              >
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden mx-auto" style={{ maxWidth: "calc(100vw - 2rem)" }}>
                  {/* Image */}
                  <div className="relative aspect-square w-full">
                    <Image
                      src={featuredItems[currentIndex].images[0]?.image_url || "/placeholder.svg"}
                      alt={featuredItems[currentIndex].name}
                      fill
                      className="object-cover"
                      priority
                    />
                    {featuredItems[currentIndex].featured && (
                      <div className="absolute top-3 left-3 bg-gradient-to-r from-yellow-400 to-amber-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                        ⭐ Destaque
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4 space-y-2">
                    <h3 className="font-bold text-lg text-gray-800 line-clamp-1">
                      {featuredItems[currentIndex].name}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {featuredItems[currentIndex].description}
                    </p>
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xl font-bold text-yellow-600">
                        {formatCurrency(Number(featuredItems[currentIndex].price))}
                      </span>
                      <Button
                        asChild
                        size="sm"
                        className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white rounded-full px-4"
                      >
                        <Link href={`/catalogo/${featuredItems[currentIndex].id}`}>
                          <Eye className="h-4 w-4 mr-1" />
                          Ver
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Mobile Navigation Arrows */}
          {featuredItems.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-0 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 rounded-full shadow flex items-center justify-center text-gray-600 hover:bg-white transition-all z-10"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-0 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 rounded-full shadow flex items-center justify-center text-gray-600 hover:bg-white transition-all z-10"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          {/* Mobile Dots */}
          <div className="flex justify-center mt-4 gap-1.5">
            {featuredItems.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`transition-all duration-300 rounded-full ${index === currentIndex
                  ? "w-6 h-2 bg-pink-500"
                  : "w-2 h-2 bg-gray-300"
                  }`}
              />
            ))}
          </div>
        </div>

        {/* Desktop Carousel */}
        <div className="hidden md:block relative">
          <div className="max-w-6xl mx-auto px-12">
            <div className="grid grid-cols-3 gap-6 lg:gap-8">
              <AnimatePresence mode="popLayout">
                {getVisibleItems().map(({ item, position }) => (
                  <motion.div
                    key={`${item.id}-${currentIndex}-${position}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4, delay: position * 0.05 }}
                    className="group"
                  >
                    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden h-full flex flex-col">
                      {/* Image */}
                      <div className="relative aspect-square overflow-hidden">
                        <Image
                          src={item.images[0]?.image_url || "/placeholder.svg"}
                          alt={item.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
                          <Button
                            asChild
                            size="sm"
                            className="bg-white text-gray-800 hover:bg-gray-100 shadow-lg rounded-full"
                          >
                            <Link href={`/catalogo/${item.id}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              Ver Detalhes
                            </Link>
                          </Button>
                        </div>

                        {item.featured && (
                          <div className="absolute top-3 left-3 bg-gradient-to-r from-yellow-400 to-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                            ⭐ Destaque
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-5 flex-1 flex flex-col">
                        <h3 className="font-bold text-lg mb-2 text-gray-800 line-clamp-2 group-hover:text-pink-600 transition-colors">
                          {item.name}
                        </h3>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-1">
                          {item.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xl font-bold text-yellow-600">
                            {formatCurrency(Number(item.price))}
                          </span>
                          <Button
                            asChild
                            size="sm"
                            variant="outline"
                            className="border-pink-300 text-pink-600 hover:bg-pink-50 rounded-full"
                          >
                            <Link href={`/catalogo/${item.id}`}>
                              <ShoppingBag className="h-4 w-4 mr-1" />
                              Ver
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Desktop Navigation Arrows */}
          {featuredItems.length > 3 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-2 lg:left-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:scale-105 transition-all z-10"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-2 lg:right-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:scale-105 transition-all z-10"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          {/* Desktop Dots */}
          <div className="flex justify-center mt-8 gap-2">
            {featuredItems.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`transition-all duration-300 rounded-full ${index === currentIndex
                  ? "w-8 h-2.5 bg-pink-500"
                  : "w-2.5 h-2.5 bg-gray-300 hover:bg-pink-300"
                  }`}
              />
            ))}
          </div>
        </div>

        {/* CTA Button */}
        <div className="text-center mt-10 md:mt-14">
          <Button
            asChild
            size="lg"
            className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white px-6 md:px-10 py-5 md:py-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 text-sm md:text-lg"
          >
            <Link href="/catalogo">
              <ShoppingBag className="h-5 w-5 mr-2" />
              Ver Catálogo Completo
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
