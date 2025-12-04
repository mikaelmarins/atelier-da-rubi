"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { XCircle } from "lucide-react"

export default function CheckoutFailurePage() {
    return (
        <div className="container mx-auto px-4 py-24 pt-28 flex flex-col items-center justify-center text-center max-w-md min-h-screen">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
                <XCircle className="h-10 w-10 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Pagamento não realizado</h1>
            <p className="text-gray-600 mb-8">
                O processo de pagamento foi cancelado ou falhou. Nenhum valor foi cobrado.
            </p>
            <div className="flex flex-col gap-3 w-full">
                <Link href="/checkout" className="w-full">
                    <Button className="w-full">Tentar Novamente</Button>
                </Link>
                <Link href="/catalogo" className="w-full">
                    <Button variant="outline" className="w-full">Voltar ao Catálogo</Button>
                </Link>
            </div>
        </div>
    )
}
