import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

// API para consultar pedido por ID ou Email
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const orderId = searchParams.get("id")
    const email = searchParams.get("email")

    try {
        if (orderId) {
            // Buscar pedido específico por ID
            const { data: order, error } = await supabase
                .from("orders")
                .select(`
                    *,
                    items:order_items(*)
                `)
                .eq("id", orderId)
                .single()

            if (error || !order) {
                return NextResponse.json(
                    { error: "Pedido não encontrado" },
                    { status: 404 }
                )
            }

            // Retornar dados seguros (sem informações sensíveis)
            return NextResponse.json({
                id: order.id,
                status: order.status,
                payment_status: order.payment_status,
                tracking_code: order.tracking_code,
                tracking_url: order.tracking_url,
                total_amount: order.total_amount,
                shipping_cost: order.shipping_cost,
                created_at: order.created_at,
                updated_at: order.updated_at,
                items: order.items?.map((item: { product_name: string; quantity: number; price: number }) => ({
                    name: item.product_name,
                    quantity: item.quantity,
                    price: item.price
                })),
                address: {
                    city: order.address_city,
                    state: order.address_state
                }
            })

        } else if (email) {
            // Buscar todos os pedidos de um email
            const { data: orders, error } = await supabase
                .from("orders")
                .select(`
                    id,
                    status,
                    payment_status,
                    tracking_code,
                    total_amount,
                    created_at
                `)
                .eq("customer_email", email.toLowerCase())
                .order("created_at", { ascending: false })

            if (error) {
                return NextResponse.json(
                    { error: "Erro ao buscar pedidos" },
                    { status: 500 }
                )
            }

            return NextResponse.json({ orders: orders || [] })

        } else {
            return NextResponse.json(
                { error: "Informe o ID do pedido ou email" },
                { status: 400 }
            )
        }

    } catch (error) {
        console.error("Error fetching order:", error)
        return NextResponse.json(
            { error: "Erro interno do servidor" },
            { status: 500 }
        )
    }
}
