"use client"

import { useState, useEffect } from "react"
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
import { Switch } from "@/components/ui/switch"
import {
    Ticket,
    Plus,
    Edit,
    Trash2,
    Loader2,
    ArrowLeft,
    Percent,
    Truck,
    Calendar,
    Hash
} from "lucide-react"
import Link from "next/link"
import { formatCurrency } from "@/lib/utils"
import AuthGuard from "@/components/auth/auth-guard"
import { useToast } from "@/hooks/use-toast"

interface Coupon {
    id: number
    code: string
    description: string | null
    discount_type: 'percentage' | 'fixed'
    discount_value: number
    min_order_value: number
    max_uses: number | null
    uses_count: number
    valid_from: string
    valid_until: string | null
    is_active: boolean
    free_shipping: boolean
    shipping_discount_percent: number
    created_at: string
}

function CouponsPageContent() {
    const { toast } = useToast()
    const [coupons, setCoupons] = useState<Coupon[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)

    // Form state
    const [formData, setFormData] = useState({
        code: "",
        description: "",
        discount_type: "percentage" as 'percentage' | 'fixed',
        discount_value: 0,
        min_order_value: 0,
        max_uses: "",
        valid_from: "",
        valid_until: "",
        free_shipping: false,
        shipping_discount_percent: 0,
        is_active: true
    })

    const loadCoupons = async () => {
        setLoading(true)
        try {
            const response = await fetch('/api/coupons')
            const data = await response.json()
            setCoupons(data.coupons || [])
        } catch (error) {
            console.error("Error loading coupons:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadCoupons()
    }, [])

    const resetForm = () => {
        setFormData({
            code: "",
            description: "",
            discount_type: "percentage",
            discount_value: 0,
            min_order_value: 0,
            max_uses: "",
            valid_from: "",
            valid_until: "",
            free_shipping: false,
            shipping_discount_percent: 0,
            is_active: true
        })
        setEditingCoupon(null)
    }

    const openNewCouponDialog = () => {
        resetForm()
        setDialogOpen(true)
    }

    const openEditDialog = (coupon: Coupon) => {
        setEditingCoupon(coupon)
        setFormData({
            code: coupon.code,
            description: coupon.description || "",
            discount_type: coupon.discount_type,
            discount_value: coupon.discount_value,
            min_order_value: coupon.min_order_value,
            max_uses: coupon.max_uses?.toString() || "",
            valid_from: coupon.valid_from ? coupon.valid_from.split('T')[0] : "",
            valid_until: coupon.valid_until ? coupon.valid_until.split('T')[0] : "",
            free_shipping: coupon.free_shipping,
            shipping_discount_percent: coupon.shipping_discount_percent,
            is_active: coupon.is_active
        })
        setDialogOpen(true)
    }

    const handleSubmit = async () => {
        if (!formData.code) {
            toast({ title: "Erro", description: "Código é obrigatório", variant: "destructive" })
            return
        }

        setSaving(true)
        try {
            const payload = {
                ...formData,
                max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
                valid_from: formData.valid_from || new Date().toISOString(),
                valid_until: formData.valid_until || null,
                ...(editingCoupon && { id: editingCoupon.id })
            }

            const response = await fetch('/api/coupons', {
                method: editingCoupon ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error)
            }

            toast({
                title: editingCoupon ? "Cupom atualizado" : "Cupom criado",
                description: `Cupom ${formData.code} salvo com sucesso.`
            })

            setDialogOpen(false)
            loadCoupons()
        } catch (error: any) {
            toast({
                title: "Erro",
                description: error.message || "Erro ao salvar cupom",
                variant: "destructive"
            })
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (coupon: Coupon) => {
        if (!confirm(`Excluir cupom "${coupon.code}"?`)) return

        try {
            const response = await fetch(`/api/coupons?id=${coupon.id}`, {
                method: 'DELETE'
            })

            if (!response.ok) {
                throw new Error("Erro ao excluir")
            }

            toast({ title: "Cupom excluído", description: `${coupon.code} foi removido.` })
            loadCoupons()
        } catch (error: any) {
            toast({
                title: "Erro",
                description: error.message,
                variant: "destructive"
            })
        }
    }

    const formatDate = (dateString: string | null) => {
        if (!dateString) return "—"
        return new Date(dateString).toLocaleDateString("pt-BR")
    }

    const getStatusBadge = (coupon: Coupon) => {
        const now = new Date()
        const validUntil = coupon.valid_until ? new Date(coupon.valid_until) : null

        if (!coupon.is_active) {
            return <Badge variant="secondary">Inativo</Badge>
        }
        if (validUntil && now > validUntil) {
            return <Badge variant="destructive">Expirado</Badge>
        }
        if (coupon.max_uses && coupon.uses_count >= coupon.max_uses) {
            return <Badge variant="destructive">Esgotado</Badge>
        }
        return <Badge className="bg-green-100 text-green-800">Ativo</Badge>
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-24">
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
                                <Ticket className="h-6 w-6 text-pink-500" />
                                Cupons de Desconto
                            </h1>
                            <p className="text-gray-600 mt-1">
                                {coupons.length} cupom(ns) cadastrado(s)
                            </p>
                        </div>
                        <Button onClick={openNewCouponDialog}>
                            <Plus className="h-4 w-4 mr-2" />
                            Novo Cupom
                        </Button>
                    </div>
                </div>

                {/* Table */}
                <Card>
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
                            </div>
                        ) : coupons.length === 0 ? (
                            <div className="text-center py-12">
                                <Ticket className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500">Nenhum cupom cadastrado</p>
                                <Button onClick={openNewCouponDialog} className="mt-4">
                                    Criar Primeiro Cupom
                                </Button>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Código</TableHead>
                                        <TableHead>Desconto</TableHead>
                                        <TableHead>Frete</TableHead>
                                        <TableHead>Usos</TableHead>
                                        <TableHead>Validade</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {coupons.map((coupon) => (
                                        <TableRow key={coupon.id}>
                                            <TableCell>
                                                <div>
                                                    <p className="font-mono font-bold text-pink-600">
                                                        {coupon.code}
                                                    </p>
                                                    {coupon.description && (
                                                        <p className="text-xs text-gray-500">
                                                            {coupon.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {coupon.discount_type === 'percentage' ? (
                                                    <span className="flex items-center gap-1">
                                                        <Percent className="h-3 w-3" />
                                                        {coupon.discount_value}%
                                                    </span>
                                                ) : (
                                                    formatCurrency(coupon.discount_value)
                                                )}
                                                {coupon.min_order_value > 0 && (
                                                    <p className="text-xs text-gray-500">
                                                        Mín: {formatCurrency(coupon.min_order_value)}
                                                    </p>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {coupon.free_shipping ? (
                                                    <Badge className="bg-blue-100 text-blue-800">
                                                        <Truck className="h-3 w-3 mr-1" />
                                                        Grátis
                                                    </Badge>
                                                ) : coupon.shipping_discount_percent > 0 ? (
                                                    <span className="text-sm">
                                                        -{coupon.shipping_discount_percent}%
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400">—</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <span className="flex items-center gap-1">
                                                    <Hash className="h-3 w-3" />
                                                    {coupon.uses_count}
                                                    {coupon.max_uses && ` / ${coupon.max_uses}`}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">
                                                    {coupon.valid_until ? (
                                                        <>
                                                            <span className="flex items-center gap-1">
                                                                <Calendar className="h-3 w-3" />
                                                                Até {formatDate(coupon.valid_until)}
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <span className="text-gray-400">Sem prazo</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {getStatusBadge(coupon)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => openEditDialog(coupon)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(coupon)}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>

                {/* Dialog */}
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>
                                {editingCoupon ? "Editar Cupom" : "Novo Cupom"}
                            </DialogTitle>
                            <DialogDescription>
                                Configure os detalhes do cupom de desconto.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                            {/* Código */}
                            <div className="space-y-2">
                                <Label>Código do Cupom *</Label>
                                <Input
                                    placeholder="Ex: PRIMEIRACOMPRA"
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                    className="font-mono uppercase"
                                />
                            </div>

                            {/* Descrição */}
                            <div className="space-y-2">
                                <Label>Descrição (opcional)</Label>
                                <Input
                                    placeholder="Ex: 10% na primeira compra"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            {/* Tipo e Valor */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Tipo de Desconto</Label>
                                    <Select
                                        value={formData.discount_type}
                                        onValueChange={(v: 'percentage' | 'fixed') =>
                                            setFormData({ ...formData, discount_type: v })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="percentage">Porcentagem (%)</SelectItem>
                                            <SelectItem value="fixed">Valor Fixo (R$)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Valor do Desconto</Label>
                                    <Input
                                        type="number"
                                        placeholder={formData.discount_type === 'percentage' ? "10" : "50.00"}
                                        value={formData.discount_value || ""}
                                        onChange={(e) => setFormData({ ...formData, discount_value: parseFloat(e.target.value) || 0 })}
                                    />
                                </div>
                            </div>

                            {/* Frete Grátis */}
                            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <Truck className="h-5 w-5 text-blue-600" />
                                    <div>
                                        <Label>Frete Grátis</Label>
                                        <p className="text-xs text-gray-500">Zera o valor do frete</p>
                                    </div>
                                </div>
                                <Switch
                                    checked={formData.free_shipping}
                                    onCheckedChange={(checked) =>
                                        setFormData({ ...formData, free_shipping: checked, shipping_discount_percent: checked ? 0 : formData.shipping_discount_percent })
                                    }
                                />
                            </div>

                            {/* Desconto no Frete (se não for grátis) */}
                            {!formData.free_shipping && (
                                <div className="space-y-2">
                                    <Label>Desconto no Frete (%)</Label>
                                    <Input
                                        type="number"
                                        placeholder="0"
                                        min="0"
                                        max="100"
                                        value={formData.shipping_discount_percent || ""}
                                        onChange={(e) => setFormData({ ...formData, shipping_discount_percent: parseInt(e.target.value) || 0 })}
                                    />
                                    <p className="text-xs text-gray-500">0 = sem desconto no frete</p>
                                </div>
                            )}

                            {/* Valor Mínimo */}
                            <div className="space-y-2">
                                <Label>Valor Mínimo do Pedido (R$)</Label>
                                <Input
                                    type="number"
                                    placeholder="0.00"
                                    value={formData.min_order_value || ""}
                                    onChange={(e) => setFormData({ ...formData, min_order_value: parseFloat(e.target.value) || 0 })}
                                />
                            </div>

                            {/* Limite de Usos */}
                            <div className="space-y-2">
                                <Label>Limite de Usos (deixe vazio = ilimitado)</Label>
                                <Input
                                    type="number"
                                    placeholder="Ilimitado"
                                    value={formData.max_uses}
                                    onChange={(e) => setFormData({ ...formData, max_uses: e.target.value })}
                                />
                            </div>

                            {/* Validade */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Válido a partir de</Label>
                                    <Input
                                        type="date"
                                        value={formData.valid_from}
                                        onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Válido até (opcional)</Label>
                                    <Input
                                        type="date"
                                        value={formData.valid_until}
                                        onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Ativo */}
                            <div className="flex items-center justify-between">
                                <Label>Cupom Ativo</Label>
                                <Switch
                                    checked={formData.is_active}
                                    onCheckedChange={(checked) =>
                                        setFormData({ ...formData, is_active: checked })
                                    }
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setDialogOpen(false)}>
                                Cancelar
                            </Button>
                            <Button onClick={handleSubmit} disabled={saving}>
                                {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                                {editingCoupon ? "Salvar" : "Criar Cupom"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}

export default function CouponsPage() {
    return (
        <AuthGuard>
            <CouponsPageContent />
        </AuthGuard>
    )
}
