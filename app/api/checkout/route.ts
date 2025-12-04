import { NextResponse } from "next/server"
import MercadoPagoConfig, { Preference } from "mercadopago"

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { items, payer, orderId, shippingCost } = body

        console.log("Checkout API called with:", { itemsCount: items?.length, orderId })

        if (!process.env.MP_ACCESS_TOKEN) {
            console.error("MP_ACCESS_TOKEN not found in environment variables")
            return NextResponse.json({ error: "Access token not configured" }, { status: 500 })
        }

        // Initialize MercadoPago client INSIDE the function to ensure env var is available
        const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN })
        const preference = new Preference(client)

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"

        // Create preference with correct SDK 2.x format
        const response = await preference.create({
            body: {
                items: items.map((item: any) => ({
                    id: String(item.product.id),
                    title: String(item.product.name),
                    quantity: Number(item.quantity),
                    unit_price: Number(item.product.price),
                    currency_id: "BRL",
                })),
                payer: {
                    email: payer.email,
                    name: payer.name,
                },
                back_urls: {
                    success: `${baseUrl}/checkout/success`,
                    failure: `${baseUrl}/checkout/failure`,
                    pending: `${baseUrl}/checkout/pending`,
                },
                external_reference: orderId,
                statement_descriptor: "ATELIER RUBI",
            },
        })

        console.log("Preference created successfully:", response.id)

        return NextResponse.json({
            id: response.id,
            init_point: response.init_point,
        })
    } catch (error: any) {
        console.error("Error creating preference:", error.message)
        console.error("Error details:", error.cause || error)
        return NextResponse.json({
            error: error.message || "Error creating preference",
            details: error.cause || null
        }, { status: 500 })
    }
}
