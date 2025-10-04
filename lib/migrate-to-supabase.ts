import { supabase } from "./supabase"
import { products as defaultProducts } from "@/data/products"

export async function migrateLocalStorageToSupabase() {
  try {
    // 1. Verificar se já existem produtos no Supabase
    const { data: existingProducts, error: checkError } = await supabase.from("products").select("id").limit(1)

    if (checkError) {
      console.error("Error checking products:", checkError)
      return { success: false, error: checkError.message }
    }

    // Se já existem produtos, não fazer nada
    if (existingProducts && existingProducts.length > 0) {
      console.log("Products already exist in Supabase")
      return { success: true, message: "Products already migrated" }
    }

    // 2. Tentar carregar do localStorage
    let productsToMigrate = defaultProducts

    try {
      const savedProducts = localStorage.getItem("atelier-products")
      if (savedProducts) {
        const parsed = JSON.parse(savedProducts)
        if (parsed.length > 0) {
          productsToMigrate = parsed
        }
      }
    } catch (error) {
      console.log("No localStorage data, using defaults")
    }

    // 3. Migrar produtos para o Supabase
    for (const product of productsToMigrate) {
      // Inserir produto
      const { data: insertedProduct, error: productError } = await supabase
        .from("products")
        .insert({
          name: product.name,
          description: product.description,
          price: product.price,
          category: product.category,
          featured: product.featured || false,
          material: product.details.material,
          tamanhos: product.details.tamanhos,
          cuidados: product.details.cuidados,
          tempo_producao: product.details.tempo_producao,
        })
        .select()
        .single()

      if (productError) {
        console.error(`Error inserting product ${product.name}:`, productError)
        continue
      }

      // Inserir imagens
      if (insertedProduct && product.images && product.images.length > 0) {
        const imageInserts = product.images.map((imageUrl, index) => ({
          product_id: insertedProduct.id,
          image_url: imageUrl,
          display_order: index,
        }))

        const { error: imagesError } = await supabase.from("product_images").insert(imageInserts)

        if (imagesError) {
          console.error(`Error inserting images for ${product.name}:`, imagesError)
        }
      }
    }

    console.log("Migration completed successfully")
    return { success: true, message: "Migration completed" }
  } catch (error) {
    console.error("Migration error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}
