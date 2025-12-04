import { NextRequest, NextResponse } from "next/server"
import { MercadoPagoConfig, Payment } from "mercadopago"
import { supabase } from "@/lib/supabase"

// Webhook do Mercado Pago para atualizar status dos pagamentos
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        console.log("Webhook received:", JSON.stringify(body, null, 2))

        // Verificar se é uma notificação de pagamento
        if (body.type !== "payment") {
            return NextResponse.json({ message: "Ignored - not a payment notification" })
        }

        const paymentId = body.data?.id
        if (!paymentId) {
            return NextResponse.json({ error: "Payment ID not found" }, { status: 400 })
        }

        // Buscar detalhes do pagamento no Mercado Pago
        const accessToken = process.env.MP_ACCESS_TOKEN
        if (!accessToken) {
            console.error("MP_ACCESS_TOKEN not configured")
            return NextResponse.json({ error: "Configuration error" }, { status: 500 })
        }

        const client = new MercadoPagoConfig({ accessToken })
        const payment = new Payment(client)

        const paymentData = await payment.get({ id: paymentId })

        console.log("Payment data:", JSON.stringify(paymentData, null, 2))

        const orderId = paymentData.external_reference
        const paymentStatus = paymentData.status

        if (!orderId) {
            console.error("No order ID in external_reference")
            return NextResponse.json({ error: "Order ID not found" }, { status: 400 })
        }

        // Mapear status do Mercado Pago para nosso sistema
        let orderStatus: string
        switch (paymentStatus) {
            case "approved":
                orderStatus = "paid"
                break
            case "pending":
            case "in_process":
                orderStatus = "pending_payment"
                break
            case "rejected":
            case "cancelled":
                orderStatus = "cancelled"
                break
            case "refunded":
                orderStatus = "refunded"
                break
            default:
                orderStatus = "pending"
        }

        // Atualizar pedido no banco
        const { error } = await supabase
            .from("orders")
            .update({
                status: orderStatus,
                payment_id: String(paymentId),
                payment_status: paymentStatus,
                updated_at: new Date().toISOString()
            })
            .eq("id", orderId)

        if (error) {
            console.error("Error updating order:", error)
            return NextResponse.json({ error: "Failed to update order" }, { status: 500 })
        }

        console.log(`Order ${orderId} updated to status: ${orderStatus}`)

        return NextResponse.json({ success: true, orderId, status: orderStatus })

    } catch (error) {
        console.error("Webhook error:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}

// Mercado Pago também pode fazer GET para verificar se a URL existe
export async function GET() {
    return NextResponse.json({ status: "Webhook endpoint active" })
}
