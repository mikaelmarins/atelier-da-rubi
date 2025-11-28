import { supabase } from "./supabase"

// TODO: Install mercadopago SDK: npm install mercadopago
// import { MercadoPagoConfig, Payment } from 'mercadopago';

// const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! });

export class PaymentService {
    static async createPayment(orderId: number, amount: number, description: string, payer: { email: string }) {
        try {
            console.log("Creating payment for order:", orderId)

            // MOCK IMPLEMENTATION
            // In a real scenario, you would call Mercado Pago API here

            /*
            const payment = new Payment(client);
            const result = await payment.create({
              body: {
                transaction_amount: amount,
                description: description,
                payment_method_id: 'pix',
                payer: {
                  email: payer.email
                },
              }
            });
            return result;
            */

            // Simulating API delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            return {
                id: `mock_pay_${Date.now()}`,
                status: 'approved',
                qr_code: 'mock_qr_code_string',
                qr_code_base64: 'mock_base64_image'
            }

        } catch (error) {
            console.error("Error creating payment:", error)
            throw error
        }
    }
}
