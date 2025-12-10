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
    QrCode, ShieldCheck, Copy, Check, User, MapPin, AlertTriangle
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { OrderService } from "@/lib/order-service"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

export default function CheckoutPage() {
    const { items, cartTotal, clearCart } = useCart()
    const { user, profile, addresses } = useAuth()
    const router = useRouter()
    const { toast } = useToast()

    const [loading, setLoading] = useState(false)
    const [step, setStep] = useState(1) // 1: Dados, 2: Pagamento, 3: Sucesso
    const [paymentMethod, setPaymentMethod] = useState<"card" | "pix">("pix")
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

    // Card brand detection
    const [cardBrand, setCardBrand] = useState<string | null>(null)

    // Detect card brand from number
    const detectCardBrand = (number: string): string | null => {
        const cleanNumber = number.replace(/\s/g, "")
        if (/^4/.test(cleanNumber)) return "visa"
        if (/^5[1-5]/.test(cleanNumber) || /^2[2-7]/.test(cleanNumber)) return "mastercard"
        if (/^3[47]/.test(cleanNumber)) return "amex"
        if (/^(636368|438935|504175|451416|636297|5067|4576|4011|506699)/.test(cleanNumber)) return "elo"
        if (/^(606282|3841)/.test(cleanNumber)) return "hipercard"
        if (/^(30[0-5]|36|38|39)/.test(cleanNumber)) return "diners"
        return null
    }

    // PIX data
    const [pixData, setPixData] = useState<{
        qr_code?: string
        qr_code_base64?: string
    } | null>(null)

    const [shippingCost, setShippingCost] = useState(0)
    const [copied, setCopied] = useState(false)

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
        if (addresses && addresses.length > 0) {
            const defaultAddress = addresses.find(a => a.is_default) || addresses[0]
            setFormData(prev => ({
                ...prev,
                zip: defaultAddress.zip || prev.zip,
                street: defaultAddress.street || prev.street,
                number: defaultAddress.number || prev.number,
                complement: defaultAddress.complement || prev.complement,
                neighborhood: defaultAddress.neighborhood || prev.neighborhood,
                city: defaultAddress.city || prev.city,
                state: defaultAddress.state || prev.state
            }))
        }
    }, [profile, addresses])

    // Empty cart check
    if (items.length === 0 && step !== 3) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center p-8">
                <div className="text-center space-y-4">
                    <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                        <CreditCard className="h-12 w-12 text-gray-400" />
                    </div>
                    <h2 className="text-2xl font-semibold text-gray-800">Carrinho vazio</h2>
                    <p className="text-gray-500">Adicione produtos ao carrinho para continuar</p>
                    <Link href="/catalogo">
                        <Button className="bg-pink-500 hover:bg-pink-600">
                            Ver Catálogo
                        </Button>
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

        if (name === "number") {
            const formatted = value.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})/g, "$1 ").trim()
            setCardData((prev) => ({ ...prev, number: formatted }))
            const brand = detectCardBrand(formatted)
            setCardBrand(brand)
            return
        }

        if (name === "expiry") {
            const formatted = value.replace(/\D/g, "").slice(0, 4).replace(/(\d{2})(\d{0,2})/, "$1/$2")
            setCardData((prev) => ({ ...prev, expiry: formatted }))
            return
        }

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
        setStep(2)
    }

    // Helper to create order after successful payment
    const createOrderAfterPayment = async (paymentId: string, paymentMethod: string) => {
        try {
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
                totalAmount: cartTotal + shippingCost,
            })

            if (order) {
                setOrderId(order.id)
                await supabase
                    .from("orders")
                    .update({
                        payment_id: paymentId,
                        payment_method: paymentMethod,
                        payment_status: "paid",
                        status: "paid"
                    })
                    .eq("id", order.id)
            }
            return order
        } catch (error) {
            console.error("Error creating order:", error)
            throw error
        }
    }

    // TODO: Implementar pagamento com InfinitePay
    const handlePayWithCard = async () => {
        if (!cardData.number || !cardData.expiry || !cardData.cvv || !cardData.name) {
            toast({ title: "Preencha todos os dados do cartão", variant: "destructive" })
            return
        }

        toast({
            title: "Pagamento em manutenção",
            description: "O pagamento com cartão estará disponível em breve. Por favor, utilize o PIX.",
            variant: "destructive"
        })
    }

    // TODO: Implementar pagamento PIX com InfinitePay
    const handlePayWithPix = async () => {
        toast({
            title: "Pagamento em manutenção",
            description: "O pagamento via PIX estará disponível em breve.",
            variant: "destructive"
        })
    }

    const copyPixCode = () => {
        if (pixData?.qr_code) {
            navigator.clipboard.writeText(pixData.qr_code)
            setCopied(true)
            toast({ title: "Código PIX copiado!" })
            setTimeout(() => setCopied(false), 3000)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white py-8">
            <div className="container mx-auto px-4 max-w-6xl">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/carrinho">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-800">Finalizar Compra</h1>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center justify-center mb-8">
                    <div className="flex items-center gap-4">
                        <div className={`flex items-center gap-2 ${step >= 1 ? "text-pink-500" : "text-gray-400"}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? "bg-pink-500 text-white" : "bg-gray-200"}`}>
                                {step > 1 ? <Check className="h-4 w-4" /> : "1"}
                            </div>
                            <span className="hidden sm:inline font-medium">Dados</span>
                        </div>
                        <div className={`w-16 h-0.5 ${step >= 2 ? "bg-pink-500" : "bg-gray-200"}`} />
                        <div className={`flex items-center gap-2 ${step >= 2 ? "text-pink-500" : "text-gray-400"}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? "bg-pink-500 text-white" : "bg-gray-200"}`}>
                                {step > 2 ? <Check className="h-4 w-4" /> : "2"}
                            </div>
                            <span className="hidden sm:inline font-medium">Pagamento</span>
                        </div>
                        <div className={`w-16 h-0.5 ${step >= 3 ? "bg-pink-500" : "bg-gray-200"}`} />
                        <div className={`flex items-center gap-2 ${step >= 3 ? "text-pink-500" : "text-gray-400"}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? "bg-pink-500 text-white" : "bg-gray-200"}`}>
                                {step >= 3 ? <Check className="h-4 w-4" /> : "3"}
                            </div>
                            <span className="hidden sm:inline font-medium">Confirmação</span>
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        {/* STEP 1: Personal Data & Address */}
                        {step === 1 && (
                            <div className="space-y-6">
                                {/* Personal Data */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <User className="h-5 w-5 text-pink-500" />
                                            Dados Pessoais
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="name">Nome Completo *</Label>
                                                <Input
                                                    id="name"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleInputChange}
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
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                {/* Payment Methods */}
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
                                        {/* Maintenance Notice */}
                                        <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
                                            <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                                            <div>
                                                <p className="font-medium text-amber-800">Sistema de pagamento em manutenção</p>
                                                <p className="text-sm text-amber-700">Estamos atualizando nossa plataforma de pagamento. Em breve você poderá pagar com PIX e Cartão.</p>
                                            </div>
                                        </div>

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
                                                        <p className="text-sm text-gray-500">Em até 12x</p>
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
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className="text-xs text-gray-500">Aceitamos:</span>
                                                <div className="flex gap-1">
                                                    {["visa", "mastercard", "amex", "elo", "hipercard"].map((brand) => (
                                                        <div
                                                            key={brand}
                                                            className={`w-10 h-6 rounded border flex items-center justify-center text-[10px] font-bold uppercase transition-all ${cardBrand === brand
                                                                ? "border-pink-500 bg-pink-50 text-pink-600 scale-110"
                                                                : "border-gray-200 bg-gray-50 text-gray-400"
                                                                }`}
                                                        >
                                                            {brand === "visa" && "VISA"}
                                                            {brand === "mastercard" && "MC"}
                                                            {brand === "amex" && "AMEX"}
                                                            {brand === "elo" && "ELO"}
                                                            {brand === "hipercard" && "HIPER"}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="cardNumber">Número do Cartão</Label>
                                                <div className="relative">
                                                    <Input
                                                        id="cardNumber"
                                                        name="number"
                                                        value={cardData.number}
                                                        onChange={handleCardInputChange}
                                                        placeholder="0000 0000 0000 0000"
                                                        maxLength={19}
                                                        className="pr-16"
                                                    />
                                                    {cardBrand && (
                                                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                            <div className={`px-2 py-1 rounded text-xs font-bold uppercase ${cardBrand === "visa" ? "bg-blue-100 text-blue-700" :
                                                                cardBrand === "mastercard" ? "bg-red-100 text-red-700" :
                                                                    cardBrand === "amex" ? "bg-blue-100 text-blue-700" :
                                                                        cardBrand === "elo" ? "bg-yellow-100 text-yellow-700" :
                                                                            cardBrand === "hipercard" ? "bg-orange-100 text-orange-700" :
                                                                                "bg-gray-100 text-gray-700"
                                                                }`}>
                                                                {cardBrand === "mastercard" ? "MC" : cardBrand}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
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
                                                            {n}x de {formatCurrency((cartTotal + shippingCost) / n)} {n === 1 ? "à vista" : "sem juros"}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <Button
                                                onClick={handlePayWithCard}
                                                className="w-full bg-pink-500 hover:bg-pink-600 h-12"
                                                disabled={loading}
                                            >
                                                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : `Pagar ${formatCurrency(cartTotal + shippingCost)}`}
                                            </Button>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* PIX Form */}
                                {paymentMethod === "pix" && !pixData && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <QrCode className="h-5 w-5 text-green-600" />
                                                Pagamento via PIX
                                            </CardTitle>
                                            <CardDescription>
                                                Pagamento instantâneo e seguro
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <p className="text-sm text-gray-600">
                                                    Ao clicar em &quot;Gerar PIX&quot;, você receberá um QR Code para realizar o pagamento.
                                                    O pedido será confirmado automaticamente após a transferência.
                                                </p>
                                            </div>
                                            <Button
                                                onClick={handlePayWithPix}
                                                className="w-full bg-green-600 hover:bg-green-700 h-12"
                                                disabled={loading}
                                            >
                                                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Gerar PIX"}
                                            </Button>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* PIX QR Code Display */}
                                {paymentMethod === "pix" && pixData && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2 text-green-600">
                                                <CheckCircle className="h-5 w-5" />
                                                PIX Gerado com Sucesso
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="flex flex-col items-center gap-4">
                                                {pixData.qr_code_base64 && (
                                                    <Image
                                                        src={`data:image/png;base64,${pixData.qr_code_base64}`}
                                                        alt="QR Code PIX"
                                                        width={200}
                                                        height={200}
                                                        className="border rounded-lg"
                                                    />
                                                )}
                                                <div className="w-full">
                                                    <p className="text-sm text-gray-500 mb-2">Ou copie o código:</p>
                                                    <div className="flex gap-2">
                                                        <Input
                                                            value={pixData.qr_code || ""}
                                                            readOnly
                                                            className="text-xs"
                                                        />
                                                        <Button
                                                            variant="outline"
                                                            onClick={copyPixCode}
                                                            className="shrink-0"
                                                        >
                                                            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="bg-amber-50 p-4 rounded-lg">
                                                <p className="text-sm text-amber-800">
                                                    ⏱️ O PIX expira em 30 minutos. Após o pagamento, você receberá a confirmação por e-mail.
                                                </p>
                                            </div>
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

                        {/* STEP 3: Success */}
                        {step === 3 && (
                            <Card className="text-center py-12">
                                <CardContent className="space-y-6">
                                    <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                                        <CheckCircle className="h-10 w-10 text-green-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-800 mb-2">
                                            Pedido Confirmado!
                                        </h2>
                                        <p className="text-gray-600">
                                            Obrigada por comprar no Atelier da Rubi
                                        </p>
                                        {orderId && (
                                            <p className="text-sm text-gray-500 mt-2">
                                                Número do pedido: <span className="font-mono font-bold">{orderId.slice(0, 8).toUpperCase()}</span>
                                            </p>
                                        )}
                                    </div>
                                    <div className="bg-pink-50 p-4 rounded-lg">
                                        <p className="text-sm text-pink-800">
                                            📧 Enviamos um e-mail de confirmação com os detalhes do seu pedido.
                                        </p>
                                    </div>
                                    <div className="flex gap-4 justify-center">
                                        <Link href="/catalogo">
                                            <Button variant="outline">
                                                Continuar Comprando
                                            </Button>
                                        </Link>
                                        <Link href="/">
                                            <Button className="bg-pink-500 hover:bg-pink-600">
                                                Voltar ao Início
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Order Summary Sidebar */}
                    {step !== 3 && (
                        <div className="lg:col-span-1">
                            <Card className="sticky top-4">
                                <CardHeader>
                                    <CardTitle>Resumo do Pedido</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Items */}
                                    <div className="space-y-3 max-h-60 overflow-y-auto">
                                        {items.map((item, index) => (
                                            <div key={`checkout-${item.product.id}-${item.customization || 'base'}-${index}`} className="flex gap-3">
                                                <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                                                    {item.product.images?.[0]?.image_url ? (
                                                        <Image
                                                            src={item.product.images[0].image_url}
                                                            alt={item.product.name}
                                                            width={64}
                                                            height={64}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                            <CreditCard className="h-6 w-6" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-800 truncate">
                                                        {item.product.name}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        Qtd: {item.quantity}
                                                    </p>
                                                    <p className="text-sm font-medium text-pink-600">
                                                        {formatCurrency(item.product.price * item.quantity)}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <Separator />

                                    {/* Totals */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Subtotal</span>
                                            <span>{formatCurrency(cartTotal)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Frete</span>
                                            <span>{shippingCost > 0 ? formatCurrency(shippingCost) : "A calcular"}</span>
                                        </div>
                                        <Separator />
                                        <div className="flex justify-between font-bold text-lg">
                                            <span>Total</span>
                                            <span className="text-pink-600">{formatCurrency(cartTotal + shippingCost)}</span>
                                        </div>
                                    </div>

                                    {/* Security Badge */}
                                    <div className="bg-gray-50 p-3 rounded-lg flex items-center gap-2">
                                        <ShieldCheck className="h-5 w-5 text-green-600" />
                                        <span className="text-xs text-gray-600">
                                            Compra 100% segura
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
