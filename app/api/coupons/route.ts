import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export interface Coupon {
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

// GET - Listar cupons ou validar um cupom específico
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const code = searchParams.get("code")
        const orderTotal = parseFloat(searchParams.get("order_total") || "0")

        if (code) {
            // Validar cupom específico
            const { data: coupon, error } = await supabaseAdmin
                .from("coupons")
                .select("*")
                .eq("code", code.toUpperCase())
                .eq("is_active", true)
                .single()

            if (error || !coupon) {
                return NextResponse.json({
                    valid: false,
                    error: "Cupom não encontrado ou inválido"
                })
            }

            // Verificar validade
            const now = new Date()
            const validFrom = new Date(coupon.valid_from)
            const validUntil = coupon.valid_until ? new Date(coupon.valid_until) : null

            if (now < validFrom) {
                return NextResponse.json({
                    valid: false,
                    error: "Este cupom ainda não está ativo"
                })
            }

            if (validUntil && now > validUntil) {
                return NextResponse.json({
                    valid: false,
                    error: "Este cupom expirou"
                })
            }

            // Verificar limite de usos
            if (coupon.max_uses && coupon.uses_count >= coupon.max_uses) {
                return NextResponse.json({
                    valid: false,
                    error: "Este cupom atingiu o limite de usos"
                })
            }

            // Verificar valor mínimo
            if (orderTotal < coupon.min_order_value) {
                return NextResponse.json({
                    valid: false,
                    error: `Pedido mínimo de R$ ${coupon.min_order_value.toFixed(2)} para este cupom`
                })
            }

            // Calcular desconto
            let discount = 0
            if (coupon.discount_type === 'percentage') {
                discount = (orderTotal * coupon.discount_value) / 100
            } else {
                discount = Math.min(coupon.discount_value, orderTotal)
            }

            return NextResponse.json({
                valid: true,
                coupon: {
                    code: coupon.code,
                    description: coupon.description,
                    discount_type: coupon.discount_type,
                    discount_value: coupon.discount_value,
                    discount_amount: discount,
                    free_shipping: coupon.free_shipping,
                    shipping_discount_percent: coupon.shipping_discount_percent
                }
            })
        }

        // Listar todos os cupons (admin)
        const { data, error } = await supabaseAdmin
            .from("coupons")
            .select("*")
            .order("created_at", { ascending: false })

        if (error) throw error

        return NextResponse.json({ coupons: data })
    } catch (error: any) {
        console.error("Error with coupons:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

// POST - Criar novo cupom
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const {
            code,
            description,
            discount_type,
            discount_value,
            min_order_value = 0,
            max_uses,
            valid_from,
            valid_until,
            free_shipping = false,
            shipping_discount_percent = 0
        } = body

        if (!code || !discount_type || discount_value === undefined) {
            return NextResponse.json(
                { error: "Código, tipo e valor do desconto são obrigatórios" },
                { status: 400 }
            )
        }

        const { data, error } = await supabaseAdmin
            .from("coupons")
            .insert({
                code: code.toUpperCase(),
                description,
                discount_type,
                discount_value,
                min_order_value,
                max_uses: max_uses || null,
                valid_from: valid_from || new Date().toISOString(),
                valid_until: valid_until || null,
                is_active: true,
                free_shipping,
                shipping_discount_percent,
                uses_count: 0
            })
            .select()
            .single()

        if (error) {
            if (error.code === '23505') {
                return NextResponse.json(
                    { error: "Já existe um cupom com este código" },
                    { status: 400 }
                )
            }
            throw error
        }

        return NextResponse.json({ success: true, coupon: data })
    } catch (error: any) {
        console.error("Error creating coupon:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

// PUT - Atualizar cupom
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json()
        const { id, ...updateData } = body

        if (!id) {
            return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 })
        }

        // Se tiver código, converter para maiúsculas
        if (updateData.code) {
            updateData.code = updateData.code.toUpperCase()
        }

        const { data, error } = await supabaseAdmin
            .from("coupons")
            .update(updateData)
            .eq("id", id)
            .select()
            .single()

        if (error) throw error

        return NextResponse.json({ success: true, coupon: data })
    } catch (error: any) {
        console.error("Error updating coupon:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

// DELETE - Excluir cupom
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get("id")

        if (!id) {
            return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 })
        }

        const { error } = await supabaseAdmin
            .from("coupons")
            .delete()
            .eq("id", id)

        if (error) throw error

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error("Error deleting coupon:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

// Função para incrementar uso do cupom (chamada após compra)
export async function incrementCouponUsage(couponCode: string) {
    const { error } = await supabaseAdmin.rpc('increment_coupon_usage', {
        coupon_code: couponCode
    })
    return !error
}
