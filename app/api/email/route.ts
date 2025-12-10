import { NextRequest, NextResponse } from "next/server"
import { sendOrderConfirmationEmail, sendOrderStatusUpdateEmail, sendWelcomeEmail, sendPasswordResetEmail } from "@/lib/email-service"

// POST - Enviar email
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { type, data } = body

        if (!type) {
            return NextResponse.json({ error: "Tipo de email é obrigatório" }, { status: 400 })
        }

        let result

        switch (type) {
            case 'order_confirmation':
                result = await sendOrderConfirmationEmail(data)
                break

            case 'status_update':
                result = await sendOrderStatusUpdateEmail(data, data.status)
                break

            case 'welcome':
                result = await sendWelcomeEmail(data.name, data.email)
                break

            case 'password_reset':
                result = await sendPasswordResetEmail(data.name, data.email, data.resetLink)
                break

            default:
                return NextResponse.json({ error: "Tipo de email inválido" }, { status: 400 })
        }

        if (!result.success) {
            return NextResponse.json({ error: result.error }, { status: 500 })
        }

        return NextResponse.json({ success: true, emailId: result.id })
    } catch (error: any) {
        console.error("Error sending email:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
