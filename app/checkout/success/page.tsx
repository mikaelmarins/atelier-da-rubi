"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CheckCircle, Loader2, XCircle } from "lucide-react"
import { useCart } from "@/context/cart-context"

export default function CheckoutSuccessPage() {
    const searchParams = useSearchParams()
    const { clearCart } = useCart()
    const [status, setStatus] = useState<"loading" | "success" | "failure">("loading")

    const paymentId = searchParams.get("payment_id")
    const collectionStatus = searchParams.get("collection_status")
    const externalReference = searchParams.get("external_reference")

    useEffect(() => {
        if (collectionStatus === "approved") {
            setStatus("success")
            clearCart()
        } else if (collectionStatus === "rejected" || collectionStatus === "null") {
            setStatus("failure")
        } else {
            // If no status is present, assume it's just a direct visit or pending
            // You might want to fetch the order status from your DB here
            setStatus("success")
            clearCart()
        }
    }, [collectionStatus, clearCart])

    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
            </div>
        )
    }

    if (status === "failure") {
        return (
            <div className="container mx-auto px-4 py-24 flex flex-col items-center justify-center text-center max-w-md">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
                    <XCircle className="h-10 w-10 text-red-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Pagamento não aprovado</h1>
                <p className="text-gray-600 mb-8">
                    Houve um problema com o seu pagamento. Por favor, tente novamente.
                </p>
                <Link href="/checkout">
                    <Button className="w-full">Tentar Novamente</Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-24 flex flex-col items-center justify-center text-center max-w-md">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Pedido Confirmado!</h1>
            <p className="text-gray-600 mb-2">
                Obrigado pela sua compra!
            </p>
            {paymentId && (
                <p className="text-sm text-gray-500 mb-6">
                    ID do Pagamento: {paymentId}
                </p>
            )}
            <p className="text-gray-600 mb-8">
                Você receberá um e-mail com os detalhes do seu pedido e informações de rastreamento assim que ele for enviado.
            </p>
            <Link href="/catalogo">
                <Button className="w-full bg-pink-600 hover:bg-pink-700">Continuar Comprando</Button>
            </Link>
        </div>
    )
}
