import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { sendOrderStatusUpdateEmail } from "@/lib/email-service"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

// GET - Buscar pedido por ID
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const orderId = searchParams.get("id")

        if (!orderId) {
            // Retornar todos os pedidos (com paginação)
            const page = parseInt(searchParams.get("page") || "1")
            const limit = parseInt(searchParams.get("limit") || "20")
            const status = searchParams.get("status")

            let query = supabaseAdmin
                .from("orders")
                .select(`*, items:order_items(*)`, { count: "exact" })
                .order("created_at", { ascending: false })
                .range((page - 1) * limit, page * limit - 1)

            if (status && status !== "all") {
                query = query.eq("status", status)
            }

            const { data, error, count } = await query

            if (error) throw error

            return NextResponse.json({
                orders: data,
                total: count,
                page,
                totalPages: Math.ceil((count || 0) / limit)
            })
        }

        // Buscar pedido específico
        const { data, error } = await supabaseAdmin
            .from("orders")
            .select(`*, items:order_items(*)`)
            .eq("id", orderId)
            .single()

        if (error) {
            return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 })
        }

        return NextResponse.json(data)
    } catch (error: any) {
        console.error("Error fetching order:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

// PUT - Atualizar pedido
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json()
        const { id, status, tracking_code, tracking_url, payment_status, notes } = body

        if (!id) {
            return NextResponse.json({ error: "ID do pedido é obrigatório" }, { status: 400 })
        }

        // Buscar pedido atual
        const { data: currentOrder } = await supabaseAdmin
            .from("orders")
            .select("status, customer_email, customer_name")
            .eq("id", id)
            .single()

        if (!currentOrder) {
            return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 })
        }

        // Preparar dados para atualização
        const updateData: any = {
            updated_at: new Date().toISOString()
        }

        if (status !== undefined) updateData.status = status
        if (tracking_code !== undefined) updateData.tracking_code = tracking_code
        if (tracking_url !== undefined) updateData.tracking_url = tracking_url
        if (payment_status !== undefined) updateData.payment_status = payment_status
        if (notes !== undefined) updateData.notes = notes

        // Atualizar pedido
        const { data, error } = await supabaseAdmin
            .from("orders")
            .update(updateData)
            .eq("id", id)
            .select()

        if (error) throw error

        // Enviar email de notificação se o status mudou
        if (status && status !== currentOrder.status) {
            const statusesToNotify = ['paid', 'processing', 'shipped', 'delivered', 'cancelled']
            if (statusesToNotify.includes(status)) {
                try {
                    await sendOrderStatusUpdateEmail(
                        {
                            orderId: id,
                            customerName: currentOrder.customer_name,
                            customerEmail: currentOrder.customer_email,
                            trackingCode: tracking_code || data?.[0]?.tracking_code,
                            trackingUrl: tracking_url || data?.[0]?.tracking_url
                        },
                        status
                    )
                    console.log(`[Orders] Email de status enviado para ${currentOrder.customer_email}`)
                } catch (emailError) {
                    console.error('[Orders] Erro ao enviar email de status:', emailError)
                    // Não falha a operação se o email falhar
                }
            }
        }

        return NextResponse.json({
            success: true,
            order: data?.[0],
            message: "Pedido atualizado com sucesso"
        })
    } catch (error: any) {
        console.error("Error updating order:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

// POST - Criar novo pedido (usado internamente)
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const {
            customer,
            address,
            items,
            shipping_cost,
            total_amount,
            payment_method,
            payment_id
        } = body

        // Validar dados obrigatórios
        if (!customer?.name || !customer?.email || !items?.length) {
            return NextResponse.json(
                { error: "Dados incompletos. Nome, email e itens são obrigatórios." },
                { status: 400 }
            )
        }

        // Gerar ID único para o pedido
        const orderId = crypto.randomUUID()

        // Criar pedido
        const orderData = {
            id: orderId,
            user_id: customer.userId || null,
            customer_name: customer.name,
            customer_email: customer.email,
            customer_phone: customer.phone || null,
            address_zip: address?.zip || null,
            address_street: address?.street || null,
            address_number: address?.number || null,
            address_complement: address?.complement || null,
            address_neighborhood: address?.neighborhood || null,
            address_city: address?.city || null,
            address_state: address?.state || null,
            shipping_cost: shipping_cost || 0,
            total_amount: total_amount,
            status: "pending",
            payment_status: "pending",
            payment_method: payment_method || null,
            payment_id: payment_id || null
        }

        const { error: orderError } = await supabaseAdmin
            .from("orders")
            .insert(orderData)

        if (orderError) throw orderError

        // Criar itens do pedido
        const orderItems = items.map((item: any) => ({
            order_id: orderId,
            product_id: item.product_id || null,
            product_name: item.product_name || item.name,
            price: item.price,
            quantity: item.quantity,
            customization: item.customization || null
        }))

        const { error: itemsError } = await supabaseAdmin
            .from("order_items")
            .insert(orderItems)

        if (itemsError) throw itemsError

        return NextResponse.json({
            success: true,
            order_id: orderId,
            message: "Pedido criado com sucesso"
        })
    } catch (error: any) {
        console.error("Error creating order:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
