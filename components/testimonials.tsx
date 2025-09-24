"use client"

import { motion } from "framer-motion"
import { Star, Quote } from "lucide-react"
import Image from "next/image"

const testimonials = [
  {
    id: 1,
    name: "Maria Silva",
    location: "Arraial do Cabo, RJ",
    rating: 5,
    text: "O kit de berço que encomendei ficou simplesmente perfeito! A Rubiana tem um talento incrível e um carinho especial em cada detalhe. Meu bebê vai dormir como um príncipe!",
    product: "Kit Berço Premium",
    image: "/placeholder.svg?height=80&width=80&text=Maria",
  },
  {
    id: 2,
    name: "Ana Carolina",
    location: "Cabo Frio, RJ",
    rating: 5,
    text: "Recebi as toalhas bordadas e fiquei emocionada! A qualidade é excepcional e o bordado é uma obra de arte. Recomendo de olhos fechados para todas as mamães!",
    product: "Toalhas Bordadas",
    image: "/placeholder.svg?height=80&width=80&text=Ana",
  },
  {
    id: 3,
    name: "Juliana Santos",
    location: "Búzios, RJ",
    rating: 5,
    text: "O atendimento da Rubiana é maravilhoso! Ela entendeu exatamente o que eu queria e entregou muito além das minhas expectativas. O kit gestante é lindo demais!",
    product: "Kit Gestante Completo",
    image: "/placeholder.svg?height=80&width=80&text=Juliana",
  },
  {
    id: 4,
    name: "Fernanda Costa",
    location: "São Paulo, SP",
    rating: 5,
    text: "Mesmo morando longe, o atendimento foi impecável! O envio foi rápido e seguro. As peças chegaram perfeitas e são ainda mais lindas pessoalmente. Parabéns pelo trabalho!",
    product: "Vestidinho Bordado",
    image: "/placeholder.svg?height=80&width=80&text=Fernanda",
  },
  {
    id: 5,
    name: "Camila Oliveira",
    location: "Rio de Janeiro, RJ",
    rating: 5,
    text: "Já é a terceira encomenda que faço! A qualidade é sempre impecável e o prazo sempre cumprido. O Atelier da Rubi se tornou minha referência em bordados infantis!",
    product: "Bodies Bordados",
    image: "/placeholder.svg?height=80&width=80&text=Camila",
  },
  {
    id: 6,
    name: "Patrícia Mendes",
    location: "Iguaba Grande, RJ",
    rating: 5,
    text: "A atenção aos detalhes é impressionante! Cada ponto é feito com muito amor. Minha filha fica linda com as roupinhas do Atelier da Rubi. Trabalho excepcional!",
    product: "Conjunto Bordado",
    image: "/placeholder.svg?height=80&width=80&text=Patricia",
  },
]

export default function Testimonials() {
  return (
    <section className="py-20 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-dancing font-bold text-gray-800 mb-6">
            O que nossas clientes dizem
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-pink-400 to-purple-400 mx-auto rounded-full mb-6"></div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Mais de 500 famílias já confiaram no nosso trabalho. Veja alguns depoimentos de quem já viveu a experiência
            Atelier da Rubi.
          </p>
        </motion.div>

        {/* Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
        >
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-pink-500 mb-2">500+</div>
            <div className="text-gray-600 text-sm">Clientes Felizes</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-purple-500 mb-2">1000+</div>
            <div className="text-gray-600 text-sm">Peças Criadas</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-blue-500 mb-2">5★</div>
            <div className="text-gray-600 text-sm">Avaliação Média</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-yellow-500 mb-2">3+</div>
            <div className="text-gray-600 text-sm">Anos de Experiência</div>
          </div>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 relative"
            >
              {/* Quote Icon */}
              <div className="absolute -top-4 left-6 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full p-3">
                <Quote className="h-6 w-6 text-white" />
              </div>

              {/* Rating */}
              <div className="flex items-center mb-4 mt-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>

              {/* Testimonial Text */}
              <p className="text-gray-600 mb-6 leading-relaxed italic">"{testimonial.text}"</p>

              {/* Product */}
              <div className="mb-4">
                <span className="bg-yellow-100 text-yellow-700 text-xs font-medium px-2 py-1 rounded-full">
                  {testimonial.product}
                </span>
              </div>

              {/* Customer Info */}
              <div className="flex items-center">
                <div className="relative w-12 h-12 rounded-full overflow-hidden mr-4">
                  <Image
                    src={testimonial.image || "/placeholder.svg"}
                    alt={testimonial.name}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">{testimonial.name}</h4>
                  <p className="text-gray-500 text-sm">{testimonial.location}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-dancing font-bold text-gray-800 mb-4">Quer fazer parte dessa família?</h3>
            <p className="text-gray-600 mb-6">
              Entre em contato conosco e crie memórias especiais para seu pequeno com nossos bordados únicos e
              delicados.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://wa.me/5522999999999?text=Olá! Vi os depoimentos e gostaria de conhecer mais sobre os bordados do Atelier da Rubi!"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-full font-medium transition-colors inline-flex items-center justify-center"
              >
                💬 Conversar no WhatsApp
              </a>
              <a
                href="https://instagram.com/atelierdarubi"
                target="_blank"
                rel="noopener noreferrer"
                className="border border-pink-300 text-pink-600 hover:bg-pink-50 px-6 py-3 rounded-full font-medium transition-colors inline-flex items-center justify-center"
              >
                📸 Ver no Instagram
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
