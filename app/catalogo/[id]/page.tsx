import type { Metadata } from "next"
import ProductDetail from "@/components/product-detail"

type Props = {
  params: Promise<{ id: string }>
}

// Função helper para carregar produtos do localStorage no servidor
function getProductFromStorage(id: number) {
  if (typeof window === "undefined") {
    // No servidor, retornar null - o componente cliente vai carregar
    return null
  }

  try {
    const saved = localStorage.getItem("atelier-products")
    if (saved) {
      const products = JSON.parse(saved)
      return products.find((p: any) => p.id === id)
    }
  } catch (error) {
    console.error("Error loading product:", error)
  }

  return null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params
  const productId = Number.parseInt(resolvedParams.id)

  return {
    title: `Produto ${productId} - Atelier da Rubi | Bordado Infantil`,
    description: `Veja os detalhes deste produto especial do Atelier da Rubi em Arraial do Cabo.`,
    keywords: `bordado infantil, Arraial do Cabo, Rubiana Lima`,
  }
}

export default async function ProductPage({ params }: Props) {
  const resolvedParams = await params
  const productId = Number.parseInt(resolvedParams.id)

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 pt-24">
      <ProductDetail productId={productId} />
    </main>
  )
}

export async function generateStaticParams() {
  return [1, 2, 3, 4, 5, 6, 7, 8, 9].map((id) => ({
    id: id.toString(),
  }))
}
