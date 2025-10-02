import { supabase } from "./supabase"

export interface User {
  id: string
  email: string
  name: string
}

export class AuthServiceSupabase {
  // Login
  static async login(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error("Login error:", error)
        return {
          success: false,
          error: "Email ou senha incorretos",
        }
      }

      if (!data.user) {
        return {
          success: false,
          error: "Erro ao fazer login",
        }
      }

      // Buscar informações do admin
      const { data: adminData } = await supabase.from("admin_users").select("*").eq("email", email).single()

      return {
        success: true,
        user: {
          id: data.user.id,
          email: data.user.email!,
          name: adminData?.name || "Admin",
        },
      }
    } catch (error) {
      console.error("Login error:", error)
      return {
        success: false,
        error: "Erro interno do servidor",
      }
    }
  }

  // Logout
  static async logout(): Promise<void> {
    await supabase.auth.signOut()
  }

  // Obter usuário atual
  static async getCurrentUser(): Promise<User | null> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return null

      const { data: adminData } = await supabase.from("admin_users").select("*").eq("email", user.email).single()

      return {
        id: user.id,
        email: user.email!,
        name: adminData?.name || "Admin",
      }
    } catch (error) {
      console.error("Error getting current user:", error)
      return null
    }
  }

  // Verificar se está autenticado
  static async isAuthenticated(): Promise<boolean> {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    return !!session
  }

  // Ouvir mudanças de autenticação
  static onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data: adminData } = await supabase
          .from("admin_users")
          .select("*")
          .eq("email", session.user.email)
          .single()

        callback({
          id: session.user.id,
          email: session.user.email!,
          name: adminData?.name || "Admin",
        })
      } else {
        callback(null)
      }
    })
  }
}
