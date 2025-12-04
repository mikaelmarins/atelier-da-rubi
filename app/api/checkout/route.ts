import { NextResponse } from "next/server"
import MercadoPagoConfig, { Preference } from "mercadopago"
import { supabase } from "@/lib/supabase"

const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! })

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { items, payer, orderId, shippingCost } = body

        console.log("Debug Env Vars:");
        console.log("MP_ACCESS_TOKEN exists:", !!process.env.MP_ACCESS_TOKEN);
        if (process.env.MP_ACCESS_TOKEN) {
            console.log("MP_ACCESS_TOKEN length:", process.env.MP_ACCESS_TOKEN.length);
            console.log("MP_ACCESS_TOKEN start:", process.env.MP_ACCESS_TOKEN.substring(0, 10));
        } else {
            console.log("All Env Keys:", Object.keys(process.env));
        }

        if (!process.env.MP_ACCESS_TOKEN) {
            return NextResponse.json({ error: "Access token not configured" }, { status: 500 })
        }

        const preference = new Preference(client)

        const sanitizedPhone = payer.phone.replace(/\D/g, "")

        const preferenceData = {
            body: {
                items: items.map((item: any) => ({
                    id: item.product.id.toString(),
                    title: item.product.name,
                    quantity: Number(item.quantity),
                    unit_price: Number(item.product.price),
                })),
                payer: {
                    email: payer.email,
                    name: payer.name,
                },
                back_urls: {
                    success: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/checkout/success`,
                    failure: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/checkout/failure`,
                    pending: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/checkout/pending`,
                },
                auto_return: "approved",
                external_reference: orderId,
                shipments: {
                    cost: shippingCost,
                    mode: "not_specified",
                },
                statement_descriptor: "ATELIER RUBI",
            },
        }

        const response = await preference.create(preferenceData)

        return NextResponse.json({
            id: response.id,
            init_point: response.init_point,
        })
    } catch (error: any) {
        console.error("Error creating preference (Full Object):", error)
        console.error("Error creating preference (Message):", error.message)
        console.error("Error creating preference (Cause):", error.cause)
        return NextResponse.json({
            error: error.message || "Error creating preference",
            details: error.cause || error
        }, { status: 500 })
    }
}
