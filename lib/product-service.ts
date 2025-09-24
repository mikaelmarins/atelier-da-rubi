import { StorageService } from "./storage"
import type { Product } from "@/data/products"

export interface CreateProductData {
  name: string
  description: string
  price: string
  category: string
  details: {
    material: string
    tamanhos: string[]
    cuidados: string
    tempo_producao: string
  }
  featured?: boolean
}

export interface UpdateProductData extends Partial<CreateProductData> {
  id: number
}

export class ProductService {
  private static productsKey = "atelier-products"
  private static nextIdKey = "atelier-next-id"

  static async createProduct(data: CreateProductData, imageFiles: File[]): Promise<Product> {
    try {
      // Upload das imagens
      const uploadedImages = await StorageService.uploadMultipleImages(imageFiles, "products")

      const product: Product = {
        id: this.getNextId(),
        name: data.name,
        description: data.description,
        price: data.price,
        category: data.category,
        images: uploadedImages.map((img) => img.url),
        details: data.details,
        featured: data.featured || false,
      }

      this.saveProduct(product)
      return product
    } catch (error) {
      console.error("Error creating product:", error)
      throw new Error("Failed to create product")
    }
  }

  static async updateProduct(data: UpdateProductData, newImageFiles?: File[]): Promise<Product> {
    try {
      const products = this.getAllProducts()
      const productIndex = products.findIndex((p) => p.id === data.id)

      if (productIndex === -1) {
        throw new Error("Product not found")
      }

      const existingProduct = products[productIndex]
      let images = existingProduct.images

      // Se há novas imagens, fazer upload
      if (newImageFiles && newImageFiles.length > 0) {
        const uploadedImages = await StorageService.uploadMultipleImages(newImageFiles, "products")
        images = [...images, ...uploadedImages.map((img) => img.url)]
      }

      const updatedProduct: Product = {
        ...existingProduct,
        ...data,
        images,
      }

      products[productIndex] = updatedProduct
      this.saveAllProducts(products)

      return updatedProduct
    } catch (error) {
      console.error("Error updating product:", error)
      throw new Error("Failed to update product")
    }
  }

  static async deleteProduct(id: number): Promise<void> {
    try {
      const products = this.getAllProducts()
      const productIndex = products.findIndex((p) => p.id === id)

      if (productIndex === -1) {
        throw new Error("Product not found")
      }

      const product = products[productIndex]

      // Deletar imagens do storage
      const pathnames = product.images.map((url) => {
        // Extrair pathname da URL do placeholder
        const urlParts = url.split("text=")
        if (urlParts.length > 1) {
          return `products/${Date.now()}-${decodeURIComponent(urlParts[1])}`
        }
        return `products/unknown-${Date.now()}`
      })

      await StorageService.deleteMultipleImages(pathnames)

      // Remover produto da lista
      products.splice(productIndex, 1)
      this.saveAllProducts(products)
    } catch (error) {
      console.error("Error deleting product:", error)
      throw new Error("Failed to delete product")
    }
  }

  static async removeProductImage(productId: number, imageUrl: string): Promise<Product> {
    try {
      const products = this.getAllProducts()
      const productIndex = products.findIndex((p) => p.id === productId)

      if (productIndex === -1) {
        throw new Error("Product not found")
      }

      const product = products[productIndex]
      const imageIndex = product.images.indexOf(imageUrl)

      if (imageIndex === -1) {
        throw new Error("Image not found")
      }

      // Deletar imagem do storage
      const urlParts = imageUrl.split("text=")
      if (urlParts.length > 1) {
        const pathname = `products/${Date.now()}-${decodeURIComponent(urlParts[1])}`
        await StorageService.deleteImage(pathname)
      }

      // Remover URL da lista de imagens
      product.images.splice(imageIndex, 1)
      products[productIndex] = product
      this.saveAllProducts(products)

      return product
    } catch (error) {
      console.error("Error removing product image:", error)
      throw new Error("Failed to remove image")
    }
  }

  static getAllProducts(): Product[] {
    if (typeof window === "undefined") return []

    try {
      const stored = localStorage.getItem(this.productsKey)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error("Error loading products:", error)
      return []
    }
  }

  static getProductById(id: number): Product | undefined {
    const products = this.getAllProducts()
    return products.find((p) => p.id === id)
  }

  static getProductsByCategory(category: string): Product[] {
    const products = this.getAllProducts()
    if (category === "todos") return products
    return products.filter((p) => p.category === category)
  }

  static getFeaturedProducts(): Product[] {
    const products = this.getAllProducts()
    return products.filter((p) => p.featured)
  }

  private static saveProduct(product: Product): void {
    const products = this.getAllProducts()
    products.push(product)
    this.saveAllProducts(products)
  }

  private static saveAllProducts(products: Product[]): void {
    if (typeof window === "undefined") return

    try {
      localStorage.setItem(this.productsKey, JSON.stringify(products))
    } catch (error) {
      console.error("Error saving products:", error)
    }
  }

  private static getNextId(): number {
    if (typeof window === "undefined") return 1

    try {
      const stored = localStorage.getItem(this.nextIdKey)
      const nextId = stored ? Number.parseInt(stored) : 1
      localStorage.setItem(this.nextIdKey, (nextId + 1).toString())
      return nextId
    } catch (error) {
      console.error("Error getting next ID:", error)
      return Date.now() // Fallback para timestamp
    }
  }

  static initialize(): void {
    // Método para inicializar o serviço se necessário
    // Por enquanto não precisa fazer nada
  }

  // Método para limpar todos os dados (útil para desenvolvimento)
  static clearAllData(): void {
    if (typeof window === "undefined") return

    localStorage.removeItem(this.productsKey)
    localStorage.removeItem(this.nextIdKey)
    StorageService.clearStorage()
  }

  // Método para obter estatísticas
  static getStats(): { totalProducts: number; featuredProducts: number; categories: number } {
    const products = this.getAllProducts()

    return {
      totalProducts: products.length,
      featuredProducts: products.filter((p) => p.featured).length,
      categories: new Set(products.map((p) => p.category)).size,
    }
  }
}
