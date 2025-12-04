"use client"

import { useState, useEffect } from "react"
import { useCart } from "@/context/cart-context"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { formatCurrency } from "@/lib/utils"
import {
    ArrowLeft, CheckCircle, Loader2, Lock, CreditCard,
    QrCode, ShieldCheck, Copy, Check, User, MapPin
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { OrderService } from "@/lib/order-service"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

declare global {
    interface Window {
        MercadoPago: any
    }
}

export default function CheckoutPage() {
    const { items, cartTotal, clearCart } = useCart()
    const { user, profile, addresses } = useAuth()
    const router = useRouter()
    const { toast } = useToast()

    const [loading, setLoading] = useState(false)
    const [step, setStep] = useState(1) // 1: Dados, 2: Pagamento, 3: Sucesso
    const [paymentMethod, setPaymentMethod] = useState<"card" | "pix">("card")
    const [orderId, setOrderId] = useState<string>("")

    // Form data
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        cpf: "",
        zip: "",
        street: "",
        number: "",
        complement: "",
        neighborhood: "",
        city: "",
        state: "",
    })

    // Card data
    const [cardData, setCardData] = useState({
        number: "",
        expiry: "",
        cvv: "",
        name: "",
        installments: 1
    })

    // PIX data
    const [pixData, setPixData] = useState<{
        qr_code?: string
        qr_code_base64?: string
    } | null>(null)

    const [shippingCost, setShippingCost] = useState(0)
    const [copied, setCopied] = useState(false)
    const [mpReady, setMpReady] = useState(false)

    // Load MercadoPago SDK
    useEffect(() => {
        const script = document.createElement("script")
        script.src = "https://sdk.mercadopago.com/js/v2"
        script.async = true
        script.onload = () => {
            const mp = new window.MercadoPago(process.env.NEXT_PUBLIC_MP_PUBLIC_KEY || "", {
                locale: "pt-BR"
            })
            setMpReady(true)
        }
        document.body.appendChild(script)
        return () => {
            document.body.removeChild(script)
        }
    }, [])

    // Fill form from profile and addresses
    useEffect(() => {
        if (profile) {
            setFormData(prev => ({
                ...prev,
                name: profile.name || prev.name,
                email: profile.email || prev.email,
                phone: profile.phone || prev.phone
            }))
        }

        const defaultAddr = addresses.find(a => a.is_default) || addresses[0]
        if (defaultAddr) {
            setFormData(prev => ({
                ...prev,
                zip: defaultAddr.zip,
                street: defaultAddr.street,
                number: defaultAddr.number,
                complement: defaultAddr.complement || "",
                neighborhood: defaultAddr.neighborhood,
                city: defaultAddr.city,
                state: defaultAddr.state
            }))
            // Calculate shipping
            if (defaultAddr.state === "RJ") {
                setShippingCost(15)
            } else {
                setShippingCost(35)
            }
        }
    }, [profile, addresses])

    // Redirect if cart is empty
    if (items.length === 0 && step !== 3) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 pt-24">
                <div className="container mx-auto px-4 py-24 flex flex-col items-center justify-center text-center">
                    <h1 className="text-2xl font-bold mb-4">Seu carrinho está vazio</h1>
                    <Link href="/catalogo">
                        <Button className="bg-pink-500 hover:bg-pink-600">Voltar ao Catálogo</Button>
                    </Link>
                </div>
            </div>
        )
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleCardInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target

        // Format card number
        if (name === "number") {
            const formatted = value.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})/g, "$1 ").trim()
            setCardData((prev) => ({ ...prev, number: formatted }))
            return
        }

        // Format expiry
        if (name === "expiry") {
            const formatted = value.replace(/\D/g, "").slice(0, 4).replace(/(\d{2})(\d{0,2})/, "$1/$2")
            setCardData((prev) => ({ ...prev, expiry: formatted }))
            return
        }

        // Format CVV
        if (name === "cvv") {
            setCardData((prev) => ({ ...prev, cvv: value.replace(/\D/g, "").slice(0, 4) }))
            return
        }

        setCardData((prev) => ({ ...prev, [name]: value }))
    }

    const handleZipBlur = async () => {
        const zip = formData.zip.replace(/\D/g, "")
        if (zip.length === 8) {
            try {
                const response = await fetch(`https://viacep.com.br/ws/${zip}/json/`)
                const data = await response.json()
                if (!data.erro) {
                    setFormData((prev) => ({
                        ...prev,
                        street: data.logradouro || prev.street,
                        neighborhood: data.bairro || prev.neighborhood,
                        city: data.localidade || "",
                        state: data.uf || "",
                    }))

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

    const validateStep1 = () => {
        if (!formData.name || !formData.email || !formData.phone) {
            toast({ title: "Preencha os dados pessoais", variant: "destructive" })
            return false
        }
        if (!formData.zip || !formData.street || !formData.number || !formData.city || !formData.state) {
            toast({ title: "Preencha o endereço completo", variant: "destructive" })
            return false
        }
        return true
    }

    const handleGoToPayment = async () => {
        if (!validateStep1()) return

        setLoading(true)
        try {
            // Create order first
            const order = await OrderService.createOrder({
                customer: {
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    userId: user?.id,
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
                setOrderId(order.id)
                setStep(2)
            }
        } catch (error) {
            toast({ title: "Erro ao criar pedido", variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    const handlePayWithCard = async () => {
        if (!cardData.number || !cardData.expiry || !cardData.cvv || !cardData.name) {
            toast({ title: "Preencha todos os dados do cartão", variant: "destructive" })
            return
        }

        setLoading(true)
        try {
            // Create card token using MercadoPago SDK
            const mp = new window.MercadoPago(process.env.NEXT_PUBLIC_MP_PUBLIC_KEY || "")

            const [expiryMonth, expiryYear] = cardData.expiry.split("/")

            const cardToken = await mp.createCardToken({
                cardNumber: cardData.number.replace(/\s/g, ""),
                cardholderName: cardData.name,
                cardExpirationMonth: expiryMonth,
                cardExpirationYear: "20" + expiryYear,
                securityCode: cardData.cvv,
                identificationType: "CPF",
                identificationNumber: formData.cpf.replace(/\D/g, "")
            })

            if (cardToken.error) {
                throw new Error(cardToken.error)
            }

            // Process payment
            const response = await fetch("/api/payment/card", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    transaction_amount: cartTotal + shippingCost,
                    token: cardToken.id,
                    description: `Pedido Atelier da Rubi`,
                    installments: cardData.installments,
                    payment_method_id: "master", // Will be detected by MP
                    payer: {
                        email: formData.email,
                        identification: {
                            type: "CPF",
                            number: formData.cpf.replace(/\D/g, "")
                        }
                    },
                    external_reference: orderId
                })
            })

            const result = await response.json()

            if (result.status === "approved") {
                clearCart()
                setStep(3)
            } else if (result.status === "in_process" || result.status === "pending") {
                toast({ title: "Pagamento em análise", description: "Aguarde a confirmação" })
                clearCart()
                setStep(3)
            } else {
                throw new Error(result.status_detail || "Pagamento recusado")
            }
        } catch (error: any) {
            console.error("Card payment error:", error)
            toast({
                title: "Erro no pagamento",
                description: error.message || "Verifique os dados do cartão",
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }

    const handlePayWithPix = async () => {
        setLoading(true)
        try {
            const response = await fetch("/api/payment/pix", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    transaction_amount: cartTotal + shippingCost,
                    description: `Pedido Atelier da Rubi`,
                    payer: {
                        email: formData.email,
                        first_name: formData.name.split(" ")[0],
                        last_name: formData.name.split(" ").slice(1).join(" "),
                        identification: formData.cpf ? {
                            type: "CPF",
                            number: formData.cpf.replace(/\D/g, "")
                        } : undefined
                    },
                    external_reference: orderId
                })
            })

            const result = await response.json()

            if (result.qr_code) {
                setPixData({
                    qr_code: result.qr_code,
                    qr_code_base64: result.qr_code_base64
                })
            } else {
                throw new Error("Erro ao gerar PIX")
            }
        } catch (error: any) {
            toast({
                title: "Erro ao gerar PIX",
                description: error.message,
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }

    const copyPixCode = () => {
        if (pixData?.qr_code) {
            navigator.clipboard.writeText(pixData.qr_code)
            setCopied(true)
            toast({ title: "Código PIX copiado!" })
            setTimeout(() => setCopied(false), 3000)
        }
    }

    // SUCCESS STEP
    if (step === 3) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 pt-24">
                <div className="container mx-auto px-4 py-12 flex flex-col items-center justify-center text-center max-w-md">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                        <CheckCircle className="h-10 w-10 text-green-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Pedido Confirmado!</h1>
                    <p className="text-gray-600 mb-4">
                        Obrigado pela sua compra, {formData.name.split(" ")[0]}!
                    </p>
                    <p className="text-sm text-gray-500 mb-6">
                        Código do pedido: <span className="font-mono font-bold">{orderId.slice(0, 8)}</span>
                    </p>
                    <div className="space-y-3 w-full">
                        <Link href="/minha-conta" className="block">
                            <Button className="w-full bg-pink-500 hover:bg-pink-600">
                                Ver Meus Pedidos
                            </Button>
                        </Link>
                        <Link href="/catalogo" className="block">
                            <Button variant="outline" className="w-full">
                                Continuar Comprando
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 pt-24 pb-12">
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="mb-8">
                    <Link href="/carrinho" className="text-sm text-gray-500 hover:text-gray-900 flex items-center">
                        <ArrowLeft className="h-4 w-4 mr-1" /> Voltar ao Carrinho
                    </Link>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center justify-center gap-4 mb-8">
                    <div className={`flex items-center gap-2 ${step >= 1 ? "text-pink-600" : "text-gray-400"}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 1 ? "bg-pink-500 text-white" : "bg-gray-200"}`}>
                            1
                        </div>
                        <span className="hidden sm:inline font-medium">Dados</span>
                    </div>
                    <div className="w-12 h-0.5 bg-gray-200" />
                    <div className={`flex items-center gap-2 ${step >= 2 ? "text-pink-600" : "text-gray-400"}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 2 ? "bg-pink-500 text-white" : "bg-gray-200"}`}>
                            2
                        </div>
                        <span className="hidden sm:inline font-medium">Pagamento</span>
                    </div>
                    <div className="w-12 h-0.5 bg-gray-200" />
                    <div className={`flex items-center gap-2 ${step >= 3 ? "text-pink-600" : "text-gray-400"}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 3 ? "bg-pink-500 text-white" : "bg-gray-200"}`}>
                            3
                        </div>
                        <span className="hidden sm:inline font-medium">Confirmação</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        {/* STEP 1: Customer Data */}
                        {step === 1 && (
                            <div className="space-y-6">
                                {/* Login suggestion */}
                                {!user && (
                                    <Card className="bg-blue-50 border-blue-200">
                                        <CardContent className="p-4 flex items-center justify-between">
                                            <div>
                                                <p className="font-medium text-blue-900">Já tem uma conta?</p>
                                                <p className="text-sm text-blue-700">Faça login para preencher automaticamente</p>
                                            </div>
                                            <Link href="/auth/login?redirect=/checkout">
                                                <Button variant="outline" size="sm" className="border-blue-500 text-blue-600">
                                                    Entrar
                                                </Button>
                                            </Link>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Personal Data */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <User className="h-5 w-5 text-pink-500" />
                                            Dados Pessoais
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Nome Completo *</Label>
                                            <Input
                                                id="name"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                placeholder="Maria Silva"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email">E-mail *</Label>
                                            <Input
                                                id="email"
                                                name="email"
                                                type="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                placeholder="seu@email.com"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="phone">Telefone *</Label>
                                            <Input
                                                id="phone"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                placeholder="(00) 00000-0000"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="cpf">CPF *</Label>
                                            <Input
                                                id="cpf"
                                                name="cpf"
                                                value={formData.cpf}
                                                onChange={handleInputChange}
                                                placeholder="000.000.000-00"
                                                required
                                            />
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Address */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <MapPin className="h-5 w-5 text-pink-500" />
                                            Endereço de Entrega
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="zip">CEP *</Label>
                                                <Input
                                                    id="zip"
                                                    name="zip"
                                                    value={formData.zip}
                                                    onChange={handleInputChange}
                                                    onBlur={handleZipBlur}
                                                    placeholder="00000-000"
                                                    maxLength={9}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="col-span-2 space-y-2">
                                                <Label htmlFor="street">Rua *</Label>
                                                <Input
                                                    id="street"
                                                    name="street"
                                                    value={formData.street}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="number">Número *</Label>
                                                <Input
                                                    id="number"
                                                    name="number"
                                                    value={formData.number}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="complement">Complemento</Label>
                                                <Input
                                                    id="complement"
                                                    name="complement"
                                                    value={formData.complement}
                                                    onChange={handleInputChange}
                                                    placeholder="Apto, Bloco..."
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="neighborhood">Bairro *</Label>
                                                <Input
                                                    id="neighborhood"
                                                    name="neighborhood"
                                                    value={formData.neighborhood}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="city">Cidade *</Label>
                                                <Input
                                                    id="city"
                                                    name="city"
                                                    value={formData.city}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="state">Estado *</Label>
                                                <Input
                                                    id="state"
                                                    name="state"
                                                    value={formData.state}
                                                    onChange={handleInputChange}
                                                    maxLength={2}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Button
                                    onClick={handleGoToPayment}
                                    className="w-full bg-pink-500 hover:bg-pink-600 h-12 text-lg"
                                    disabled={loading}
                                >
                                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Ir para Pagamento"}
                                </Button>
                            </div>
                        )}

                        {/* STEP 2: Payment */}
                        {step === 2 && (
                            <div className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Lock className="h-5 w-5 text-green-600" />
                                            Escolha a forma de pagamento
                                        </CardTitle>
                                        <CardDescription>
                                            Pagamento 100% seguro
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <RadioGroup
                                            value={paymentMethod}
                                            onValueChange={(v) => setPaymentMethod(v as "card" | "pix")}
                                            className="space-y-3"
                                        >
                                            <div className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${paymentMethod === "card" ? "border-pink-500 bg-pink-50" : "border-gray-200"}`}>
                                                <RadioGroupItem value="card" id="card" />
                                                <Label htmlFor="card" className="flex items-center gap-3 cursor-pointer flex-1">
                                                    <CreditCard className="h-5 w-5 text-gray-600" />
                                                    <div>
                                                        <p className="font-medium">Cartão de Crédito</p>
                                                        <p className="text-sm text-gray-500">Em até 12x sem juros</p>
                                                    </div>
                                                </Label>
                                            </div>
                                            <div className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${paymentMethod === "pix" ? "border-pink-500 bg-pink-50" : "border-gray-200"}`}>
                                                <RadioGroupItem value="pix" id="pix" />
                                                <Label htmlFor="pix" className="flex items-center gap-3 cursor-pointer flex-1">
                                                    <QrCode className="h-5 w-5 text-gray-600" />
                                                    <div>
                                                        <p className="font-medium">PIX</p>
                                                        <p className="text-sm text-gray-500">Aprovação instantânea</p>
                                                    </div>
                                                </Label>
                                            </div>
                                        </RadioGroup>
                                    </CardContent>
                                </Card>

                                {/* Card Form */}
                                {paymentMethod === "card" && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Dados do Cartão</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="cardNumber">Número do Cartão</Label>
                                                <Input
                                                    id="cardNumber"
                                                    name="number"
                                                    value={cardData.number}
                                                    onChange={handleCardInputChange}
                                                    placeholder="0000 0000 0000 0000"
                                                    maxLength={19}
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="cardExpiry">Validade</Label>
                                                    <Input
                                                        id="cardExpiry"
                                                        name="expiry"
                                                        value={cardData.expiry}
                                                        onChange={handleCardInputChange}
                                                        placeholder="MM/AA"
                                                        maxLength={5}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="cardCvv">CVV</Label>
                                                    <Input
                                                        id="cardCvv"
                                                        name="cvv"
                                                        value={cardData.cvv}
                                                        onChange={handleCardInputChange}
                                                        placeholder="123"
                                                        maxLength={4}
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="cardName">Nome no Cartão</Label>
                                                <Input
                                                    id="cardName"
                                                    name="name"
                                                    value={cardData.name}
                                                    onChange={handleCardInputChange}
                                                    placeholder="NOME COMO ESTÁ NO CARTÃO"
                                                    className="uppercase"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="installments">Parcelas</Label>
                                                <select
                                                    id="installments"
                                                    value={cardData.installments}
                                                    onChange={(e) => setCardData(prev => ({ ...prev, installments: Number(e.target.value) }))}
                                                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                                                >
                                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => (
                                                        <option key={n} value={n}>
                                                            {n}x de {formatCurrency((cartTotal + shippingCost) / n)} sem juros
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <Button
                                                onClick={handlePayWithCard}
                                                className="w-full bg-green-600 hover:bg-green-700 h-12 text-lg"
                                                disabled={loading}
                                            >
                                                {loading ? (
                                                    <Loader2 className="h-5 w-5 animate-spin" />
                                                ) : (
                                                    <>
                                                        <Lock className="h-4 w-4 mr-2" />
                                                        Pagar {formatCurrency(cartTotal + shippingCost)}
                                                    </>
                                                )}
                                            </Button>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* PIX */}
                                {paymentMethod === "pix" && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Pagamento via PIX</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            {!pixData ? (
                                                <div className="text-center py-8">
                                                    <QrCode className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                                    <p className="text-gray-600 mb-4">
                                                        Clique no botão abaixo para gerar o código PIX
                                                    </p>
                                                    <Button
                                                        onClick={handlePayWithPix}
                                                        className="bg-green-600 hover:bg-green-700"
                                                        disabled={loading}
                                                    >
                                                        {loading ? (
                                                            <Loader2 className="h-5 w-5 animate-spin" />
                                                        ) : (
                                                            "Gerar PIX"
                                                        )}
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="text-center space-y-4">
                                                    {pixData.qr_code_base64 && (
                                                        <div className="flex justify-center">
                                                            <Image
                                                                src={`data:image/png;base64,${pixData.qr_code_base64}`}
                                                                alt="QR Code PIX"
                                                                width={200}
                                                                height={200}
                                                                className="border rounded-lg"
                                                            />
                                                        </div>
                                                    )}
                                                    <p className="text-sm text-gray-600">
                                                        Escaneie o QR Code ou copie o código abaixo
                                                    </p>
                                                    <div className="bg-gray-50 p-3 rounded-lg">
                                                        <code className="text-xs break-all block mb-2">
                                                            {pixData.qr_code?.slice(0, 50)}...
                                                        </code>
                                                        <Button
                                                            onClick={copyPixCode}
                                                            variant="outline"
                                                            size="sm"
                                                            className="gap-2"
                                                        >
                                                            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                                            {copied ? "Copiado!" : "Copiar código"}
                                                        </Button>
                                                    </div>
                                                    <p className="text-sm text-gray-500">
                                                        Após o pagamento, você será notificado automaticamente
                                                    </p>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                )}

                                <Button
                                    variant="outline"
                                    onClick={() => setStep(1)}
                                    className="w-full"
                                >
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Voltar para dados
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <Card className="sticky top-24">
                            <CardHeader>
                                <CardTitle>Resumo do Pedido</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {items.map((item) => (
                                    <div key={`${item.id}-${item.customizationName}`} className="flex gap-3">
                                        <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden relative flex-shrink-0">
                                            <Image
                                                src={item.images[0]?.image_url || "/placeholder.svg"}
                                                alt={item.name}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm truncate">{item.name}</p>
                                            {item.customizationName && (
                                                <p className="text-xs text-pink-600">Bordado: {item.customizationName}</p>
                                            )}
                                            <p className="text-sm text-gray-600">
                                                {item.quantity}x {formatCurrency(Number(item.price))}
                                            </p>
                                        </div>
                                    </div>
                                ))}

                                <Separator />

                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Subtotal</span>
                                        <span>{formatCurrency(cartTotal)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Frete</span>
                                        <span>{shippingCost > 0 ? formatCurrency(shippingCost) : "A calcular"}</span>
                                    </div>
                                </div>

                                <Separator />

                                <div className="flex justify-between font-bold text-lg">
                                    <span>Total</span>
                                    <span className="text-pink-600">{formatCurrency(cartTotal + shippingCost)}</span>
                                </div>

                                <div className="bg-green-50 p-3 rounded-lg flex items-center gap-2 text-green-700 text-sm">
                                    <ShieldCheck className="h-4 w-4" />
                                    <span>Compra 100% segura</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
