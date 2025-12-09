import { supabase } from "./supabase"
import type { Database } from "./supabase"

type Product = Database["public"]["Tables"]["products"]["Row"]
type ProductInsert = Database["public"]["Tables"]["products"]["Insert"]
type ProductImage = Database["public"]["Tables"]["product_images"]["Row"]

export interface ProductWithImages extends Product {
  images: ProductImage[]
}

export class ProductServiceSupabase {
  // Criar produto
  static async createProduct(data: ProductInsert, imageFiles: File[]): Promise<ProductWithImages | null> {
    try {
      console.log("[v0] Creating product with data:", data)

      // 1. Criar produto
      const { data: product, error: productError } = await supabase
        .from("products")
        .insert(data)
        .select()
        .single()

      if (productError) {
        console.error("[v0] Error creating product:", productError.message, productError.code, productError.details, JSON.stringify(productError))
        throw new Error(productError.message || "Erro ao criar produto no banco de dados")
      }

      console.log("[v0] Product created successfully:", product.id)

      // 2. Upload de imagens
      const imageUrls: { url: string; order: number }[] = []

      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i]
        const fileExt = file.name.split(".").pop()
        const fileName = `${product.id}-${Date.now()}-${i}.${fileExt}`
        const filePath = `products/${fileName}`

        // Upload para Supabase Storage
        const { error: uploadError } = await supabase.storage.from("product-images").upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        })

        if (uploadError) {
          console.error("Error uploading image:", uploadError)
          continue
        }

        // Obter URL pública
        const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(filePath)

        imageUrls.push({ url: urlData.publicUrl, order: i })
      }

      // 3. Salvar referências das imagens
      if (imageUrls.length > 0) {
        const { error: imagesError } = await supabase.from("product_images").insert(
          imageUrls.map(({ url, order }) => ({
            product_id: product.id,
            image_url: url,
            display_order: order,
          })),
        )

        if (imagesError) {
          console.error("Error saving image references:", imagesError)
        }
      }

      // 4. Buscar produto completo com imagens
      return await this.getProductById(product.id)
    } catch (error) {
      console.error("[v0] Error in createProduct:", error)
      throw error
    }
  }

  // Buscar todos os produtos
  static async getAllProducts(): Promise<ProductWithImages[]> {
    try {
      console.log("[v0] Fetching all products...")

      const { data: products, error } = await supabase
        .from("products")
        .select(`
          *,
          images:product_images(*)
        `)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("[v0] Error fetching products:", error)
        throw error
      }

      // Remover duplicatas (produtos com mesmo ID)
      const seen = new Set<number>()
      const uniqueProducts = (products || []).filter((product: any) => {
        if (seen.has(product.id)) {
          console.warn(`[v0] Duplicate product found with ID ${product.id}, removing...`)
          return false
        }
        seen.add(product.id)
        return true
      })

      console.log("[v0] Products fetched successfully:", uniqueProducts.length)
      return uniqueProducts as any
    } catch (error) {
      console.error("[v0] Error in getAllProducts:", error)
      throw error
    }
  }

  // Buscar produto por ID
  static async getProductById(id: number): Promise<ProductWithImages | null> {
    try {
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          images:product_images(*)
        `)
        .eq("id", id)
        .single()

      if (error) {
        console.error("Error fetching product:", error)
        return null
      }

      return data as any
    } catch (error) {
      console.error("Error in getProductById:", error)
      return null
    }
  }

  // Buscar produtos por categoria
  static async getProductsByCategory(category: string): Promise<ProductWithImages[]> {
    try {
      if (category === "todos") {
        return await this.getAllProducts()
      }

      const { data: products, error } = await supabase
        .from("products")
        .select(`
          *,
          images:product_images(*)
        `)
        .eq("category", category)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching products by category:", error)
        return []
      }

      return (products as any) || []
    } catch (error) {
      console.error("Error in getProductsByCategory:", error)
      return []
    }
  }

  // Buscar produtos em destaque
  static async getFeaturedProducts(): Promise<ProductWithImages[]> {
    try {
      const { data: products, error } = await supabase
        .from("products")
        .select(`
          *,
          images:product_images(*)
        `)
        .eq("featured", true)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching featured products:", error)
        return []
      }

      return (products as any) || []
    } catch (error) {
      console.error("Error in getFeaturedProducts:", error)
      return []
    }
  }

  // Atualizar produto
  static async updateProduct(
    id: number,
    data: Partial<ProductInsert>,
    newImageFiles?: File[],
  ): Promise<ProductWithImages | null> {
    try {
      // 1. Atualizar dados do produto
      const { error: updateError } = await supabase.from("products").update(data).eq("id", id)

      if (updateError) {
        console.error("Error updating product:", updateError)
        throw new Error("Falha ao atualizar produto")
      }

      // 2. Adicionar novas imagens se houver
      if (newImageFiles && newImageFiles.length > 0) {
        // Buscar ordem atual máxima
        const { data: existingImages } = await supabase
          .from("product_images")
          .select("display_order")
          .eq("product_id", id)
          .order("display_order", { ascending: false })
          .limit(1)

        const maxOrder = existingImages?.[0]?.display_order ?? -1

        const imageUrls: { url: string; order: number }[] = []

        for (let i = 0; i < newImageFiles.length; i++) {
          const file = newImageFiles[i]
          const fileExt = file.name.split(".").pop()
          const fileName = `${id}-${Date.now()}-${i}.${fileExt}`
          const filePath = `products/${fileName}`

          const { error: uploadError } = await supabase.storage.from("product-images").upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
          })

          if (uploadError) {
            console.error("Error uploading image:", uploadError)
            continue
          }

          const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(filePath)

          imageUrls.push({ url: urlData.publicUrl, order: maxOrder + i + 1 })
        }

        if (imageUrls.length > 0) {
          await supabase.from("product_images").insert(
            imageUrls.map(({ url, order }) => ({
              product_id: id,
              image_url: url,
              display_order: order,
            })),
          )
        }
      }

      // 3. Retornar produto atualizado
      return await this.getProductById(id)
    } catch (error) {
      console.error("Error in updateProduct:", error)
      throw error
    }
  }

  // Deletar produto
  static async deleteProduct(id: number): Promise<void> {
    try {
      console.log("[deleteProduct] Starting delete for ID:", id)

      // 1. Buscar imagens para deletar do storage
      const { data: images, error: imagesError } = await supabase.from("product_images").select("image_url").eq("product_id", id)
      console.log("[deleteProduct] Found images:", images?.length || 0, "Error:", imagesError)

      // 2. Deletar imagens do storage
      if (images && images.length > 0) {
        for (const image of images) {
          const path = image.image_url.split("/product-images/")[1]
          if (path) {
            const { error: storageError } = await supabase.storage.from("product-images").remove([path])
            console.log("[deleteProduct] Deleted storage image:", path, "Error:", storageError)
          }
        }
      }

      // 3. Deletar registros de product_images primeiro
      const { error: imageDeleteError } = await supabase.from("product_images").delete().eq("product_id", id)
      console.log("[deleteProduct] Deleted product_images. Error:", imageDeleteError)

      // 4. Deletar produto
      const { error, data } = await supabase.from("products").delete().eq("id", id).select()
      console.log("[deleteProduct] Delete result. Data:", data, "Error:", error)

      if (error) {
        console.error("[deleteProduct] Error deleting product:", error)
        throw new Error("Falha ao deletar produto: " + error.message)
      }

      console.log("[deleteProduct] Successfully deleted product ID:", id)
    } catch (error) {
      console.error("[deleteProduct] Error in deleteProduct:", error)
      throw error
    }
  }

  // Deletar imagem específica
  static async deleteProductImage(imageId: number, imageUrl: string): Promise<void> {
    try {
      // 1. Deletar do storage
      const path = imageUrl.split("/product-images/")[1]
      if (path) {
        await supabase.storage.from("product-images").remove([path])
      }

      // 2. Deletar referência do banco
      const { error } = await supabase.from("product_images").delete().eq("id", imageId)

      if (error) {
        console.error("Error deleting image:", error)
        throw new Error("Falha ao deletar imagem")
      }
    } catch (error) {
      console.error("Error in deleteProductImage:", error)
      throw error
    }
  }

  // Reordenar imagens
  static async reorderImages(productId: number, imageOrders: { id: number; order: number }[]): Promise<void> {
    try {
      for (const { id, order } of imageOrders) {
        await supabase.from("product_images").update({ display_order: order }).eq("id", id).eq("product_id", productId)
      }
    } catch (error) {
      console.error("Error in reorderImages:", error)
      throw error
    }
  }

  // Buscar estatísticas
  static async getStats() {
    try {
      const { count: totalProducts } = await supabase.from("products").select("*", { count: "exact", head: true })

      const { count: featuredCount } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("featured", true)

      const { data: categories } = await supabase.from("products").select("category")

      const uniqueCategories = new Set(categories?.map((p) => p.category) || [])

      return {
        totalProducts: totalProducts || 0,
        featuredProducts: featuredCount || 0,
        categories: uniqueCategories.size,
      }
    } catch (error) {
      console.error("Error getting stats:", error)
      return {
        totalProducts: 0,
        featuredProducts: 0,
        categories: 0,
      }
    }
  }
}
