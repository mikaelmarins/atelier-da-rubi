"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CheckCircle, Loader2, XCircle, Package, Copy, Check } from "lucide-react"
import { useCart } from "@/context/cart-context"

function CheckoutSuccessContent() {
    const searchParams = useSearchParams()
    const { clearCart } = useCart()
    const [status, setStatus] = useState<"loading" | "success" | "failure">("loading")
    const [copied, setCopied] = useState(false)

    const paymentId = searchParams.get("payment_id")
    const collectionStatus = searchParams.get("collection_status")
    const externalReference = searchParams.get("external_reference") // Este é o orderId

    useEffect(() => {
        if (collectionStatus === "approved") {
            setStatus("success")
            clearCart()
        } else if (collectionStatus === "rejected" || collectionStatus === "null") {
            setStatus("failure")
        } else {
            // Se não houver status, assume sucesso (pagamento pendente ou visita direta)
            setStatus("success")
            clearCart()
        }
    }, [collectionStatus, clearCart])

    const handleCopyOrderId = () => {
        if (externalReference) {
            navigator.clipboard.writeText(externalReference)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center pt-20">
                <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
            </div>
        )
    }

    if (status === "failure") {
        return (
            <div className="container mx-auto px-4 py-24 pt-28 flex flex-col items-center justify-center text-center max-w-md min-h-screen">
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
        <div className="container mx-auto px-4 py-24 pt-28 flex flex-col items-center justify-center text-center max-w-lg min-h-screen">
            {/* Success Icon */}
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-pulse">
                <CheckCircle className="h-12 w-12 text-green-600" />
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-2">Pedido Confirmado!</h1>
            <p className="text-gray-600 mb-6">
                Obrigado pela sua compra! Recebemos seu pedido com sucesso.
            </p>

            {/* Order ID Card */}
            {externalReference && (
                <div className="bg-gray-50 rounded-xl p-4 mb-6 w-full">
                    <p className="text-sm text-gray-500 mb-1">Código do Pedido</p>
                    <div className="flex items-center justify-center gap-2">
                        <code className="text-sm font-mono bg-white px-3 py-2 rounded border">
                            {externalReference.slice(0, 8)}...{externalReference.slice(-4)}
                        </code>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleCopyOrderId}
                            className="text-gray-500"
                        >
                            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                        </Button>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                        Guarde este código para acompanhar seu pedido
                    </p>
                </div>
            )}

            {/* Payment Info */}
            {paymentId && (
                <p className="text-sm text-gray-500 mb-6">
                    ID de Pagamento: {paymentId}
                </p>
            )}

            {/* Next Steps */}
            <div className="bg-blue-50 rounded-xl p-4 mb-8 w-full text-left">
                <h3 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Próximos passos
                </h3>
                <ul className="text-sm text-blue-700 space-y-1">
                    <li>✓ Você receberá um e-mail com os detalhes</li>
                    <li>✓ Prepararemos seu pedido com carinho</li>
                    <li>✓ Enviaremos o código de rastreio quando for despachado</li>
                </ul>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 w-full">
                <Link href="/catalogo" className="block">
                    <Button className="w-full bg-pink-600 hover:bg-pink-700">
                        <Package className="h-4 w-4 mr-2" />
                        Continuar Explorando
                    </Button>
                </Link>

                <Link href="/catalogo" className="block">
                    <Button variant="outline" className="w-full">
                        Continuar Comprando
                    </Button>
                </Link>
            </div>

            {/* WhatsApp Help */}
            <div className="mt-8 pt-6 border-t w-full">
                <p className="text-sm text-gray-500 mb-2">
                    Dúvidas sobre seu pedido?
                </p>
                <a
                    href={`https://wa.me/5522997890934?text=Olá! Acabei de fazer um pedido${externalReference ? ` (${externalReference.slice(0, 8)})` : ''} e gostaria de confirmar.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-600 hover:text-green-700 text-sm font-medium"
                >
                    Fale conosco no WhatsApp →
                </a>
            </div>
        </div>
    )
}

export default function CheckoutSuccessPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center pt-20">
                <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
            </div>
        }>
            <CheckoutSuccessContent />
        </Suspense>
    )
}
