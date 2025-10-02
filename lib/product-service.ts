import { FileStorageService } from "./file-storage"
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

export class ProductService {
  private static readonly PRODUCTS_KEY = "atelier-products"
  private static readonly NEXT_ID_KEY = "atelier-next-product-id"

  static async createProduct(data: CreateProductData, imageFiles: File[]): Promise<Product> {
    try {
      // Salvar arquivos de imagem
      const savedFiles = await FileStorageService.saveMultipleFiles(imageFiles)
      const imageUrls = savedFiles.map((f) => f.url)

      // Criar produto
      const product: Product = {
        id: this.getNextId(),
        name: data.name,
        description: data.description,
        price: data.price,
        category: data.category,
        images: imageUrls,
        details: data.details,
        featured: data.featured || false,
      }

      // Salvar produto
      this.saveProduct(product)

      // Disparar evento customizado para notificar outros componentes
      this.notifyProductChange()

      return product
    } catch (error) {
      console.error("Error creating product:", error)
      throw new Error("Falha ao criar produto")
    }
  }

  static async updateProduct(
    productId: number,
    data: Partial<CreateProductData>,
    newImageFiles?: File[],
  ): Promise<Product> {
    try {
      const products = this.getAllProducts()
      const productIndex = products.findIndex((p) => p.id === productId)

      if (productIndex === -1) {
        throw new Error("Produto não encontrado")
      }

      let images = products[productIndex].images

      // Se há novas imagens, salvar
      if (newImageFiles && newImageFiles.length > 0) {
        const savedFiles = await FileStorageService.saveMultipleFiles(newImageFiles)
        const newUrls = savedFiles.map((f) => f.url)
        images = [...images, ...newUrls]
      }

      // Atualizar produto
      const updatedProduct: Product = {
        ...products[productIndex],
        ...data,
        images,
      }

      products[productIndex] = updatedProduct
      this.saveAllProducts(products)

      // Notificar mudança
      this.notifyProductChange()

      return updatedProduct
    } catch (error) {
      console.error("Error updating product:", error)
      throw new Error("Falha ao atualizar produto")
    }
  }

  static deleteProduct(productId: number): void {
    try {
      const products = this.getAllProducts()
      const filteredProducts = products.filter((p) => p.id !== productId)
      this.saveAllProducts(filteredProducts)

      // Notificar mudança
      this.notifyProductChange()
    } catch (error) {
      console.error("Error deleting product:", error)
      throw new Error("Falha ao deletar produto")
    }
  }

  static getAllProducts(): Product[] {
    if (typeof window === "undefined") return []

    try {
      const stored = localStorage.getItem(this.PRODUCTS_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error("Error loading products:", error)
      return []
    }
  }

  static getProductById(id: number): Product | undefined {
    return this.getAllProducts().find((p) => p.id === id)
  }

  static getProductsByCategory(category: string): Product[] {
    const products = this.getAllProducts()
    return category === "todos" ? products : products.filter((p) => p.category === category)
  }

  static getFeaturedProducts(): Product[] {
    return this.getAllProducts().filter((p) => p.featured)
  }

  private static saveProduct(product: Product): void {
    const products = this.getAllProducts()
    products.push(product)
    this.saveAllProducts(products)
  }

  private static saveAllProducts(products: Product[]): void {
    if (typeof window === "undefined") return

    try {
      localStorage.setItem(this.PRODUCTS_KEY, JSON.stringify(products))
    } catch (error) {
      console.error("Error saving products:", error)
    }
  }

  private static getNextId(): number {
    if (typeof window === "undefined") return 1

    try {
      const stored = localStorage.getItem(this.NEXT_ID_KEY)
      const nextId = stored ? Number.parseInt(stored) : 1
      localStorage.setItem(this.NEXT_ID_KEY, (nextId + 1).toString())
      return nextId
    } catch (error) {
      console.error("Error getting next ID:", error)
      return Date.now()
    }
  }

  // Notificar mudanças para componentes React
  private static notifyProductChange(): void {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("productsChanged"))
    }
  }

  static clearAllData(): void {
    if (typeof window === "undefined") return
    localStorage.removeItem(this.PRODUCTS_KEY)
    localStorage.removeItem(this.NEXT_ID_KEY)
    FileStorageService.clearAll()
  }
}
