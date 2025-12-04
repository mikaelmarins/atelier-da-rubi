import { NextRequest, NextResponse } from "next/server"
import { MercadoPagoConfig, Payment } from "mercadopago"

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const {
            transaction_amount,
            description,
            payer,
            external_reference
        } = body

        const accessToken = process.env.MP_ACCESS_TOKEN
        if (!accessToken) {
            return NextResponse.json(
                { error: "Mercado Pago não configurado" },
                { status: 500 }
            )
        }

        const client = new MercadoPagoConfig({ accessToken })
        const payment = new Payment(client)

        const paymentData = {
            transaction_amount: Number(transaction_amount),
            description,
            payment_method_id: "pix",
            payer: {
                email: payer.email,
                first_name: payer.first_name,
                last_name: payer.last_name,
                identification: payer.identification ? {
                    type: payer.identification.type,
                    number: payer.identification.number
                } : undefined
            },
            external_reference
        }

        const result = await payment.create({ body: paymentData })

        // Extract PIX data
        const pixData = result.point_of_interaction?.transaction_data

        return NextResponse.json({
            id: result.id,
            status: result.status,
            status_detail: result.status_detail,
            external_reference: result.external_reference,
            qr_code: pixData?.qr_code,
            qr_code_base64: pixData?.qr_code_base64,
            ticket_url: pixData?.ticket_url
        })
    } catch (error: any) {
        console.error("PIX payment error:", error)

        return NextResponse.json(
            {
                error: "Erro ao gerar PIX",
                message: error.message
            },
            { status: 500 }
        )
    }
}
