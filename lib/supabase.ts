import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

console.log("[Supabase] URL defined:", !!supabaseUrl, "Key defined:", !!supabaseAnonKey)

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("[Supabase] Missing environment variables!", { supabaseUrl, supabaseAnonKey: supabaseAnonKey ? "***" : undefined })
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos do banco de dados
export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          id: number
          name: string
          slug: string
          created_at: string
        }
        Insert: {
          name: string
          slug: string
        }
        Update: {
          name?: string
          slug?: string
        }
      }
      products: {
        Row: {
          id: number
          name: string
          description: string
          price: number
          category: string
          category_id: number | null
          featured: boolean
          material: string
          tamanhos: string[]
          cuidados: string
          tempo_producao: string
          details: any
          weight: number
          height: number
          width: number
          length: number
          is_customizable: boolean
          created_at: string
          has_colors: boolean
          colors: any
          is_secondary_color: boolean
        }
        Insert: {
          name: string
          description: string
          price: number
          category: string
          category_id?: number | null
          featured?: boolean
          material?: string
          tamanhos?: string[]
          cuidados?: string
          tempo_producao?: string
          details?: any
          weight?: number
          height?: number
          width?: number
          length?: number
          is_customizable?: boolean
          has_colors?: boolean
          colors?: any
          is_secondary_color?: boolean
        }
        Update: {
          name?: string
          description?: string
          price?: number
          category?: string
          category_id?: number | null
          featured?: boolean
          material?: string
          tamanhos?: string[]
          cuidados?: string
          tempo_producao?: string
          details?: any
          weight?: number
          height?: number
          width?: number
          length?: number
          is_customizable?: boolean
          has_colors?: boolean
          colors?: any
          is_secondary_color?: boolean
        }
      }
      product_images: {
        Row: {
          id: number
          product_id: number
          image_url: string
          display_order: number
          created_at: string
        }
        Insert: {
          product_id: number
          image_url: string
          display_order: number
        }
        Update: {
          product_id?: number
          image_url?: string
          display_order?: number
        }
      }
      admin_users: {
        Row: {
          id: string
          email: string
          name: string
          created_at: string
        }
      }
      orders: {
        Row: {
          id: string
          created_at: string
          updated_at: string | null
          user_id: string | null
          status: string
          payment_status: string | null
          total_amount: number
          shipping_cost: number
          customer_name: string
          customer_email: string
          customer_phone: string
          address_zip: string
          address_street: string
          address_number: string
          address_complement: string | null
          address_neighborhood: string
          address_city: string
          address_state: string
          payment_id: string | null
          payment_method: string | null
          tracking_code: string | null
          tracking_url: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          status?: string
          payment_status?: string | null
          total_amount: number
          shipping_cost?: number
          customer_name: string
          customer_email: string
          customer_phone: string
          address_zip: string
          address_street: string
          address_number: string
          address_complement?: string | null
          address_neighborhood: string
          address_city: string
          address_state: string
          payment_id?: string | null
          payment_method?: string | null
          tracking_code?: string | null
          tracking_url?: string | null
        }
        Update: {
          status?: string
          payment_status?: string | null
          payment_id?: string | null
          payment_method?: string | null
          tracking_code?: string | null
          tracking_url?: string | null
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: number
          created_at: string
          order_id: string
          product_id: number | null
          product_name: string
          price: number
          quantity: number
          customization: string | null
        }
        Insert: {
          order_id: string
          product_id?: number | null
          product_name: string
          price: number
          quantity: number
          customization?: string | null
        }
      }
      carousel_config: {
        Row: {
          id: number
          product_id: number
          display_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          product_id: number
          display_order: number
        }
        Update: {
          product_id?: number
          display_order?: number
        }
      }
    }
  }
}
