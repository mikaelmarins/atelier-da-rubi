"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
    Package,
    Search,
    Truck,
    Clock,
    CheckCircle2,
    XCircle,
    CreditCard,
    MapPin,
    ArrowLeft,
    ExternalLink,
    Loader2,
    AlertCircle,
    Mail
} from "lucide-react"
import Link from "next/link"
import { formatCurrency } from "@/lib/utils"

interface OrderItem {
    name: string
    quantity: number
    price: number
}

interface Order {
    id: string
    status: string
    payment_status: string
    tracking_code: string | null
    tracking_url: string | null
    total_amount: number
    shipping_cost: number
    created_at: string
    updated_at: string
    items: OrderItem[]
    address: {
        city: string
        state: string
    }
}

interface OrderSummary {
    id: string
    status: string
    payment_status: string
    tracking_code: string | null
    total_amount: number
    created_at: string
}

const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
    pending: { label: "Aguardando Pagamento", color: "text-yellow-600 bg-yellow-50", icon: Clock },
    pending_payment: { label: "Processando Pagamento", color: "text-yellow-600 bg-yellow-50", icon: CreditCard },
    paid: { label: "Pagamento Confirmado", color: "text-green-600 bg-green-50", icon: CheckCircle2 },
    processing: { label: "Preparando Pedido", color: "text-blue-600 bg-blue-50", icon: Package },
    shipped: { label: "Enviado", color: "text-purple-600 bg-purple-50", icon: Truck },
    delivered: { label: "Entregue", color: "text-green-600 bg-green-50", icon: CheckCircle2 },
    cancelled: { label: "Cancelado", color: "text-red-600 bg-red-50", icon: XCircle },
    refunded: { label: "Reembolsado", color: "text-gray-600 bg-gray-50", icon: XCircle }
}

