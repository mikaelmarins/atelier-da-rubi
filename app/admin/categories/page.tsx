"use client"

import { useState, useEffect } from "react"
import { Plus, Pencil, Trash2, Loader2, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import AuthGuard from "@/components/auth/auth-guard"
import { supabase } from "@/lib/supabase"
import type { Database } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

type Category = Database["public"]["Tables"]["categories"]["Row"]

function CategoriesPageContent() {
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const { toast } = useToast()

    const loadCategories = async () => {
        try {
            const { data, error } = await supabase
                .from("categories")
                .select("*")
                .order("name")

            if (error) throw error
            setCategories(data || [])
        } catch (error) {
            console.error("Error loading categories:", error)
            toast({
                title: "Erro ao carregar",
                description: "Não foi possível carregar as categorias.",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadCategories()
    }, [])

    const handleDelete = async (id: number) => {
        if (!confirm("Tem certeza que deseja excluir esta categoria? Produtos associados podem ficar sem categoria.")) return

        try {
            const { error } = await supabase
                .from("categories")
                .delete()
                .eq("id", id)

            if (error) throw error
            toast({
                title: "Categoria excluída",
                description: "A categoria foi removida com sucesso.",
            })
            loadCategories()
        } catch (error) {
            console.error("Error deleting category:", error)
            toast({
                title: "Erro ao excluir",
                description: "Não foi possível excluir a categoria. Verifique se há produtos associados.",
                variant: "destructive",
            })
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 pt-24">
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-4">
                        <Button asChild variant="ghost">
                            <Link href="/admin">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Voltar
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">Categorias</h1>
                            <p className="text-gray-600">Gerencie as categorias dos produtos</p>
                        </div>
                    </div>
                    <Button asChild className="bg-pink-500 hover:bg-pink-600">
                        <Link href="/admin/categories/new">
                            <Plus className="h-4 w-4 mr-2" />
                            Nova Categoria
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Lista de Categorias</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-gray-700 uppercase">
                                    <tr>
                                        <th className="px-6 py-3">Nome</th>
                                        <th className="px-6 py-3">Slug</th>
                                        <th className="px-6 py-3 text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {categories.length === 0 ? (
                                        <tr>
                                            <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                                                Nenhuma categoria encontrada.
                                            </td>
                                        </tr>
                                    ) : (
                                        categories.map((category) => (
                                            <tr key={category.id} className="bg-white border-b hover:bg-gray-50">
                                                <td className="px-6 py-4 font-medium text-gray-900">{category.name}</td>
                                                <td className="px-6 py-4 text-gray-500">{category.slug}</td>
                                                <td className="px-6 py-4 text-right space-x-2">
                                                    <Button asChild variant="ghost" size="sm">
                                                        <Link href={`/admin/categories/${category.id}/edit`}>
                                                            <Pencil className="h-4 w-4 text-blue-500" />
                                                        </Link>
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDelete(category.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-red-500" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default function CategoriesPage() {
    return (
        <AuthGuard>
            <CategoriesPageContent />
        </AuthGuard>
    )
}
