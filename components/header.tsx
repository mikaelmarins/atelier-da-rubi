"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { Menu, ShoppingCart, Home, ShoppingBag, Info, Phone, Package, User, LogOut } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { useCart } from "@/context/cart-context"
import { useAuth } from "@/context/auth-context"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function Header() {
  const { itemsCount } = useCart()
  const { user, profile, signOut, loading } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogout = async () => {
    await signOut()
    setIsOpen(false)
  }

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
          <nav className="hidden md:flex items-center space-x-6">
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

            {/* User Account Dropdown */}
            {mounted && !loading && (
              user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2 border-pink-200">
                      <User className="h-4 w-4" />
                      <span className="hidden lg:inline max-w-[100px] truncate">
                        {profile?.name?.split(" ")[0] || "Conta"}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link href="/minha-conta" className="flex items-center gap-2 cursor-pointer">
                        <User className="h-4 w-4" />
                        Minha Conta
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/minha-conta?tab=pedidos" className="flex items-center gap-2 cursor-pointer">
                        <Package className="h-4 w-4" />
                        Meus Pedidos
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 cursor-pointer text-red-600">
                      <LogOut className="h-4 w-4" />
                      Sair
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link href="/auth/login">
                  <Button variant="outline" size="sm" className="gap-2 border-pink-200 hover:bg-pink-50">
                    <User className="h-4 w-4" />
                    Entrar
                  </Button>
                </Link>
              )
            )}
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

                  {/* User info for mobile */}
                  {mounted && !loading && (
                    <div className="px-2 py-3 bg-pink-50 rounded-lg">
                      {user ? (
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-800">{profile?.name || "Olá!"}</p>
                            <p className="text-sm text-gray-500">{profile?.email}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <Link href="/auth/login" onClick={() => setIsOpen(false)} className="flex-1">
                            <Button variant="outline" className="w-full" size="sm">Entrar</Button>
                          </Link>
                          <Link href="/auth/register" onClick={() => setIsOpen(false)} className="flex-1">
                            <Button className="w-full bg-pink-500 hover:bg-pink-600" size="sm">Criar Conta</Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  )}

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

                  {user && (
                    <Button
                      variant="outline"
                      onClick={handleLogout}
                      className="text-red-500 border-red-200 hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4 mr-2" /> Sair
                    </Button>
                  )}

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
