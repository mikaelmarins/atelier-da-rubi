import { Heart, Instagram, Phone, MapPin, Truck } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-8 sm:py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Mobile Layout */}
        <div className="block md:hidden">
          <div className="text-center space-y-8">
            {/* Logo e Descrição */}
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-2">
                <Heart className="h-6 w-6 text-pink-400" />
                <span className="text-xl font-dancing font-bold">Atelier da Rubi</span>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed max-w-xs mx-auto">
                Bordados infantis únicos e delicados, criados com amor em Arraial do Cabo.
              </p>
            </div>

            {/* Informações de Atendimento */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-white">Atendimento</h3>
              <div className="space-y-3 text-gray-300 text-sm">
                <div className="flex items-center justify-center space-x-3">
                  <MapPin className="h-4 w-4 text-pink-400 flex-shrink-0" />
                  <span>Arraial do Cabo, RJ</span>
                </div>
                <div className="flex items-center justify-center space-x-3">
                  <MapPin className="h-4 w-4 text-blue-400 flex-shrink-0" />
                  <span>Toda Região dos Lagos</span>
                </div>
                <div className="flex items-center justify-center space-x-3">
                  <Truck className="h-4 w-4 text-yellow-400 flex-shrink-0" />
                  <span>Envios para todo Brasil</span>
                </div>
                <div className="flex items-center justify-center space-x-3">
                  <Phone className="h-4 w-4 text-green-400 flex-shrink-0" />
                  <span>WhatsApp Disponível</span>
                </div>
              </div>
            </div>

            {/* Redes Sociais */}
            <div className="space-y-4">
              <div className="flex justify-center space-x-6">
                <a
                  href="https://instagram.com/atelierdarubi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-pink-400 transition-colors"
                  aria-label="Instagram do Atelier da Rubi"
                >
                  <Instagram className="h-6 w-6" />
                </a>
                <a
                  href="https://wa.me/5522999999999"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-green-400 transition-colors"
                  aria-label="WhatsApp do Atelier da Rubi"
                >
                  <Phone className="h-6 w-6" />
                </a>
              </div>
              <div className="text-center">
                <a
                  href="https://instagram.com/atelierdarubi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-pink-400 transition-colors text-sm"
                >
                  @atelierdarubi
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:flex justify-center items-start gap-12 lg:gap-24 xl:gap-32">
          <div className="flex flex-col items-center space-y-6">
            <div className="flex items-center space-x-2">
              <Heart className="h-6 w-6 text-pink-400" />
              <span className="text-xl font-dancing font-bold">Atelier da Rubi</span>
            </div>
            <p className="text-gray-300 text-sm sm:text-base leading-relaxed text-center max-w-xs">
              Bordados infantis únicos e delicados, criados com amor em Arraial do Cabo.
            </p>
            <div className="flex space-x-6">
              <a
                href="https://instagram.com/atelierdarubi"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-pink-400 transition-colors"
                aria-label="Instagram do Atelier da Rubi"
              >
                <Instagram className="h-6 w-6" />
              </a>
              <a
                href="https://wa.me/5522999999999"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-green-400 transition-colors"
                aria-label="WhatsApp do Atelier da Rubi"
              >
                <Phone className="h-6 w-6" />
              </a>
            </div>
          </div>

          <div className="flex flex-col items-center space-y-6">
            <h3 className="font-semibold text-xl text-white">Atendimento</h3>
            <div className="space-y-4 text-gray-300 text-sm sm:text-base">
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-pink-400 flex-shrink-0" />
                <span>Arraial do Cabo, RJ</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-blue-400 flex-shrink-0" />
                <span>Toda Região dos Lagos</span>
              </div>
              <div className="flex items-center space-x-3">
                <Truck className="h-5 w-5 text-yellow-400 flex-shrink-0" />
                <span>Envios para todo Brasil</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-green-400 flex-shrink-0" />
                <span>WhatsApp Disponível</span>
              </div>
              <div className="flex items-center space-x-3">
                <Instagram className="h-5 w-5 text-pink-400 flex-shrink-0" />
                <a
                  href="https://instagram.com/atelierdarubi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-pink-400 transition-colors"
                >
                  @atelierdarubi
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Linha divisória e copyright */}
        <div className="border-t border-gray-700 mt-8 sm:mt-10 pt-6 sm:pt-8 text-center space-y-2">
          <p className="text-gray-300 text-xs sm:text-sm">
            © 2024 Atelier da Rubi. Todos os direitos reservados. Feito com{" "}
            <Heart className="h-4 w-4 inline text-pink-400 mx-1" /> por Rubiana Lima.
          </p>
          <p className="text-gray-400 text-xs">
            Site desenvolvido por{" "}
            <a
              href="https://instagram.com/mikaelmarins"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
            >
              mikaelmarins
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
