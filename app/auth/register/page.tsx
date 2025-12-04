"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/context/auth-context"
import { Eye, EyeOff, Loader2, Mail, Lock, User, ArrowLeft, Sparkles, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Google Icon Component
const GoogleIcon = () => (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
        />
        <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
        />
        <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
        />
        <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
        />
    </svg>
)

export default function RegisterPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const redirect = searchParams.get("redirect") || "/"
    const { signUp, signInWithGoogle } = useAuth()
    const { toast } = useToast()

    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [googleLoading, setGoogleLoading] = useState(false)
    const [error, setError] = useState("")

    const passwordRequirements = [
        { label: "Mínimo 6 caracteres", met: password.length >= 6 },
        { label: "Senhas coincidem", met: password === confirmPassword && password.length > 0 },
    ]

    const allRequirementsMet = passwordRequirements.every(r => r.met)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        if (!name.trim()) {
            setError("Digite seu nome")
            return
        }

        if (!allRequirementsMet) {
            setError("Verifique os requisitos da senha")
            return
        }

        setLoading(true)

        const { error } = await signUp(email, password, name)

        if (error) {
            if (error.message.includes("already registered")) {
                setError("Este e-mail já está cadastrado")
            } else {
                setError("Erro ao criar conta. Tente novamente.")
            }
            setLoading(false)
            return
        }

        toast({
            title: "Conta criada com sucesso! 🎉",
            description: "Bem-vinda ao Atelier da Rubi!",
        })

        router.push(redirect)
    }

    const handleGoogleSignUp = async () => {
        setGoogleLoading(true)
        setError("")

        const { error } = await signInWithGoogle()

        if (error) {
            setError("Erro ao entrar com Google. Tente novamente.")
            setGoogleLoading(false)
        }
        // If successful, user will be redirected by OAuth flow
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 pt-24 pb-12 flex items-center justify-center px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <div className="text-center mb-8">
                    <Link
                        href="/"
                        className="inline-flex items-center text-sm text-gray-500 hover:text-pink-500 mb-4"
                    >
                        <ArrowLeft className="h-4 w-4 mr-1" /> Voltar ao início
                    </Link>
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <Sparkles className="h-6 w-6 text-pink-500" />
                        <h1 className="text-3xl font-dancing font-bold text-gray-800">
                            Atelier da Rubi
                        </h1>
                    </div>
                    <p className="text-gray-600">Crie sua conta</p>
                </div>

                <Card className="shadow-xl border-0 bg-white/80 backdrop-blur">
                    <CardHeader className="space-y-1 pb-4">
                        <CardTitle className="text-2xl text-center">Criar Conta</CardTitle>
                        <CardDescription className="text-center">
                            Preencha seus dados para começar
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        {/* Google Sign Up Button */}
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full h-12 text-base font-medium border-gray-300 hover:bg-gray-50"
                            onClick={handleGoogleSignUp}
                            disabled={googleLoading || loading}
                        >
                            {googleLoading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <>
                                    <GoogleIcon />
                                    <span className="ml-2">Continuar com Google</span>
                                </>
                            )}
                        </Button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <Separator className="w-full" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white px-2 text-gray-500">
                                    ou cadastre com e-mail
                                </span>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg text-center">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="name">Nome completo</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="name"
                                        type="text"
                                        placeholder="Maria Silva"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="pl-10"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">E-mail</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="seu@email.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="pl-10"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Senha</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="pl-10 pr-10"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirmar senha</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="confirmPassword"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="pl-10"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Password requirements */}
                            <div className="space-y-1">
                                {passwordRequirements.map((req, index) => (
                                    <div
                                        key={index}
                                        className={`flex items-center gap-2 text-xs ${req.met ? "text-green-600" : "text-gray-400"
                                            }`}
                                    >
                                        <Check className={`h-3 w-3 ${req.met ? "opacity-100" : "opacity-30"}`} />
                                        {req.label}
                                    </div>
                                ))}
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-pink-500 hover:bg-pink-600 h-12 text-lg"
                                disabled={loading || googleLoading || !allRequirementsMet}
                            >
                                {loading ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    "Criar Conta"
                                )}
                            </Button>
                        </form>
                    </CardContent>

                    <CardFooter className="flex flex-col gap-4">
                        <Separator />
                        <p className="text-sm text-gray-600 text-center">
                            Já tem uma conta?{" "}
                            <Link
                                href={`/auth/login${redirect !== "/" ? `?redirect=${redirect}` : ""}`}
                                className="text-pink-600 hover:text-pink-700 font-medium"
                            >
                                Entrar
                            </Link>
                        </p>
                    </CardFooter>
                </Card>

                <p className="text-xs text-gray-500 text-center mt-6">
                    Ao criar sua conta, você concorda com nossos{" "}
                    <Link href="/termos" className="underline">Termos de Uso</Link>
                    {" "}e{" "}
                    <Link href="/privacidade" className="underline">Política de Privacidade</Link>
                </p>
            </motion.div>
        </div>
    )
}
