"use client"

import { useCart } from "@/context/cart-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Truck } from 'lucide-react'
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { formatCurrency } from "@/lib/utils"

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart()
  const [cep, setCep] = useState("")
  const [shippingCost, setShippingCost] = useState<number | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  const handleCalculateShipping = async () => {
    if (cep.length < 8) return

    setIsCalculating(true)
    // Simulação de cálculo de frete
    // TODO: Implementar integração real com Correios/Melhor Envio
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Regra de negócio simples para demonstração (Mock)
    // Região dos Lagos (CEP começa com 289) -> Grátis
    // Outros -> Base R$ 25,00 + R$ 5,00 por item (simulando peso)
    if (cep.startsWith("289")) {
      setShippingCost(0)
    } else {
      const weightSurcharge = items.reduce((acc, item) => acc + (item.quantity * 5), 0)
      setShippingCost(25.00 + weightSurcharge)
    }
    setIsCalculating(false)
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 min-h-[60vh] flex flex-col items-center justify-center text-center">
        <div className="bg-pink-50 p-6 rounded-full mb-6">
          <ShoppingBag className="h-12 w-12 text-pink-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Seu carrinho está vazio</h1>
        <p className="text-gray-600 mb-8 max-w-md">
          Parece que você ainda não escolheu nenhum dos nossos produtos artesanais.
          Que tal dar uma olhada no nosso catálogo?
        </p>
        <Link href="/catalogo">
          <Button className="bg-pink-500 hover:bg-pink-600 text-white px-8">
            Ver Catálogo
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-24 min-h-[calc(100vh-280px)]">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 font-dancing">Seu Carrinho</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lista de Produtos */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <Card key={item.product.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className="relative h-24 w-24 flex-shrink-0 rounded-md overflow-hidden bg-gray-100">
                    {item.product.images && item.product.images[0] ? (
                      <Image
                        src={item.product.images[0].image_url || "/placeholder.svg"}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        <ShoppingBag className="h-8 w-8" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">{item.product.name}</h3>
                        <p className="text-sm text-gray-500 capitalize">{item.product.category}</p>
                        {item.customization && (
                          <p className="text-sm text-pink-600 mt-1">
                            Personalização: <span className="font-medium">{item.customization}</span>
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-400 hover:text-red-600 hover:bg-red-50 -mr-2"
                        onClick={() => removeFromCart(item.product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex justify-between items-end mt-2">
                      <div className="flex items-center border rounded-md">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-none"
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-none"
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(item.product.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <div className="flex justify-end">
            <Button
              variant="outline"
              className="text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200"
              onClick={clearCart}
            >
              Limpar Carrinho
            </Button>
          </div>
        </div>

        {/* Resumo do Pedido */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Resumo do Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">{formatCurrency(cartTotal)}</span>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Truck className="h-4 w-4" /> Calcular Frete
                </label>
                <div className="flex gap-2">
                  <Input
                    placeholder="CEP"
                    value={cep}
                    onChange={(e) => setCep(e.target.value.replace(/\D/g, ''))}
                    maxLength={8}
                  />
                  <Button
                    variant="outline"
                    onClick={handleCalculateShipping}
                    disabled={cep.length < 8 || isCalculating}
                  >
                    {isCalculating ? "..." : "OK"}
                  </Button>
                </div>
                {shippingCost !== null && (
                  <div className="flex justify-between text-sm text-green-600 font-medium pt-1">
                    <span>Frete</span>
                    <span>{shippingCost === 0 ? "Grátis" : formatCurrency(shippingCost)}</span>
                  </div>
                )}
              </div>

              <Separator />

              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>{formatCurrency(cartTotal + (shippingCost || 0))}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-lg">
                <Link href="/checkout">
                  Finalizar Compra <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
