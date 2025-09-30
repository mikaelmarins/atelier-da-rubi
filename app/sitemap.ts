import type { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://atelierdarubi.com.br"

  // Páginas estáticas
  const routes = ["", "/catalogo"].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: route === "" ? 1.0 : 0.9,
  }))

  // Produtos (IDs 1-9 são os padrão)
  const products = Array.from({ length: 9 }, (_, i) => ({
    url: `${baseUrl}/catalogo/${i + 1}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }))

  return [...routes, ...products]
}
