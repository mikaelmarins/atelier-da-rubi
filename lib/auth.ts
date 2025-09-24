// Sistema de Autenticação
export interface User {
  email: string
  name: string
  role: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export class AuthService {
  private static readonly STORAGE_KEY = "atelier-auth-session"
  private static readonly SESSION_DURATION = 24 * 60 * 60 * 1000 // 24 horas

  // Credenciais válidas
  private static readonly VALID_CREDENTIALS = {
    email: "rubiananascimento1@gmail.com",
    password: "Senha@123",
    user: {
      email: "rubiananascimento1@gmail.com",
      name: "Rubiana Lima",
      role: "admin",
    },
  }

  static async login(credentials: LoginCredentials): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      // Simular delay de rede
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Verificar credenciais
      if (
        credentials.email === this.VALID_CREDENTIALS.email &&
        credentials.password === this.VALID_CREDENTIALS.password
      ) {
        const session = {
          user: this.VALID_CREDENTIALS.user,
          loginTime: Date.now(),
          expiresAt: Date.now() + this.SESSION_DURATION,
        }

        // Salvar sessão
        if (typeof window !== "undefined") {
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(session))
        }

        return {
          success: true,
          user: this.VALID_CREDENTIALS.user,
        }
      } else {
        return {
          success: false,
          error: "Email ou senha incorretos",
        }
      }
    } catch (error) {
      return {
        success: false,
        error: "Erro interno do servidor",
      }
    }
  }

  static logout(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(this.STORAGE_KEY)
    }
  }

  static getCurrentUser(): User | null {
    if (typeof window === "undefined") return null

    try {
      const sessionData = localStorage.getItem(this.STORAGE_KEY)
      if (!sessionData) return null

      const session = JSON.parse(sessionData)

      // Verificar se a sessão expirou
      if (Date.now() > session.expiresAt) {
        this.logout()
        return null
      }

      return session.user
    } catch (error) {
      console.error("Error getting current user:", error)
      this.logout()
      return null
    }
  }

  static isAuthenticated(): boolean {
    return this.getCurrentUser() !== null
  }

  static extendSession(): void {
    if (typeof window === "undefined") return

    try {
      const sessionData = localStorage.getItem(this.STORAGE_KEY)
      if (!sessionData) return

      const session = JSON.parse(sessionData)
      session.expiresAt = Date.now() + this.SESSION_DURATION

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(session))
    } catch (error) {
      console.error("Error extending session:", error)
    }
  }

  static getSessionInfo(): { loginTime: number; expiresAt: number } | null {
    if (typeof window === "undefined") return null

    try {
      const sessionData = localStorage.getItem(this.STORAGE_KEY)
      if (!sessionData) return null

      const session = JSON.parse(sessionData)
      return {
        loginTime: session.loginTime,
        expiresAt: session.expiresAt,
      }
    } catch (error) {
      return null
    }
  }
}
