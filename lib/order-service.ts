import { supabase } from "./supabase"
import type { Database } from "./supabase"
import type { CartItem } from "@/context/cart-context"

type Order = Database["public"]["Tables"]["orders"]["Row"]
type OrderInsert = Database["public"]["Tables"]["orders"]["Insert"]
type OrderItemInsert = Database["public"]["Tables"]["order_items"]["Insert"]

export interface CreateOrderParams {
    customer: {
        name: string
        email: string
        phone: string
        userId?: string
    }
    address: {
        zip: string
        street: string
        number: string
        complement?: string
        neighborhood: string
        city: string
        state: string
    }
    items: CartItem[]
    shippingCost: number
    totalAmount: number
}

export class OrderService {
    static async createOrder(params: CreateOrderParams) {
        try {
            console.log("Creating order...", params)

            // 1. Create Order Record
            // 1. Create Order Record
            const orderId = crypto.randomUUID()
            const orderData: OrderInsert = {
                id: orderId,
                user_id: params.customer.userId,
                customer_name: params.customer.name,
                customer_email: params.customer.email,
                customer_phone: params.customer.phone,
                address_zip: params.address.zip,
                address_street: params.address.street,
                address_number: params.address.number,
                address_complement: params.address.complement,
                address_neighborhood: params.address.neighborhood,
                address_city: params.address.city,
                address_state: params.address.state,
                shipping_cost: params.shippingCost,
                total_amount: params.totalAmount,
                status: "pending",
            }

            const { error: orderError } = await supabase
                .from("orders")
                .insert(orderData)

            if (orderError) {
                console.error("Error creating order record:", JSON.stringify(orderError, null, 2))
                throw new Error(`Failed to create order: ${orderError?.message || 'Unknown error'}`)
            }

            // 2. Create Order Items
            const orderItems: OrderItemInsert[] = params.items.map((item) => ({
                order_id: orderId,
                product_id: item.product.id,
                product_name: item.product.name,
                price: parseFloat(item.product.price), // Ensure price is number
                quantity: item.quantity,
                customization: item.customization || null,
            }))

            const { error: itemsError } = await supabase.from("order_items").insert(orderItems)

            if (itemsError) {
                console.error("Error creating order items:", itemsError)
                // TODO: Rollback order creation if possible, or mark as failed
                throw new Error("Failed to create order items")
            }

            return { ...orderData, id: orderId }
        } catch (error) {
            console.error("OrderService.createOrder error:", error)
            throw error
        }
    }

    static async getOrderById(id: number) {
        const { data, error } = await supabase
            .from("orders")
            .select(`
        *,
        items:order_items(*)
      `)
            .eq("id", id)
            .single()

        if (error) throw error
        return data
    }
}
