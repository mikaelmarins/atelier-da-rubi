"use client"

import { useState, useEffect, Suspense } from "react"
import { useAuth } from "@/context/auth-context"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
    User, Mail, Phone, MapPin, LogOut, ShoppingBag, Package,
    Clock, CheckCircle, Truck, XCircle, Eye, Lock, Loader2
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { toast } from "@/hooks/use-toast"
import { formatCurrency } from "@/lib/utils"

interface Order {
    id: string
    created_at: string
    status: string
    total: number
    subtotal: number
    shipping_cost: number
    discount: number
    items: any[]
    shipping_address: any
    tracking_code?: string
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    pending: { label: "Pendente", color: "bg-yellow-100 text-yellow-800", icon: <Clock className="h-4 w-4" /> },
    paid: { label: "Pago", color: "bg-green-100 text-green-800", icon: <CheckCircle className="h-4 w-4" /> },
    processing: { label: "Em Preparo", color: "bg-blue-100 text-blue-800", icon: <Package className="h-4 w-4" /> },
    shipped: { label: "Enviado", color: "bg-purple-100 text-purple-800", icon: <Truck className="h-4 w-4" /> },
    delivered: { label: "Entregue", color: "bg-emerald-100 text-emerald-800", icon: <CheckCircle className="h-4 w-4" /> },
    cancelled: { label: "Cancelado", color: "bg-red-100 text-red-800", icon: <XCircle className="h-4 w-4" /> },
}

