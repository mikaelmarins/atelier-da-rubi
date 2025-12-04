"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { Menu, ShoppingCart, Home, ShoppingBag, Info, Phone } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { useCart } from "@/context/cart-context"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"

export default function Header() {
  const { itemsCount } = useCart()
  const [mounted, setMounted] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  const NavLink = ({ href, children, onClick }: { href: string; children: React.ReactNode; onClick?: () => void }) => (
    <Link
      href={href}
      className="text-gray-700 hover:text-pink-500 transition-colors font-medium text-lg flex items-center gap-3 p-2 rounded-md hover:bg-pink-50"
      onClick={onClick}
    >
      {children}
    </Link>
  )

  return (
    <header className="fixed top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-pink-100 shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 md:space-x-3">
            <div className="relative h-10 w-10 md:h-12 md:w-12">
              <Image
                src="/logo.png"
                alt="Logo Atelier da Rubi"
                fill
                className="object-contain"
                priority
              />
            </div>
            <span className="text-xl md:text-2xl font-dancing font-bold text-pink-600">Atelier da Rubi</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-pink-500 transition-colors">Início</Link>
            <Link href="/catalogo" className="text-gray-700 hover:text-pink-500 transition-colors">Catálogo</Link>
            <Link href="/#sobre" className="text-gray-700 hover:text-pink-500 transition-colors">Sobre</Link>
            <Link href="/#contato" className="text-gray-700 hover:text-pink-500 transition-colors">Contato</Link>

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

          {/* Mobile Actions */}
          <div className="flex items-center gap-2 md:hidden">
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

            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-gray-700">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Abrir menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <VisuallyHidden>
                  <SheetTitle>Menu de Navegação</SheetTitle>
                  <SheetDescription>Navegue pelas seções do site</SheetDescription>
                </VisuallyHidden>
                <div className="flex flex-col gap-6 mt-8">
                  <div className="flex items-center justify-center mb-4">
                    <div className="relative h-20 w-20">
                      <Image
                        src="/logo.png"
                        alt="Logo Atelier da Rubi"
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>

                  <nav className="flex flex-col space-y-2">
                    <NavLink href="/" onClick={() => setIsOpen(false)}>
                      <Home className="h-5 w-5" /> Início
                    </NavLink>
                    <NavLink href="/catalogo" onClick={() => setIsOpen(false)}>
                      <ShoppingBag className="h-5 w-5" /> Catálogo
                    </NavLink>
                    <NavLink href="/#sobre" onClick={() => setIsOpen(false)}>
                      <Info className="h-5 w-5" /> Sobre
                    </NavLink>
                    <NavLink href="/#contato" onClick={() => setIsOpen(false)}>
                      <Phone className="h-5 w-5" /> Contato
                    </NavLink>
                  </nav>

                  <div className="border-t border-gray-100 pt-6 mt-auto">
                    <p className="text-center text-sm text-gray-500">
                      Feito com amor em<br />Arraial do Cabo
                    </p>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
