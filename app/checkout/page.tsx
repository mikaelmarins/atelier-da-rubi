"use client"

import { useState } from "react"
import { useCart } from "@/context/cart-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { formatCurrency } from "@/lib/utils"
import { ArrowLeft, CheckCircle, Loader2, Lock } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { OrderService } from "@/lib/order-service"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"

export default function CheckoutPage() {
    const { items, cartTotal, clearCart } = useCart()
    const { user } = useAuth()
    const router = useRouter()
    const { toast } = useToast()

    const [loading, setLoading] = useState(false)
    const [step, setStep] = useState(1) // 1: Form, 2: Payment (Mock), 3: Success

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        zip: "",
        street: "",
        number: "",
        complement: "",
        neighborhood: "",
        city: "",
        state: "",
    })

    const [shippingCost, setShippingCost] = useState(0)

    // Redirect if cart is empty
    if (items.length === 0 && step !== 3) {
        return (
            <div className="container mx-auto px-4 py-24 flex flex-col items-center justify-center text-center">
                <h1 className="text-2xl font-bold mb-4">Seu carrinho está vazio</h1>
                <Link href="/catalogo">
                    <Button>Voltar ao Catálogo</Button>
                </Link>
            </div>
        )
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleZipBlur = async () => {
        if (formData.zip.length === 8) {
            try {
                const response = await fetch(`https://viacep.com.br/ws/${formData.zip}/json/`)
                const data = await response.json()
                if (!data.erro) {
                    setFormData((prev) => ({
                        ...prev,
                        street: data.logradouro,
                        neighborhood: data.bairro,
                        city: data.localidade,
                        state: data.uf,
                    }))

                    // Mock shipping calculation
                    if (data.uf === "RJ") {
                        setShippingCost(15.00)
                    } else {
                        setShippingCost(35.00)
                    }
                }
            } catch (error) {
                console.error("Error fetching CEP", error)
            }
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            // 1. Create Order
            const order = await OrderService.createOrder({
                customer: {
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    userId: user?.id, // Pass the authenticated user ID
                },
                address: {
                    zip: formData.zip,
                    street: formData.street,
                    number: formData.number,
                    complement: formData.complement,
                    neighborhood: formData.neighborhood,
                    city: formData.city,
                    state: formData.state,
                },
                items: items,
                shippingCost: shippingCost,
                totalAmount: cartTotal + shippingCost
            })

            if (order) {
                // 2. Create Mercado Pago Preference
                const response = await fetch("/api/checkout", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        items: items,
                        payer: {
                            name: formData.name,
                            email: formData.email,
                            phone: formData.phone,
                        },
                        orderId: order.id,
                        shippingCost: shippingCost,
                    }),
                })

                const data = await response.json()

                if (data.init_point) {
                    // Redirect to Mercado Pago
                    window.location.href = data.init_point
                } else {
                    const errorMessage = data.error || data.message || "Erro ao criar preferência de pagamento"
                    console.error("Server error details:", data)
                    throw new Error(errorMessage)
                }
            } else {
                throw new Error("Falha ao criar pedido")
            }
        } catch (error) {
            console.error("Error submitting order:", error)
            toast({
                title: "Erro ao processar pedido",
                description: error instanceof Error ? error.message : "Tente novamente mais tarde.",
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }

    if (step === 3) {
        return (
            <div className="container mx-auto px-4 py-24 flex flex-col items-center justify-center text-center max-w-md">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Pedido Confirmado!</h1>
                <p className="text-gray-600 mb-8">
                    Obrigado pela sua compra, {formData.name.split(" ")[0]}! <br />
                    Entraremos em contato via WhatsApp/Email para confirmar o pagamento.
                </p>
                <Link href="/catalogo">
                    <Button className="w-full">Continuar Comprando</Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-12 pt-24 max-w-6xl">
            <div className="mb-8">
                <Link href="/carrinho" className="text-sm text-gray-500 hover:text-gray-900 flex items-center">
                    <ArrowLeft className="h-4 w-4 mr-1" /> Voltar ao Carrinho
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <form onSubmit={handleSubmit}>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Lock className="h-5 w-5 text-green-600" />
                                    Finalizar Compra
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Dados Pessoais */}
                                <div>
                                    <h3 className="font-medium mb-4 text-gray-900">Dados Pessoais</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Nome Completo</Label>
                                            <Input
                                                id="name"
                                                name="name"
                                                required
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                placeholder="Ex: Maria Silva"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email">E-mail</Label>
                                            <Input
                                                id="email"
                                                name="email"
                                                type="email"
                                                required
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                placeholder="Ex: maria@email.com"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="phone">WhatsApp / Telefone</Label>
                                            <Input
                                                id="phone"
                                                name="phone"
                                                required
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                placeholder="(00) 00000-0000"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                {/* Endereço */}
                                <div>
                                    <h3 className="font-medium mb-4 text-gray-900">Endereço de Entrega</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="zip">CEP</Label>
                                            <Input
                                                id="zip"
                                                name="zip"
                                                required
                                                maxLength={8}
                                                value={formData.zip}
                                                onChange={handleInputChange}
                                                onBlur={handleZipBlur}
                                                placeholder="00000000"
                                            />
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <Label htmlFor="street">Rua</Label>
                                            <Input
                                                id="street"
                                                name="street"
                                                required
                                                value={formData.street}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="number">Número</Label>
                                            <Input
                                                id="number"
                                                name="number"
                                                required
                                                value={formData.number}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="complement">Complemento</Label>
                                            <Input
                                                id="complement"
                                                name="complement"
                                                value={formData.complement}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="neighborhood">Bairro</Label>
                                            <Input
                                                id="neighborhood"
                                                name="neighborhood"
                                                required
                                                value={formData.neighborhood}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="city">Cidade</Label>
                                            <Input
                                                id="city"
                                                name="city"
                                                required
                                                readOnly
                                                className="bg-gray-50"
                                                value={formData.city}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="state">Estado</Label>
                                            <Input
                                                id="state"
                                                name="state"
                                                required
                                                readOnly
                                                className="bg-gray-50"
                                                value={formData.state}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 py-6 text-lg" disabled={loading}>
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processando...
                                        </>
                                    ) : (
                                        "Prosseguir para o Pagamento"
                                    )}
                                </Button>
                            </CardFooter>
                        </Card>
                    </form>
                </div>

                {/* Resumo Lateral */}
                <div>
                    <Card className="sticky top-24">
                        <CardHeader>
                            <CardTitle>Resumo</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {items.map((item, index) => (
                                <div key={`${item.product.id}-${index}`} className="flex justify-between text-sm">
                                    <span className="text-gray-600">
                                        {item.quantity}x {item.product.name}
                                    </span>
                                    <span className="font-medium">{formatCurrency(item.product.price * item.quantity)}</span>
                                </div>
                            ))}

                            <Separator />

                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Subtotal</span>
                                <span className="font-medium">{formatCurrency(cartTotal)}</span>
                            </div>

                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Frete</span>
                                <span className="font-medium text-green-600">
                                    {shippingCost === 0 ? "A calcular" : formatCurrency(shippingCost)}
                                </span>
                            </div>

                            <Separator />

                            <div className="flex justify-between text-lg font-bold">
                                <span>Total</span>
                                <span>{formatCurrency(cartTotal + shippingCost)}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
