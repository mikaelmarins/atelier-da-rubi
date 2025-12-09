"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Truck, ArrowLeft, ExternalLink } from "lucide-react"
import Link from "next/link"
import AuthGuard from "@/components/auth/auth-guard"

function IntegrationsPageContent() {
    const handleConnectMelhorEnvio = async () => {
        try {
            const res = await fetch('/api/melhor-envio/auth-url')
            const data = await res.json()
            if (data.url) {
                // Redireciona para a página de autorização do Melhor Envio
                window.location.href = data.url
            }
        } catch (error) {
            console.error("Erro ao buscar URL de autorização:", error)
            alert("Erro ao iniciar integração. Verifique o console.")
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 pt-24">
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="flex items-center gap-4 mb-8">
                    <Button asChild variant="ghost">
                        <Link href="/admin">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Voltar
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Integrações</h1>
                        <p className="text-gray-600">Gerencie conexões com serviços externos</p>
                    </div>
                </div>

                <div className="grid gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-xl font-bold text-gray-800">
                                <span className="bg-blue-100 p-2 rounded-lg">
                                    <Truck className="h-6 w-6 text-blue-600" />
                                </span>
                                Melhor Envio
                            </CardTitle>
                            <CardDescription>
                                Conecte sua conta do Melhor Envio para calcular fretes automaticamente no carrinho e gerar etiquetas de envio.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                                <div className="flex">
                                    <div className="ml-3">
                                        <p className="text-sm text-yellow-700">
                                            Certifique-se de estar usando o ambiente correto (Sandbox ou Produção) configurado no seu arquivo .env.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <p className="text-sm text-gray-600">
                                Ao conectar, você será redirecionado para o site do Melhor Envio para autorizar o acesso.
                            </p>
                        </CardContent>
                        <CardFooter>
                            <Button onClick={handleConnectMelhorEnvio} className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto">
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Conectar Melhor Envio
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default function IntegrationsPage() {
    return (
        <AuthGuard>
            <IntegrationsPageContent />
        </AuthGuard>
    )
}
