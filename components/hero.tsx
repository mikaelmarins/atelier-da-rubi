"use client"

import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Heart } from "lucide-react"

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-20 left-10 w-4 h-4 bg-pink-300 rounded-full opacity-60"
          animate={{
            y: [0, -20, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 4,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-40 right-20 w-6 h-6 bg-purple-300 rounded-full opacity-50"
          animate={{
            y: [0, 30, 0],
            x: [0, 10, 0],
          }}
          transition={{
            duration: 5,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-40 left-20 w-3 h-3 bg-blue-300 rounded-full opacity-70"
          animate={{
            rotate: [0, 360],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 6,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Floating Hearts Effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            initial={{
              x: Math.random() * (typeof window !== "undefined" ? window.innerWidth : 1200),
              y: typeof window !== "undefined" ? window.innerHeight + 50 : 800,
              opacity: 0,
              scale: 0,
            }}
            animate={{
              y: -100,
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
              rotate: [0, 360],
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              delay: i * 0.5,
              repeat: Number.POSITIVE_INFINITY,
              repeatDelay: 3,
            }}
          >
            <Heart className="h-6 w-6 text-pink-300 fill-current" />
          </motion.div>
        ))}
      </div>

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
            className="flex justify-center mb-6"
          >
            <Sparkles className="h-12 w-12 text-pink-400" />
          </motion.div>

          <h1 className="text-5xl md:text-7xl font-dancing font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 mb-6">
            Atelier da Rubi
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 mb-4 font-light">Bordados infantis únicos e delicados</p>

          <p className="text-lg text-gray-500 mb-8 max-w-2xl mx-auto">
            Criados com amor e carinho pela <span className="text-pink-500 font-medium">Rubiana Lima</span> em Arraial
            do Cabo. Cada peça é uma obra de arte feita especialmente para seu pequeno.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 text-white px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Link href="/catalogo">Ver Catálogo</Link>
            </Button>

            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-pink-300 text-pink-600 hover:bg-pink-50 px-8 py-3 rounded-full bg-transparent"
            >
              <Link href="#sobre">Conhecer História</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
