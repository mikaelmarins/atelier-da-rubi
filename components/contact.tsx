"use client"

import { motion } from "framer-motion"
import { MapPin, Phone, Instagram, Clock, Truck } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Contact() {
  const whatsappNumber = "5522999999999" // Substitua pelo número real
  const whatsappMessage = "Olá! Gostaria de saber mais sobre os bordados do Atelier da Rubi."

  return (
    <section id="contato" className="py-20 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-dancing font-bold text-gray-800 mb-6">Entre em Contato</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Atendemos toda a Região dos Lagos e fazemos envios para todo o Brasil. Entre em contato e vamos conversar
            sobre seu projeto especial.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="flex items-start space-x-4">
              <div className="bg-pink-100 p-3 rounded-full">
                <MapPin className="h-6 w-6 text-pink-500" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Localização</h3>
                <p className="text-gray-600">
                  Arraial do Cabo, RJ
                  <br />
                  <span className="text-blue-600 font-medium">Atendemos toda Região dos Lagos</span>
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-yellow-100 p-3 rounded-full">
                <Truck className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Envios</h3>
                <p className="text-gray-600">
                  <span className="text-yellow-600 font-medium">Enviamos para todo o Brasil</span>
                  <br />
                  Frete calculado por região
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-purple-100 p-3 rounded-full">
                <Phone className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">WhatsApp</h3>
                <p className="text-gray-600">
                  Atendimento personalizado
                  <br />
                  Resposta rápida
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <Clock className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Horário</h3>
                <p className="text-gray-600">
                  Segunda a Sexta: 9h às 18h
                  <br />
                  Sábado: 9h às 14h
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-pink-100 p-3 rounded-full">
                <Instagram className="h-6 w-6 text-pink-500" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Instagram</h3>
                <p className="text-gray-600">
                  @atelierdarubi
                  <br />
                  Acompanhe nossos trabalhos
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl shadow-lg p-8"
          >
            <h3 className="text-2xl font-dancing font-bold text-gray-800 mb-6 text-center">Vamos Conversar?</h3>

            <div className="space-y-4">
              <p className="text-gray-600 text-center mb-6">
                Clique no botão abaixo para iniciar uma conversa no WhatsApp. Atendemos toda a Região dos Lagos e
                fazemos envios para todo o Brasil!
              </p>

              <Button
                asChild
                size="lg"
                className="w-full bg-green-500 hover:bg-green-600 text-white py-4 rounded-full text-lg"
              >
                <a
                  href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Phone className="h-5 w-5 mr-2" />
                  Conversar no WhatsApp
                </a>
              </Button>

              <div className="text-center pt-4">
                <p className="text-sm text-gray-500">Ou nos siga no Instagram para ver mais trabalhos</p>
                <Button
                  asChild
                  variant="outline"
                  className="mt-2 border-pink-300 text-pink-600 hover:bg-pink-50 bg-transparent"
                >
                  <a href="https://instagram.com/atelierdarubi" target="_blank" rel="noopener noreferrer">
                    <Instagram className="h-4 w-4 mr-2" />
                    @atelierdarubi
                  </a>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
