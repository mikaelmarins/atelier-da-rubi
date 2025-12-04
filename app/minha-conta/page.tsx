"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/context/auth-context"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency } from "@/lib/utils"
import { supabase } from "@/lib/supabase"
import {
    User, Package, MapPin, LogOut, Loader2, Plus, Trash2,
    Star, Clock, CheckCircle, Truck, AlertCircle, Edit2, Save
} from "lucide-react"

interface Order {
    id: string
    status: string
    payment_status: string
    total: number
    shipping_cost: number
    tracking_code: string | null
    tracking_url: string | null
    created_at: string
    items: any[]
}

export default function AccountPage() {
    const router = useRouter()
    const { user, profile, addresses, loading, signOut, updateProfile, addAddress, removeAddress, setDefaultAddress } = useAuth()
    const { toast } = useToast()

    const [orders, setOrders] = useState<Order[]>([])
    const [loadingOrders, setLoadingOrders] = useState(true)
    const [editingProfile, setEditingProfile] = useState(false)
    const [savingProfile, setSavingProfile] = useState(false)
    const [profileForm, setProfileForm] = useState({ name: "", phone: "" })

    // Address form
    const [showAddressForm, setShowAddressForm] = useState(false)
    const [addressForm, setAddressForm] = useState({
        label: "Casa",
        zip: "",
        street: "",
        number: "",
        complement: "",
        neighborhood: "",
        city: "",
        state: "",
        is_default: false
    })
    const [savingAddress, setSavingAddress] = useState(false)

    useEffect(() => {
        if (!loading && !user) {
            router.push("/auth/login?redirect=/minha-conta")
        }
    }, [user, loading, router])

    useEffect(() => {
        if (profile) {
            setProfileForm({ name: profile.name || "", phone: profile.phone || "" })
        }
    }, [profile])

    useEffect(() => {
        if (user) {
            loadOrders()
        }
    }, [user])

    const loadOrders = async () => {
        if (!user) return
        setLoadingOrders(true)

        const { data } = await supabase
            .from("orders")
            .select("*, items:order_items(*)")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })

        if (data) setOrders(data)
        setLoadingOrders(false)
    }

    const handleSaveProfile = async () => {
        setSavingProfile(true)
        const { error } = await updateProfile(profileForm)

        if (error) {
            toast({ title: "Erro ao salvar", variant: "destructive" })
        } else {
            toast({ title: "Perfil atualizado!" })
            setEditingProfile(false)
        }
        setSavingProfile(false)
    }

    const handleCepBlur = async () => {
        if (addressForm.zip.length === 8) {
            try {
                const res = await fetch(`https://viacep.com.br/ws/${addressForm.zip}/json/`)
                const data = await res.json()
                if (!data.erro) {
                    setAddressForm(prev => ({
                        ...prev,
                        street: data.logradouro || prev.street,
                        neighborhood: data.bairro || prev.neighborhood,
                        city: data.localidade || prev.city,
                        state: data.uf || prev.state
                    }))
                }
            } catch (e) {
                console.error("CEP lookup error", e)
            }
        }
    }

    const handleSaveAddress = async () => {
        if (!addressForm.zip || !addressForm.street || !addressForm.number || !addressForm.city) {
            toast({ title: "Preencha todos os campos obrigatórios", variant: "destructive" })
            return
        }

        setSavingAddress(true)
        const { error } = await addAddress(addressForm)

        if (error) {
            toast({ title: "Erro ao salvar endereço", variant: "destructive" })
        } else {
            toast({ title: "Endereço salvo!" })
            setShowAddressForm(false)
            setAddressForm({
                label: "Casa",
                zip: "",
                street: "",
                number: "",
                complement: "",
                neighborhood: "",
                city: "",
                state: "",
                is_default: false
            })
        }
        setSavingAddress(false)
    }

    const handleLogout = async () => {
        await signOut()
        router.push("/")
        toast({ title: "Até logo! 👋" })
    }

    const getStatusBadge = (status: string) => {
        const statusMap: Record<string, { label: string, variant: "default" | "secondary" | "destructive" | "outline", icon: any }> = {
            pending: { label: "Pendente", variant: "secondary", icon: Clock },
            paid: { label: "Pago", variant: "default", icon: CheckCircle },
            processing: { label: "Preparando", variant: "default", icon: Package },
            shipped: { label: "Enviado", variant: "default", icon: Truck },
            delivered: { label: "Entregue", variant: "default", icon: CheckCircle },
            cancelled: { label: "Cancelado", variant: "destructive", icon: AlertCircle }
        }
        const s = statusMap[status] || statusMap.pending
        const Icon = s.icon
        return (
            <Badge variant={s.variant} className="flex items-center gap-1">
                <Icon className="h-3 w-3" /> {s.label}
            </Badge>
        )
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-24">
                <Loader2 className="h-8 w-8 text-pink-500 animate-spin" />
            </div>
        )
    }

    if (!user) return null

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 pt-24 pb-12">
            <div className="container mx-auto px-4 max-w-4xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">Minha Conta</h1>
                            <p className="text-gray-600">Olá, {profile?.name || "Cliente"}! 👋</p>
                        </div>
                        <Button variant="outline" onClick={handleLogout} className="gap-2">
                            <LogOut className="h-4 w-4" /> Sair
                        </Button>
                    </div>

                    <Tabs defaultValue="orders" className="space-y-6">
                        <TabsList className="grid w-full grid-cols-3 bg-white/50">
                            <TabsTrigger value="orders" className="gap-2">
                                <Package className="h-4 w-4" /> Pedidos
                            </TabsTrigger>
                            <TabsTrigger value="addresses" className="gap-2">
                                <MapPin className="h-4 w-4" /> Endereços
                            </TabsTrigger>
                            <TabsTrigger value="profile" className="gap-2">
                                <User className="h-4 w-4" /> Perfil
                            </TabsTrigger>
                        </TabsList>

                        {/* Orders Tab */}
                        <TabsContent value="orders" className="space-y-4">
                            {loadingOrders ? (
                                <div className="flex justify-center py-12">
                                    <Loader2 className="h-8 w-8 text-pink-500 animate-spin" />
                                </div>
                            ) : orders.length === 0 ? (
                                <Card>
                                    <CardContent className="py-12 text-center">
                                        <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-600 mb-2">
                                            Nenhum pedido ainda
                                        </h3>
                                        <p className="text-gray-500 mb-4">
                                            Que tal fazer sua primeira compra?
                                        </p>
                                        <Button asChild className="bg-pink-500 hover:bg-pink-600">
                                            <Link href="/catalogo">Ver Catálogo</Link>
                                        </Button>
                                    </CardContent>
                                </Card>
                            ) : (
                                orders.map((order) => (
                                    <Card key={order.id}>
                                        <CardHeader className="pb-2">
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                                <div>
                                                    <CardTitle className="text-sm font-mono text-gray-500">
                                                        #{order.id.slice(0, 8)}
                                                    </CardTitle>
                                                    <CardDescription>
                                                        {new Date(order.created_at).toLocaleDateString("pt-BR", {
                                                            day: "2-digit",
                                                            month: "long",
                                                            year: "numeric"
                                                        })}
                                                    </CardDescription>
                                                </div>
                                                {getStatusBadge(order.status)}
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm text-gray-600">
                                                        {order.items?.length || 0} itens
                                                    </p>
                                                    <p className="text-lg font-bold text-gray-900">
                                                        {formatCurrency(order.total + (order.shipping_cost || 0))}
                                                    </p>
                                                </div>
                                                {order.tracking_code && (
                                                    <div className="text-right">
                                                        <p className="text-xs text-gray-500">Rastreio</p>
                                                        {order.tracking_url ? (
                                                            <a
                                                                href={order.tracking_url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-pink-600 hover:underline font-mono text-sm"
                                                            >
                                                                {order.tracking_code}
                                                            </a>
                                                        ) : (
                                                            <span className="font-mono text-sm">{order.tracking_code}</span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </TabsContent>

                        {/* Addresses Tab */}
                        <TabsContent value="addresses" className="space-y-4">
                            {addresses.length === 0 && !showAddressForm ? (
                                <Card>
                                    <CardContent className="py-12 text-center">
                                        <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-600 mb-2">
                                            Nenhum endereço salvo
                                        </h3>
                                        <p className="text-gray-500 mb-4">
                                            Adicione um endereço para agilizar suas compras
                                        </p>
                                        <Button onClick={() => setShowAddressForm(true)} className="bg-pink-500 hover:bg-pink-600">
                                            <Plus className="h-4 w-4 mr-2" /> Adicionar Endereço
                                        </Button>
                                    </CardContent>
                                </Card>
                            ) : (
                                <>
                                    {addresses.map((addr) => (
                                        <Card key={addr.id}>
                                            <CardContent className="p-4">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="font-medium">{addr.label}</span>
                                                            {addr.is_default && (
                                                                <Badge variant="secondary" className="text-xs">
                                                                    <Star className="h-3 w-3 mr-1" /> Padrão
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-gray-600">
                                                            {addr.street}, {addr.number}
                                                            {addr.complement && `, ${addr.complement}`}
                                                        </p>
                                                        <p className="text-sm text-gray-600">
                                                            {addr.neighborhood} - {addr.city}/{addr.state}
                                                        </p>
                                                        <p className="text-sm text-gray-500">CEP: {addr.zip}</p>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        {!addr.is_default && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => setDefaultAddress(addr.id)}
                                                            >
                                                                <Star className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-red-500 hover:text-red-600"
                                                            onClick={() => removeAddress(addr.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}

                                    {showAddressForm ? (
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Novo Endereço</CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <Label>Apelido</Label>
                                                        <Input
                                                            value={addressForm.label}
                                                            onChange={(e) => setAddressForm(prev => ({ ...prev, label: e.target.value }))}
                                                            placeholder="Casa, Trabalho..."
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label>CEP</Label>
                                                        <Input
                                                            value={addressForm.zip}
                                                            onChange={(e) => setAddressForm(prev => ({ ...prev, zip: e.target.value.replace(/\D/g, "").slice(0, 8) }))}
                                                            onBlur={handleCepBlur}
                                                            placeholder="00000000"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-3 gap-4">
                                                    <div className="col-span-2">
                                                        <Label>Rua</Label>
                                                        <Input
                                                            value={addressForm.street}
                                                            onChange={(e) => setAddressForm(prev => ({ ...prev, street: e.target.value }))}
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label>Número</Label>
                                                        <Input
                                                            value={addressForm.number}
                                                            onChange={(e) => setAddressForm(prev => ({ ...prev, number: e.target.value }))}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <Label>Complemento</Label>
                                                        <Input
                                                            value={addressForm.complement}
                                                            onChange={(e) => setAddressForm(prev => ({ ...prev, complement: e.target.value }))}
                                                            placeholder="Apto, Bloco..."
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label>Bairro</Label>
                                                        <Input
                                                            value={addressForm.neighborhood}
                                                            onChange={(e) => setAddressForm(prev => ({ ...prev, neighborhood: e.target.value }))}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <Label>Cidade</Label>
                                                        <Input
                                                            value={addressForm.city}
                                                            onChange={(e) => setAddressForm(prev => ({ ...prev, city: e.target.value }))}
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label>Estado</Label>
                                                        <Input
                                                            value={addressForm.state}
                                                            onChange={(e) => setAddressForm(prev => ({ ...prev, state: e.target.value }))}
                                                            maxLength={2}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        id="is_default"
                                                        checked={addressForm.is_default}
                                                        onChange={(e) => setAddressForm(prev => ({ ...prev, is_default: e.target.checked }))}
                                                    />
                                                    <Label htmlFor="is_default" className="cursor-pointer">
                                                        Definir como endereço padrão
                                                    </Label>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        onClick={handleSaveAddress}
                                                        className="bg-pink-500 hover:bg-pink-600"
                                                        disabled={savingAddress}
                                                    >
                                                        {savingAddress ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                                                        Salvar
                                                    </Button>
                                                    <Button variant="outline" onClick={() => setShowAddressForm(false)}>
                                                        Cancelar
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ) : (
                                        <Button onClick={() => setShowAddressForm(true)} variant="outline" className="w-full">
                                            <Plus className="h-4 w-4 mr-2" /> Adicionar Endereço
                                        </Button>
                                    )}
                                </>
                            )}
                        </TabsContent>

                        {/* Profile Tab */}
                        <TabsContent value="profile">
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle>Dados Pessoais</CardTitle>
                                        {!editingProfile && (
                                            <Button variant="ghost" size="sm" onClick={() => setEditingProfile(true)}>
                                                <Edit2 className="h-4 w-4 mr-2" /> Editar
                                            </Button>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label>Nome</Label>
                                        {editingProfile ? (
                                            <Input
                                                value={profileForm.name}
                                                onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                                            />
                                        ) : (
                                            <p className="text-gray-800">{profile?.name || "-"}</p>
                                        )}
                                    </div>
                                    <div>
                                        <Label>E-mail</Label>
                                        <p className="text-gray-800">{profile?.email}</p>
                                        <p className="text-xs text-gray-500">O e-mail não pode ser alterado</p>
                                    </div>
                                    <div>
                                        <Label>Telefone</Label>
                                        {editingProfile ? (
                                            <Input
                                                value={profileForm.phone}
                                                onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                                                placeholder="(00) 00000-0000"
                                            />
                                        ) : (
                                            <p className="text-gray-800">{profile?.phone || "-"}</p>
                                        )}
                                    </div>

                                    {editingProfile && (
                                        <div className="flex gap-2 pt-2">
                                            <Button
                                                onClick={handleSaveProfile}
                                                className="bg-pink-500 hover:bg-pink-600"
                                                disabled={savingProfile}
                                            >
                                                {savingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                                                Salvar
                                            </Button>
                                            <Button variant="outline" onClick={() => setEditingProfile(false)}>
                                                Cancelar
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </motion.div>
            </div>
        </div>
    )
}
