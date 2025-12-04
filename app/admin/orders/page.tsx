"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
    Package,
    Truck,
    Search,
    Eye,
    Edit,
    Loader2,
    CheckCircle2,
    Clock,
    XCircle,
    CreditCard,
    ArrowLeft,
    RefreshCw
} from "lucide-react"
import Link from "next/link"
import { formatCurrency } from "@/lib/utils"

interface Order {
    id: string
    created_at: string
    updated_at: string | null
    status: string
    payment_status: string | null
    total_amount: number
    shipping_cost: number
    customer_name: string
    customer_email: string
    customer_phone: string
    address_city: string
    address_state: string
    tracking_code: string | null
    tracking_url: string | null
    items?: Array<{
        product_name: string
        quantity: number
        price: number
    }>
}

const statusOptions = [
    { value: "pending", label: "Aguardando Pagamento", color: "bg-yellow-100 text-yellow-800" },
    { value: "paid", label: "Pago", color: "bg-green-100 text-green-800" },
    { value: "processing", label: "Preparando", color: "bg-blue-100 text-blue-800" },
    { value: "shipped", label: "Enviado", color: "bg-purple-100 text-purple-800" },
    { value: "delivered", label: "Entregue", color: "bg-green-100 text-green-800" },
    { value: "cancelled", label: "Cancelado", color: "bg-red-100 text-red-800" },
]

