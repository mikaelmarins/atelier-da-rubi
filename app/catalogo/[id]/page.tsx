import type { Metadata } from "next"
import { notFound } from "next/navigation"
import ProductDetail from "@/components/product-detail"
import { getProductById } from "@/data/products"

type Props = {
  params: { id: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = getProductById(Number.parseInt(params.id))

  if (!product) {
    return {
      title: "Produto não encontrado - Atelier da Rubi",
    }
  }

  return {
    title: `${product.name} - Atelier da Rubi | Bordado Infantil`,
    description: `${product.description} Criado com amor pela Rubiana Lima em Arraial do Cabo. ${product.price}`,
    keywords: `${product.name}, bordado infantil, ${product.category}, Arraial do Cabo, Rubiana Lima`,
    openGraph: {
      title: `${product.name} - Atelier da Rubi`,
      description: product.description,
      images: [product.images[0]],
    },
  }
}

export default function ProductPage({ params }: Props) {
  const product = getProductById(Number.parseInt(params.id))

  if (!product) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 pt-24">
      <ProductDetail product={product} />
    </main>
  )
}

export async function generateStaticParams() {
  return [1, 2, 3, 4, 5, 6, 7, 8, 9].map((id) => ({
    id: id.toString(),
  }))
}