function MinhaContaContent() {
    const { user, profile, signOut, loading: authLoading } = useAuth()
    const router = useRouter()
    const searchParams = useSearchParams()
    const [orders, setOrders] = useState<Order[]>([])
    const [loadingOrders, setLoadingOrders] = useState(true)
    const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "pedidos")

    // Password change state
    const [currentPassword, setCurrentPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [changingPassword, setChangingPassword] = useState(false)

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/auth/login")
        }
    }, [user, authLoading, router])

    useEffect(() => {
        if (user) {
            loadOrders()
        }
    }, [user])

    const loadOrders = async () => {
        try {
            const { data, error } = await supabase
                .from("orders")
                .select("*")
                .eq("user_id", user?.id)
                .order("created_at", { ascending: false })

            if (error) throw error
            setOrders(data || [])
        } catch (error) {
            console.error("Error loading orders:", error)
        } finally {
            setLoadingOrders(false)
        }
    }

    const handleLogout = async () => {
        await signOut()
        router.push("/")
    }

    const handleChangePassword = async () => {
        if (newPassword !== confirmPassword) {
            toast({ title: "Erro", description: "As senhas não coincidem", variant: "destructive" })
            return
        }
        if (newPassword.length < 6) {
            toast({ title: "Erro", description: "A senha deve ter pelo menos 6 caracteres", variant: "destructive" })
            return
        }

        setChangingPassword(true)
        try {
            const { error } = await supabase.auth.updateUser({ password: newPassword })
            if (error) throw error

            toast({ title: "Sucesso!", description: "Senha alterada com sucesso" })
            setCurrentPassword("")
            setNewPassword("")
            setConfirmPassword("")
        } catch (error: any) {
            toast({ title: "Erro", description: error.message || "Erro ao alterar senha", variant: "destructive" })
        } finally {
            setChangingPassword(false)
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "long",
            year: "numeric"
        })
    }

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-20">
                <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
            </div>
        )
    }

    if (!user) return null

    return (
        <div className="container mx-auto px-4 py-24 pt-28 max-w-4xl min-h-screen">
            {/* Header */}
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Minha Conta</h1>
                    <p className="text-gray-600 mt-1">
                        Olá, {profile?.name || "cliente"}! 👋
                    </p>
                </div>
                <Button variant="outline" onClick={handleLogout} className="gap-2 text-gray-600">
                    <LogOut className="h-4 w-4" />
                    Sair
                </Button>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-8">
                    <TabsTrigger value="pedidos" className="gap-2">
                        <Package className="h-4 w-4" />
                        Pedidos
                    </TabsTrigger>
                    <TabsTrigger value="enderecos" className="gap-2">
                        <MapPin className="h-4 w-4" />
                        Endereços
                    </TabsTrigger>
                    <TabsTrigger value="perfil" className="gap-2">
                        <User className="h-4 w-4" />
                        Perfil
                    </TabsTrigger>
                </TabsList>

                {/* PEDIDOS TAB */}
                <TabsContent value="pedidos">
                    {loadingOrders ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
                        </div>
                    ) : orders.length === 0 ? (
                        <Card>
                            <CardContent className="py-12 text-center">
                                <Package className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum pedido encontrado</h3>
                                <p className="text-gray-500 mb-6">Você ainda não fez nenhum pedido.</p>
                                <Button asChild className="bg-pink-500 hover:bg-pink-600">
                                    <a href="/catalogo">
                                        <ShoppingBag className="h-4 w-4 mr-2" />
                                        Explorar Catálogo
                                    </a>
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {orders.map((order) => {
                                const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending
                                const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items || []
                                const address = typeof order.shipping_address === 'string' ? JSON.parse(order.shipping_address) : order.shipping_address

                                return (
                                    <Card key={order.id} className="overflow-hidden">
                                        <CardHeader className="bg-gray-50 py-4">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                                <div>
                                                    <p className="text-sm font-mono text-gray-500">#{order.id.slice(0, 8).toUpperCase()}</p>
                                                    <p className="text-sm text-gray-600">{formatDate(order.created_at)}</p>
                                                </div>
                                                <Badge className={`${statusConfig.color} gap-1 font-medium`}>
                                                    {statusConfig.icon}
                                                    {statusConfig.label}
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="py-4">
                                            {/* Order Summary */}
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 pb-4 border-b">
                                                <div>
                                                    <p className="text-sm text-gray-500">{items.length} {items.length === 1 ? 'item' : 'itens'}</p>
                                                    <p className="text-xl font-bold text-pink-600">{formatCurrency(order.total)}</p>
                                                </div>
                                                {order.tracking_code && (
                                                    <div className="mt-2 sm:mt-0 p-2 bg-green-50 rounded-lg">
                                                        <p className="text-xs text-green-600 font-medium">Código de rastreio</p>
                                                        <p className="text-sm font-mono">{order.tracking_code}</p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Items */}
                                            <div className="space-y-2 mb-4">
                                                <p className="text-xs font-medium text-gray-500 uppercase">Itens do Pedido</p>
                                                {items.map((item: any, idx: number) => (
                                                    <div key={idx} className="flex justify-between items-start p-2 bg-gray-50 rounded">
                                                        <div className="flex-1">
                                                            <p className="text-sm font-medium">{item.quantity}x {item.name}</p>
                                                            {item.customization && (
                                                                <p className="text-xs text-gray-500">{item.customization}</p>
                                                            )}
                                                        </div>
                                                        <p className="text-sm font-medium text-gray-700">
                                                            {formatCurrency(item.price * item.quantity)}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Pricing Details */}
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4 text-sm">
                                                <div className="p-2 bg-gray-50 rounded">
                                                    <p className="text-xs text-gray-500">Subtotal</p>
                                                    <p className="font-medium">{formatCurrency(order.subtotal || order.total)}</p>
                                                </div>
                                                <div className="p-2 bg-gray-50 rounded">
                                                    <p className="text-xs text-gray-500">Frete</p>
                                                    <p className="font-medium">{order.shipping_cost === 0 ? 'Grátis' : formatCurrency(order.shipping_cost || 0)}</p>
                                                </div>
                                                {order.discount > 0 && (
                                                    <div className="p-2 bg-green-50 rounded">
                                                        <p className="text-xs text-green-600">Desconto</p>
                                                        <p className="font-medium text-green-600">-{formatCurrency(order.discount)}</p>
                                                    </div>
                                                )}
                                                <div className="p-2 bg-pink-50 rounded">
                                                    <p className="text-xs text-pink-600">Total</p>
                                                    <p className="font-bold text-pink-600">{formatCurrency(order.total)}</p>
                                                </div>
                                            </div>

                                            {/* Delivery Address */}
                                            {address && (
                                                <div className="p-3 bg-gray-50 rounded-lg">
                                                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">Entrega</p>
                                                    <p className="text-sm text-gray-700">
                                                        {address.street}, {address.number}
                                                        {address.complement && `, ${address.complement}`}
                                                        <br />
                                                        {address.neighborhood} - {address.city}/{address.state}
                                                        <br />
                                                        CEP: {address.zip}
                                                    </p>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                )
                            })}
                        </div>
                    )}
                </TabsContent>

                {/* ENDERELOS TAB */}
                <TabsContent value="enderecos">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-pink-500" />
                                Meus Endereços
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {orders.length > 0 && orders[0].shipping_address ? (
                                <div className="p-4 border rounded-lg">
                                    <p className="font-medium mb-2">Último endereço usado:</p>
                                    {(() => {
                                        const address = typeof orders[0].shipping_address === 'string'
                                            ? JSON.parse(orders[0].shipping_address)
                                            : orders[0].shipping_address
                                        return (
                                            <div className="text-gray-600">
                                                <p>{address.street}, {address.number} {address.complement && `- ${address.complement}`}</p>
                                                <p>{address.neighborhood}</p>
                                                <p>{address.city} - {address.state}</p>
                                                <p>CEP: {address.zip}</p>
                                            </div>
                                        )
                                    })()}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <MapPin className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                                    <p>Nenhum endereço salvo.</p>
                                    <p className="text-sm">Seu endereço será salvo quando você fizer um pedido.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* PERFIL TAB */}
                <TabsContent value="perfil">
                    <div className="space-y-6">
                        {/* Personal Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5 text-pink-500" />
                                    Dados Pessoais
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        <User className="h-5 w-5 text-gray-400" />
                                        <div>
                                            <p className="text-xs text-gray-500">Nome</p>
                                            <p className="font-medium">{profile?.name || "Não informado"}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        <Mail className="h-5 w-5 text-gray-400" />
                                        <div>
                                            <p className="text-xs text-gray-500">Email</p>
                                            <p className="font-medium">{profile?.email || user.email}</p>
                                        </div>
                                    </div>
                                    {profile?.phone && (
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                            <Phone className="h-5 w-5 text-gray-400" />
                                            <div>
                                                <p className="text-xs text-gray-500">Telefone</p>
                                                <p className="font-medium">{profile.phone}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Change Password */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Lock className="h-5 w-5 text-pink-500" />
                                    Alterar Senha
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 max-w-md">
                                    <div>
                                        <Label htmlFor="new-password">Nova Senha</Label>
                                        <Input
                                            id="new-password"
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="Mínimo 6 caracteres"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                                        <Input
                                            id="confirm-password"
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Digite novamente"
                                        />
                                    </div>
                                    <Button
                                        onClick={handleChangePassword}
                                        disabled={changingPassword || !newPassword || !confirmPassword}
                                        className="bg-pink-500 hover:bg-pink-600 w-fit"
                                    >
                                        {changingPassword ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Alterando...
                                            </>
                                        ) : (
                                            "Alterar Senha"
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Help */}
                        <div className="p-4 bg-pink-50 rounded-lg text-center">
                            <p className="text-sm text-gray-600 mb-2">Precisa de ajuda?</p>
                            <a
                                href="https://wa.me/5522997890934?text=Olá! Preciso de ajuda com minha conta."
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-pink-600 hover:text-pink-700 font-medium text-sm"
                            >
                                Fale conosco no WhatsApp →
                            </a>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}

export default function MinhaContaPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center pt-20">
                <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
            </div>
        }>
            <MinhaContaContent />
        </Suspense>
    )
}
