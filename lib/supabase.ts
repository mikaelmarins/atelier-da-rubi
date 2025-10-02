import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos do banco de dados
export type Database = {
  public: {
    Tables: {
      products: {
        Row: {
          id: number
          name: string
          description: string
          price: string
          category: string
          featured: boolean
          material: string
          tamanhos: string[]
          cuidados: string
          tempo_producao: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["products"]["Row"], "id" | "created_at" | "updated_at">
        Update: Partial<Database["public"]["Tables"]["products"]["Insert"]>
      }
      product_images: {
        Row: {
          id: number
          product_id: number
          image_url: string
          display_order: number
          created_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["product_images"]["Row"], "id" | "created_at">
        Update: Partial<Database["public"]["Tables"]["product_images"]["Insert"]>
      }
      admin_users: {
        Row: {
          id: string
          email: string
          name: string
          created_at: string
        }
      }
    }
  }
}