export default function OrdersAdminPage() {
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState<string>("all")
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [saving, setSaving] = useState(false)

    // Form state for editing
    const [editStatus, setEditStatus] = useState("")
    const [editTrackingCode, setEditTrackingCode] = useState("")
    const [editTrackingUrl, setEditTrackingUrl] = useState("")

    const loadOrders = async () => {
        setLoading(true)
        try {
            let query = supabase
                .from("orders")
                .select(`
                    *,
                    items:order_items(product_name, quantity, price)
                `)
                .order("created_at", { ascending: false })

            if (statusFilter !== "all") {
                query = query.eq("status", statusFilter)
            }

            const { data, error } = await query

            if (error) throw error
            setOrders(data || [])
        } catch (error) {
            console.error("Error loading orders:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadOrders()
    }, [statusFilter])

    const handleEditOrder = (order: Order) => {
        setSelectedOrder(order)
        setEditStatus(order.status)
        setEditTrackingCode(order.tracking_code || "")
        setEditTrackingUrl(order.tracking_url || "")
        setEditDialogOpen(true)
    }

    const handleSaveOrder = async () => {
        if (!selectedOrder) return

        setSaving(true)
        try {
            const { error } = await supabase
                .from("orders")
                .update({
                    status: editStatus,
                    tracking_code: editTrackingCode || null,
                    tracking_url: editTrackingUrl || null,
                    updated_at: new Date().toISOString()
                })
                .eq("id", selectedOrder.id)

            if (error) throw error

            // Atualizar lista local
            setOrders(prev => prev.map(o =>
                o.id === selectedOrder.id
                    ? { ...o, status: editStatus, tracking_code: editTrackingCode, tracking_url: editTrackingUrl }
                    : o
            ))
            setEditDialogOpen(false)
        } catch (error) {
            console.error("Error updating order:", error)
            alert("Erro ao atualizar pedido")
        } finally {
            setSaving(false)
        }
    }

    const getStatusBadge = (status: string) => {
        const statusConfig = statusOptions.find(s => s.value === status) || statusOptions[0]
        return (
            <Badge className={statusConfig.color}>
                {statusConfig.label}
            </Badge>
        )
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

    const filteredOrders = orders.filter(order => {
        if (!searchTerm) return true
        const search = searchTerm.toLowerCase()
        return (
            order.id.toLowerCase().includes(search) ||
            order.customer_name.toLowerCase().includes(search) ||
            order.customer_email.toLowerCase().includes(search)
        )
    })

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href="/admin"
                        className="text-sm text-gray-500 hover:text-gray-900 flex items-center mb-4"
                    >
                        <ArrowLeft className="h-4 w-4 mr-1" /> Voltar ao Admin
                    </Link>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <Package className="h-6 w-6 text-pink-500" />
                                Gerenciar Pedidos
                            </h1>
                            <p className="text-gray-600 mt-1">
                                {orders.length} pedido(s) encontrado(s)
                            </p>
                        </div>
                        <Button onClick={loadOrders} variant="outline" size="sm">
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Atualizar
                        </Button>
                    </div>
                </div>

                {/* Filters */}
                <Card className="mb-6">
                    <CardContent className="py-4">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Buscar por ID, nome ou email..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <div className="w-48">
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Filtrar por status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos os status</SelectItem>
                                        {statusOptions.map(s => (
                                            <SelectItem key={s.value} value={s.value}>
                                                {s.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Orders Table */}
                <Card>
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
                            </div>
                        ) : filteredOrders.length === 0 ? (
                            <div className="text-center py-12">
                                <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500">Nenhum pedido encontrado</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Pedido</TableHead>
                                        <TableHead>Cliente</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Rastreio</TableHead>
                                        <TableHead className="text-right">Total</TableHead>
                                        <TableHead className="text-right">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredOrders.map((order) => (
                                        <TableRow key={order.id}>
                                            <TableCell>
                                                <div>
                                                    <p className="font-mono text-sm">
                                                        #{order.id.slice(0, 8)}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {formatDate(order.created_at)}
                                                    </p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium">{order.customer_name}</p>
                                                    <p className="text-sm text-gray-500">{order.customer_email}</p>
                                                    <p className="text-xs text-gray-400">
                                                        {order.address_city}, {order.address_state}
                                                    </p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {getStatusBadge(order.status)}
                                            </TableCell>
                                            <TableCell>
                                                {order.tracking_code ? (
                                                    <div>
                                                        <p className="font-mono text-sm text-purple-600">
                                                            {order.tracking_code}
                                                        </p>
                                                        {order.tracking_url && (
                                                            <a
                                                                href={order.tracking_url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-xs text-blue-500 hover:underline"
                                                            >
                                                                Ver rastreio
                                                            </a>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 text-sm">—</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right font-semibold">
                                                {formatCurrency(order.total_amount)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEditOrder(order)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>

                {/* Edit Dialog */}
                <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Editar Pedido</DialogTitle>
                            <DialogDescription>
                                Atualize o status e informações de rastreio do pedido.
                            </DialogDescription>
                        </DialogHeader>

                        {selectedOrder && (
                            <div className="space-y-4">
                                {/* Order Info */}
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <p className="font-mono text-sm mb-1">#{selectedOrder.id.slice(0, 8)}...</p>
                                    <p className="text-sm text-gray-600">{selectedOrder.customer_name}</p>
                                    <p className="text-lg font-semibold">{formatCurrency(selectedOrder.total_amount)}</p>
                                </div>

                                {/* Status */}
                                <div className="space-y-2">
                                    <Label>Status do Pedido</Label>
                                    <Select value={editStatus} onValueChange={setEditStatus}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {statusOptions.map(s => (
                                                <SelectItem key={s.value} value={s.value}>
                                                    {s.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Tracking Code */}
                                <div className="space-y-2">
                                    <Label>Código de Rastreamento</Label>
                                    <Input
                                        placeholder="Ex: AA123456789BR"
                                        value={editTrackingCode}
                                        onChange={(e) => setEditTrackingCode(e.target.value.toUpperCase())}
                                    />
                                </div>

                                {/* Tracking URL */}
                                <div className="space-y-2">
                                    <Label>URL de Rastreamento (opcional)</Label>
                                    <Input
                                        placeholder="https://rastreamento.correios.com.br/..."
                                        value={editTrackingUrl}
                                        onChange={(e) => setEditTrackingUrl(e.target.value)}
                                    />
                                    <p className="text-xs text-gray-500">
                                        Link direto para rastrear no site da transportadora
                                    </p>
                                </div>
                            </div>
                        )}

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                                Cancelar
                            </Button>
                            <Button onClick={handleSaveOrder} disabled={saving}>
                                {saving ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                ) : null}
                                Salvar Alterações
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}
