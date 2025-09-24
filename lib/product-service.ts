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
  private static products: Product[] = []
  private static nextId = 1

  static async createProduct(data: CreateProductData, imageFiles: File[]): Promise<Product> {
    try {
      // Upload das imagens
      const uploadedImages = await StorageService.uploadMultipleImages(imageFiles, "products")

      const product: Product = {
        id: this.nextId++,
        name: data.name,
        description: data.description,
        price: data.price,
        category: data.category,
        images: uploadedImages.map((img) => img.url),
        details: data.details,
        featured: data.featured || false,
      }

      this.products.push(product)
      await this.saveToStorage()

      return product
    } catch (error) {
      console.error("Error creating product:", error)
      throw new Error("Failed to create product")
    }
  }

  static async updateProduct(data: UpdateProductData, newImageFiles?: File[]): Promise<Product> {
    try {
      const productIndex = this.products.findIndex((p) => p.id === data.id)
      if (productIndex === -1) {
        throw new Error("Product not found")
      }

      const existingProduct = this.products[productIndex]
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

      this.products[productIndex] = updatedProduct
      await this.saveToStorage()

      return updatedProduct
    } catch (error) {
      console.error("Error updating product:", error)
      throw new Error("Failed to update product")
    }
  }

  static async deleteProduct(id: number): Promise<void> {
    try {
      const productIndex = this.products.findIndex((p) => p.id === id)
      if (productIndex === -1) {
        throw new Error("Product not found")
      }

      const product = this.products[productIndex]

      // Deletar imagens do storage
      const pathnames = product.images.map((url) => {
        const urlParts = url.split("/")
        return urlParts[urlParts.length - 1]
      })

      await StorageService.deleteMultipleImages(pathnames)

      // Remover produto da lista
      this.products.splice(productIndex, 1)
      await this.saveToStorage()
    } catch (error) {
      console.error("Error deleting product:", error)
      throw new Error("Failed to delete product")
    }
  }

  static async removeProductImage(productId: number, imageUrl: string): Promise<Product> {
    try {
      const productIndex = this.products.findIndex((p) => p.id === productId)
      if (productIndex === -1) {
        throw new Error("Product not found")
      }

      const product = this.products[productIndex]
      const imageIndex = product.images.indexOf(imageUrl)

      if (imageIndex === -1) {
        throw new Error("Image not found")
      }

      // Deletar imagem do storage
      const urlParts = imageUrl.split("/")
      const pathname = urlParts[urlParts.length - 1]
      await StorageService.deleteImage(pathname)

      // Remover URL da lista de imagens
      product.images.splice(imageIndex, 1)

      this.products[productIndex] = product
      await this.saveToStorage()

      return product
    } catch (error) {
      console.error("Error removing product image:", error)
      throw new Error("Failed to remove image")
    }
  }

  static getAllProducts(): Product[] {
    return [...this.products]
  }

  static getProductById(id: number): Product | undefined {
    return this.products.find((p) => p.id === id)
  }

  static getProductsByCategory(category: string): Product[] {
    if (category === "todos") return this.products
    return this.products.filter((p) => p.category === category)
  }

  static getFeaturedProducts(): Product[] {
    return this.products.filter((p) => p.featured)
  }

  private static async saveToStorage(): Promise<void> {
    try {
      // Em um ambiente real, você salvaria no banco de dados
      // Por enquanto, vamos usar localStorage no cliente
      if (typeof window !== "undefined") {
        localStorage.setItem("atelier-products", JSON.stringify(this.products))
        localStorage.setItem("atelier-next-id", this.nextId.toString())
      }
    } catch (error) {
      console.error("Error saving to storage:", error)
    }
  }

  private static loadFromStorage(): void {
    try {
      if (typeof window !== "undefined") {
        const savedProducts = localStorage.getItem("atelier-products")
        const savedNextId = localStorage.getItem("atelier-next-id")

        if (savedProducts) {
          this.products = JSON.parse(savedProducts)
        }

        if (savedNextId) {
          this.nextId = Number.parseInt(savedNextId)
        }
      }
    } catch (error) {
      console.error("Error loading from storage:", error)
    }
  }

  static initialize(): void {
    this.loadFromStorage()
  }
}
