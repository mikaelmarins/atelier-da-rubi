"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Menu, X, Heart, ShoppingCart } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { useCart } from "@/context/cart-context"
import { Badge } from "@/components/ui/badge"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { itemsCount } = useCart()
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <header className="fixed top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-pink-100 shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Heart className="h-8 w-8 text-pink-400" />
            <span className="text-2xl font-dancing font-bold text-pink-600">Atelier da Rubi</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-pink-500 transition-colors">
              Início
            </Link>
            <Link href="/catalogo" className="text-gray-700 hover:text-pink-500 transition-colors">
              Catálogo
            </Link>
            <Link href="/#sobre" className="text-gray-700 hover:text-pink-500 transition-colors">
              Sobre
            </Link>
            <Link href="/#contato" className="text-gray-700 hover:text-pink-500 transition-colors">
              Contato
            </Link>
            
            <Link href="/carrinho" className="relative group">
              <Button variant="ghost" size="icon" className="text-gray-700 group-hover:text-pink-500">
                <ShoppingCart className="h-6 w-6" />
                {mounted && itemsCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-pink-500 text-white text-xs rounded-full">
                    {itemsCount}
                  </Badge>
                )}
              </Button>
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-4 md:hidden">
            <Link href="/carrinho" className="relative">
              <Button variant="ghost" size="icon" className="text-gray-700">
                <ShoppingCart className="h-6 w-6" />
                {mounted && itemsCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-pink-500 text-white text-xs rounded-full">
                    {itemsCount}
                  </Badge>
                )}
              </Button>
            </Link>
            <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 border-t border-pink-100 pt-4">
            <div className="flex flex-col space-y-4">
              <Link
                href="/"
                className="text-gray-700 hover:text-pink-500 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Início
              </Link>
              <Link
                href="/catalogo"
                className="text-gray-700 hover:text-pink-500 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Catálogo
              </Link>
              <Link
                href="/#sobre"
                className="text-gray-700 hover:text-pink-500 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Sobre
              </Link>
              <Link
                href="/#contato"
                className="text-gray-700 hover:text-pink-500 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Contato
              </Link>
              <Link
                href="/carrinho"
                className="text-gray-700 hover:text-pink-500 transition-colors font-medium flex items-center gap-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <ShoppingCart className="h-4 w-4" />
                Carrinho ({itemsCount})
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
