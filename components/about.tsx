"use client"

import { motion } from "framer-motion"
import { Heart, Star, MapPin, Truck } from "lucide-react"
import Image from "next/image"

export default function About() {
  return (
    <section id="sobre" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-dancing font-bold text-gray-800 mb-6">Nossa História</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-pink-400 to-purple-400 mx-auto rounded-full"></div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-pink-200 to-purple-200 rounded-2xl opacity-20"></div>
              <div className="relative rounded-2xl shadow-lg overflow-hidden bg-white">
                <Image
                  src="/placeholder.svg?height=400&width=400"
                  alt="Rubiana Lima bordando no Atelier da Rubi"
                  width={400}
                  height={400}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h3 className="text-3xl font-dancing font-bold text-gray-800">Rubiana Lima</h3>
            <p className="text-gray-600 leading-relaxed">
              Localizado no coração de <span className="text-pink-500 font-medium">Arraial do Cabo</span>, o Atelier da
              Rubi nasceu do amor pela arte do bordado e pelo universo infantil. Atendemos toda a
              <span className="text-blue-500 font-medium"> Região dos Lagos</span> e fazemos
              <span className="text-yellow-600 font-medium"> envios para todo o Brasil</span>.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Especializamos em <span className="text-yellow-600 font-medium">jogos de berço premium</span>,
              <span className="text-yellow-600 font-medium"> toalhas para recém-nascidos</span> e
              <span className="text-yellow-600 font-medium"> kits completos para gestantes</span>.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Nossa missão é criar memórias afetivas através de bordados únicos, que acompanham os momentos mais
              especiais da maternidade e infância. Trabalhamos com materiais de alta qualidade,
              <span className="text-yellow-600 font-medium"> fios dourados premium</span> e designs exclusivos que
              tornam cada peça uma verdadeira obra de arte.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-6">
              <div className="text-center">
                <div className="bg-pink-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Heart className="h-8 w-8 text-pink-500" />
                </div>
                <p className="text-sm text-gray-600 font-medium">Feito com Amor</p>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Star className="h-8 w-8 text-purple-500" />
                </div>
                <p className="text-sm text-gray-600 font-medium">Qualidade Premium</p>
              </div>
              <div className="text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                  <MapPin className="h-8 w-8 text-blue-500" />
                </div>
                <p className="text-sm text-gray-600 font-medium">Região dos Lagos</p>
              </div>
              <div className="text-center">
                <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Truck className="h-8 w-8 text-yellow-500" />
                </div>
                <p className="text-sm text-gray-600 font-medium">Envios Nacional</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