export default function MeusPedidosPage() {
    const [searchType, setSearchType] = useState<"id" | "email">("id")
    const [searchValue, setSearchValue] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [order, setOrder] = useState<Order | null>(null)
    const [orders, setOrders] = useState<OrderSummary[]>([])
    const [searched, setSearched] = useState(false)

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!searchValue.trim()) return

        setLoading(true)
        setError(null)
        setOrder(null)
        setOrders([])
        setSearched(true)

        try {
            const param = searchType === "id" ? `id=${searchValue}` : `email=${searchValue}`
            const response = await fetch(`/api/orders?${param}`)
            const data = await response.json()

            if (!response.ok) {
                setError(data.error || "Erro ao buscar pedido")
                return
            }

            if (searchType === "id") {
                setOrder(data)
            } else {
                setOrders(data.orders || [])
            }
        } catch (err) {
            setError("Erro de conexão. Tente novamente.")
        } finally {
            setLoading(false)
        }
    }

    const getStatusInfo = (status: string) => {
        return statusConfig[status] || statusConfig.pending
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        })
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 pt-24 pb-12">
            <div className="container mx-auto px-4 max-w-3xl">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href="/"
                        className="text-sm text-gray-500 hover:text-gray-900 flex items-center mb-4"
                    >
                        <ArrowLeft className="h-4 w-4 mr-1" /> Voltar ao Início
                    </Link>
                    <h1 className="text-3xl md:text-4xl font-dancing font-bold text-gray-800 mb-2">
                        Meus Pedidos
                    </h1>
                    <p className="text-gray-600">
                        Acompanhe o status do seu pedido e informações de entrega.
                    </p>
                </div>

                {/* Search Form */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Search className="h-5 w-5 text-pink-500" />
                            Buscar Pedido
                        </CardTitle>
                        <CardDescription>
                            Encontre seu pedido pelo código ou e-mail.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Search Type Toggle */}
                        <div className="flex gap-2 mb-4">
                            <Button
                                type="button"
                                variant={searchType === "id" ? "default" : "outline"}
                                size="sm"
                                onClick={() => { setSearchType("id"); setSearchValue(""); }}
                                className={searchType === "id" ? "bg-pink-500 hover:bg-pink-600" : ""}
                            >
                                <Package className="h-4 w-4 mr-1" />
                                Código do Pedido
                            </Button>
                            <Button
                                type="button"
                                variant={searchType === "email" ? "default" : "outline"}
                                size="sm"
                                onClick={() => { setSearchType("email"); setSearchValue(""); }}
                                className={searchType === "email" ? "bg-pink-500 hover:bg-pink-600" : ""}
                            >
                                <Mail className="h-4 w-4 mr-1" />
                                Meu E-mail
                            </Button>
                        </div>

                        <form onSubmit={handleSearch} className="flex gap-2">
                            <Input
                                type={searchType === "email" ? "email" : "text"}
                                placeholder={searchType === "id" ? "Ex: abc123-def456-..." : "seu@email.com"}
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                                className="flex-1"
                            />
                            <Button
                                type="submit"
                                disabled={loading || !searchValue.trim()}
                                className="bg-pink-500 hover:bg-pink-600"
                            >
                                {loading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Search className="h-4 w-4" />
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Error State */}
                {error && (
                    <Card className="mb-8 border-red-200 bg-red-50">
                        <CardContent className="py-6 flex items-center gap-3">
                            <AlertCircle className="h-5 w-5 text-red-500" />
                            <p className="text-red-700">{error}</p>
                        </CardContent>
                    </Card>
                )}

                {/* No Results */}
                {searched && !loading && !error && !order && orders.length === 0 && (
                    <Card className="mb-8">
                        <CardContent className="py-12 text-center">
                            <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                Nenhum pedido encontrado
                            </h3>
                            <p className="text-gray-600 mb-4">
                                Verifique se o código ou e-mail está correto.
                            </p>
                            <Button asChild variant="outline">
                                <Link href="/catalogo">Ver Catálogo</Link>
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Order List (when searching by email) */}
                {orders.length > 0 && (
                    <div className="space-y-4 mb-8">
                        <h2 className="text-lg font-semibold text-gray-800">
                            Seus Pedidos ({orders.length})
                        </h2>
                        {orders.map((o) => {
                            const statusInfo = getStatusInfo(o.status)
                            return (
                                <Card
                                    key={o.id}
                                    className="hover:shadow-md transition-shadow cursor-pointer"
                                    onClick={() => {
                                        setSearchType("id")
                                        setSearchValue(o.id)
                                        setOrders([])
                                        // Trigger search
                                        fetch(`/api/orders?id=${o.id}`)
                                            .then(res => res.json())
                                            .then(data => setOrder(data))
                                    }}
                                >
                                    <CardContent className="py-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-gray-500 mb-1">
                                                    {formatDate(o.created_at)}
                                                </p>
                                                <p className="font-mono text-sm text-gray-600">
                                                    #{o.id.slice(0, 8)}...
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                                                    <statusInfo.icon className="h-3 w-3" />
                                                    {statusInfo.label}
                                                </span>
                                                <p className="font-bold text-gray-800 mt-1">
                                                    {formatCurrency(o.total_amount)}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                )}

                {/* Order Details */}
                {order && (
                    <div className="space-y-6">
                        {/* Status Card */}
                        <Card>
                            <CardContent className="py-6">
                                {(() => {
                                    const statusInfo = getStatusInfo(order.status)
                                    return (
                                        <div className="text-center">
                                            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${statusInfo.color} mb-4`}>
                                                <statusInfo.icon className="h-8 w-8" />
                                            </div>
                                            <h2 className="text-xl font-bold text-gray-800 mb-1">
                                                {statusInfo.label}
                                            </h2>
                                            <p className="text-sm text-gray-500">
                                                Pedido #{order.id.slice(0, 8)}...
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                Atualizado em {formatDate(order.updated_at || order.created_at)}
                                            </p>
                                        </div>
                                    )
                                })()}
                            </CardContent>
                        </Card>

                        {/* Tracking Info */}
                        {order.tracking_code && (
                            <Card className="border-purple-200 bg-purple-50">
                                <CardContent className="py-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Truck className="h-5 w-5 text-purple-600" />
                                            <div>
                                                <p className="text-sm text-purple-700 font-medium">
                                                    Código de Rastreamento
                                                </p>
                                                <p className="font-mono font-bold text-purple-900">
                                                    {order.tracking_code}
                                                </p>
                                            </div>
                                        </div>
                                        {order.tracking_url && (
                                            <Button asChild size="sm" variant="outline" className="border-purple-300">
                                                <a href={order.tracking_url} target="_blank" rel="noopener noreferrer">
                                                    Rastrear <ExternalLink className="h-3 w-3 ml-1" />
                                                </a>
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Order Items */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Itens do Pedido</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {order.items?.map((item, index) => (
                                        <div key={index} className="flex justify-between items-center">
                                            <div>
                                                <p className="font-medium text-gray-800">{item.name}</p>
                                                <p className="text-sm text-gray-500">Qtd: {item.quantity}</p>
                                            </div>
                                            <p className="font-semibold">{formatCurrency(item.price * item.quantity)}</p>
                                        </div>
                                    ))}
                                </div>

                                <Separator className="my-4" />

                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Frete</span>
                                        <span>{order.shipping_cost === 0 ? "Grátis" : formatCurrency(order.shipping_cost)}</span>
                                    </div>
                                    <div className="flex justify-between text-lg font-bold">
                                        <span>Total</span>
                                        <span className="text-pink-600">{formatCurrency(order.total_amount)}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Delivery Address */}
                        <Card>
                            <CardContent className="py-4">
                                <div className="flex items-center gap-3">
                                    <MapPin className="h-5 w-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-500">Endereço de Entrega</p>
                                        <p className="font-medium text-gray-800">
                                            {order.address.city}, {order.address.state}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Help Section */}
                        <Card className="bg-gray-50">
                            <CardContent className="py-4 text-center">
                                <p className="text-sm text-gray-600 mb-2">
                                    Precisa de ajuda com seu pedido?
                                </p>
                                <Button asChild variant="outline" size="sm">
                                    <a
                                        href={`https://wa.me/5522997890934?text=Olá! Preciso de ajuda com meu pedido ${order.id.slice(0, 8)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        Falar no WhatsApp
                                    </a>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Initial State - Tips */}
                {!searched && (
                    <Card className="bg-gray-50">
                        <CardContent className="py-8 text-center">
                            <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">
                                Como encontrar meu pedido?
                            </h3>
                            <ul className="text-sm text-gray-600 space-y-2 max-w-md mx-auto text-left">
                                <li className="flex items-start gap-2">
                                    <span className="text-pink-500">•</span>
                                    Use o <strong>código do pedido</strong> que você recebeu após a compra
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-pink-500">•</span>
                                    Ou informe o <strong>e-mail usado na compra</strong> para ver todos seus pedidos
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-pink-500">•</span>
                                    O código de rastreio aparecerá quando o pedido for enviado
                                </li>
                            </ul>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}
