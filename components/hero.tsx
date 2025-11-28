"use client"

import { Button } from "@/components/ui/button"
import { Sparkles, Heart } from 'lucide-react'
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"
import Image from "next/image"

const HERO_IMAGES = [
  "/hero/hero-1.jpg",
  "/hero/hero-2.jpg",
  "/hero/hero-3.jpg",
  "/hero/hero-4.jpg",
]

export default function Hero() {
  const [currentImage, setCurrentImage] = useState(0)

  const [mounted, setMounted] = useState(false)
  const [heartPositions, setHeartPositions] = useState<{ x: number; y: number; delay: number }[]>([])

  useEffect(() => {
    setMounted(true)
    const positions = Array.from({ length: 12 }, (_, i) => ({
      x: Math.random() * 100,
      y: 110,
      delay: i * 0.8,
    }))
    setHeartPositions(positions)
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % HERO_IMAGES.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Carousel */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentImage}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0"
          >
            <Image
              src={HERO_IMAGES[currentImage]}
              alt="Atelier da Rubi Bordados"
              fill
              className="object-cover"
              priority
            />
            {/* Overlay Gradient for readability */}
            <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px]" />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Floating Hearts Animation */}
      {mounted && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          {heartPositions.map((pos, i) => (
            <motion.div
              key={i}
              className="absolute text-pink-300/60"
              initial={{ left: `${pos.x}%`, top: `${pos.y}%`, opacity: 0, scale: 0 }}
              animate={{
                top: "-10%",
                opacity: [0, 1, 0],
                scale: [0.5, 1.2, 0.5],
                rotate: [0, 360],
              }}
              transition={{
                duration: 8 + Math.random() * 5,
                delay: pos.delay,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              }}
            >
              <Heart className="w-6 h-6 fill-current" />
            </motion.div>
          ))}
        </div>
      )}

      <div className="container mx-auto px-4 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex justify-center mb-6 gap-4"
          >
            <div className="relative h-24 w-24 md:h-32 md:w-32">
              <Image
                src="/logo.png"
                alt="Logo Atelier da Rubi"
                fill
                className="object-contain drop-shadow-md"
                priority
              />
            </div>
          </motion.div>

          <h1 className="text-5xl md:text-7xl font-dancing font-bold text-gray-800 mb-6 drop-shadow-sm">
            Atelier da Rubi
          </h1>

          <p className="text-xl md:text-3xl text-gray-700 mb-4 font-light">
            Bordados infantis únicos e delicados
          </p>

          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto font-medium">
            Criados com amor e carinho pela <span className="text-pink-600">Rubiana Lima</span> em Arraial
            do Cabo. Cada peça é uma obra de arte feita especialmente para seu pequeno.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              asChild
              size="lg"
              className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Link href="/catalogo">Ver Catálogo Completo</Link>
            </Button>

            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-2 border-pink-400 text-pink-600 hover:bg-pink-50 px-8 py-6 text-lg rounded-full bg-white/80 backdrop-blur-sm"
            >
              <Link href="#sobre">Conhecer História</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section >
  )
}
