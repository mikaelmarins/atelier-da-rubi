"use client"

import type React from "react"
import { useState } from "react"
import { ArrowLeft, Save, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import AuthGuard from "@/components/auth/auth-guard"
import { supabase } from "@/lib/supabase"

function NewCategoryPageContent() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [name, setName] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            // Generate slug from name
            const slug = name
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-+|-+$/g, "")

            const { error } = await supabase.from("categories").insert({
                name,
                slug,
            })

            if (error) throw error

            alert("Categoria criada com sucesso!")
            router.push("/admin/categories")
        } catch (error) {
            console.error("Error creating category:", error)
            alert("Erro ao criar categoria. Verifique se o nome já existe.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 pt-24">
            <div className="container mx-auto px-4 py-8 max-w-2xl">
                <div className="flex items-center gap-4 mb-8">
                    <Button asChild variant="ghost">
                        <Link href="/admin/categories">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Voltar
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-dancing font-bold text-gray-800">Nova Categoria</h1>
                        <p className="text-gray-600">Adicione uma nova categoria de produtos</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Informações da Categoria</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nome da Categoria *</Label>
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Ex: Kit Berço"
                                    required
                                />
                                <p className="text-sm text-gray-500">
                                    O slug (URL) será gerado automaticamente a partir do nome.
                                </p>
                            </div>

                            <div className="flex justify-end gap-4">
                                <Button type="button" variant="outline" asChild>
                                    <Link href="/admin/categories">Cancelar</Link>
                                </Button>
                                <Button type="submit" disabled={loading} className="bg-pink-500 hover:bg-pink-600">
                                    {loading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Salvando...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4 mr-2" />
                                            Salvar Categoria
                                        </>
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </div>
    )
}

export default function NewCategoryPage() {
    return (
        <AuthGuard>
            <NewCategoryPageContent />
        </AuthGuard>
    )
}
