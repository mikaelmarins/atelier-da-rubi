import { NextRequest, NextResponse } from "next/server"
import { MercadoPagoConfig, Payment } from "mercadopago"

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const {
            transaction_amount,
            token,
            description,
            installments,
            payment_method_id,
            issuer_id,
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
            token,
            description,
            installments: Number(installments),
            payment_method_id,
            issuer_id: issuer_id ? Number(issuer_id) : undefined,
            payer: {
                email: payer.email,
                identification: payer.identification ? {
                    type: payer.identification.type,
                    number: payer.identification.number
                } : undefined
            },
            external_reference,
            statement_descriptor: "ATELIERDAUBI"
        }

        const result = await payment.create({ body: paymentData })

        return NextResponse.json({
            id: result.id,
            status: result.status,
            status_detail: result.status_detail,
            external_reference: result.external_reference
        })
    } catch (error: any) {
        console.error("Payment error:", error)

        // Mercado Pago error handling
        if (error.cause) {
            return NextResponse.json(
                {
                    error: "Erro no pagamento",
                    details: error.cause,
                    message: error.message
                },
                { status: 400 }
            )
        }

        return NextResponse.json(
            { error: "Erro ao processar pagamento" },
            { status: 500 }
        )
    }
}
