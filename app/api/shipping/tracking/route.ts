import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

// Helper para obter token do Melhor Envio
async function getMelhorEnvioToken(): Promise<string | null> {
    const { data } = await supabaseAdmin
        .from("settings")
        .select("value")
        .eq("key", "melhor_envio_access_token")
        .single()

    return data?.value || null
}

// Helper para obter a URL base do Melhor Envio
function getMelhorEnvioBaseUrl(): string {
    const isSandbox = process.env.MELHOR_ENVIO_IS_SANDBOX === "true"
    return isSandbox
        ? "https://sandbox.melhorenvio.com.br/api/v2"
        : "https://melhorenvio.com.br/api/v2"
}

// GET - Verificar status de rastreamento
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const orderId = searchParams.get("order_id")
        const trackingCode = searchParams.get("tracking_code")

        if (!orderId && !trackingCode) {
            return NextResponse.json(
                { error: "order_id ou tracking_code é obrigatório" },
                { status: 400 }
            )
        }

        // Se tiver order_id, busca o tracking_code do pedido
        let trackingToCheck = trackingCode
        let melhorEnvioOrderId: string | null = null

        if (orderId) {
            const { data: order } = await supabaseAdmin
                .from("orders")
                .select("tracking_code, melhor_envio_order_id")
                .eq("id", orderId)
                .single()

            if (order?.tracking_code) {
                trackingToCheck = order.tracking_code
            }
            if (order?.melhor_envio_order_id) {
                melhorEnvioOrderId = order.melhor_envio_order_id
            }
        }

        if (!trackingToCheck && !melhorEnvioOrderId) {
            return NextResponse.json({
                error: "Nenhum código de rastreio encontrado para este pedido",
                status: "pending"
            })
        }

        const token = await getMelhorEnvioToken()

        if (!token) {
            // Se não tiver token do Melhor Envio, retornar status genérico
            return NextResponse.json({
                tracking_code: trackingToCheck,
                status: "shipped",
                message: "Integração com Melhor Envio não configurada. Use o código de rastreio para acompanhar."
            })
        }

        // Chamar API do Melhor Envio para rastreamento
        const baseUrl = getMelhorEnvioBaseUrl()
        const response = await fetch(`${baseUrl}/me/shipment/tracking`, {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
                "User-Agent": "AtelierDaRubi (contato@atelierdarubi.com.br)"
            },
            body: JSON.stringify({
                orders: melhorEnvioOrderId ? [melhorEnvioOrderId] : [trackingToCheck]
            })
        })

        if (!response.ok) {
            console.error("Melhor Envio tracking error:", await response.text())
            return NextResponse.json({
                tracking_code: trackingToCheck,
                status: "unknown",
                message: "Não foi possível obter informações de rastreamento"
            })
        }

        const trackingData = await response.json()

        return NextResponse.json({
            tracking_code: trackingToCheck,
            tracking_data: trackingData,
            status: parseTrackingStatus(trackingData)
        })
    } catch (error: any) {
        console.error("Error fetching tracking:", error)
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        )
    }
}

// POST - Criar etiqueta de envio no Melhor Envio
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { order_id, service_id, from, to, products } = body

        if (!order_id || !service_id) {
            return NextResponse.json(
                { error: "order_id e service_id são obrigatórios" },
                { status: 400 }
            )
        }

        const token = await getMelhorEnvioToken()

        if (!token) {
            return NextResponse.json(
                { error: "Melhor Envio não configurado" },
                { status: 400 }
            )
        }

        // Buscar dados do pedido
        const { data: order, error: orderError } = await supabaseAdmin
            .from("orders")
            .select("*")
            .eq("id", order_id)
            .single()

        if (orderError || !order) {
            return NextResponse.json(
                { error: "Pedido não encontrado" },
                { status: 404 }
            )
        }

        const baseUrl = getMelhorEnvioBaseUrl()

        // 1. Adicionar ao carrinho do Melhor Envio
        const cartPayload = {
            service: service_id,
            from: from || {
                name: "Atelier da Rubi",
                phone: "22999999999", // TODO: Configurar no settings
                email: "contato@atelierdarubi.com.br",
                document: "12345678901", // TODO: CNPJ/CPF real
                company_document: "",
                state_register: "",
                address: "Rua da Loja",
                complement: "",
                number: "123",
                district: "Centro",
                city: "Arraial do Cabo",
                country_id: "BR",
                postal_code: "28930000",
                note: ""
            },
            to: to || {
                name: order.customer_name,
                phone: order.customer_phone?.replace(/\D/g, "") || "",
                email: order.customer_email,
                document: "",
                address: order.address_street,
                complement: order.address_complement || "",
                number: order.address_number,
                district: order.address_neighborhood,
                city: order.address_city,
                state_abbr: order.address_state,
                country_id: "BR",
                postal_code: order.address_zip?.replace(/\D/g, "") || "",
                note: order.customer_name
            },
            products: products || [{
                name: "Produtos Atelier da Rubi",
                quantity: 1,
                unitary_value: order.total_amount - (order.shipping_cost || 0),
                weight: 0.5 // TODO: Calcular peso real dos produtos
            }],
            options: {
                insurance_value: order.total_amount - (order.shipping_cost || 0),
                receipt: false,
                own_hand: false,
                collect: false,
                reverse: false,
                non_commercial: false
            }
        }

        const cartResponse = await fetch(`${baseUrl}/me/cart`, {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
                "User-Agent": "AtelierDaRubi (contato@atelierdarubi.com.br)"
            },
            body: JSON.stringify(cartPayload)
        })

        if (!cartResponse.ok) {
            const errorText = await cartResponse.text()
            console.error("Melhor Envio cart error:", errorText)
            return NextResponse.json(
                { error: "Erro ao adicionar ao carrinho do Melhor Envio", details: errorText },
                { status: 500 }
            )
        }

        const cartData = await cartResponse.json()
        const melhorEnvioOrderId = cartData.id

        // Atualizar pedido com o ID do Melhor Envio
        await supabaseAdmin
            .from("orders")
            .update({
                melhor_envio_order_id: melhorEnvioOrderId,
                updated_at: new Date().toISOString()
            })
            .eq("id", order_id)

        return NextResponse.json({
            success: true,
            melhor_envio_order_id: melhorEnvioOrderId,
            cart_data: cartData,
            message: "Etiqueta adicionada ao carrinho. Finalize o pagamento no painel do Melhor Envio."
        })
    } catch (error: any) {
        console.error("Error creating shipment:", error)
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        )
    }
}

// Helper para interpretar status do rastreamento
function parseTrackingStatus(trackingData: any): string {
    // O Melhor Envio retorna um objeto com os status da etiqueta
    if (!trackingData) return "unknown"

    const firstOrder = Object.values(trackingData)[0] as any
    if (!firstOrder) return "unknown"

    const status = firstOrder.status?.toLowerCase()

    if (status?.includes("entregue") || status?.includes("delivered")) {
        return "delivered"
    } else if (status?.includes("transito") || status?.includes("transit")) {
        return "in_transit"
    } else if (status?.includes("postado") || status?.includes("posted")) {
        return "shipped"
    } else if (status?.includes("gerada") || status?.includes("generated")) {
        return "label_generated"
    } else if (status?.includes("cancelad")) {
        return "cancelled"
    }

    return "processing"
}
