export interface UploadResult {
  url: string
  pathname: string
  contentType: string
}

export interface StoredImage {
  url: string
  pathname: string
  size: number
  uploadedAt: string
  contentType: string
}

export class StorageService {
  private static readonly STORAGE_KEY = "atelier-storage-files"

  // Upload de imagem para localStorage
  static async uploadImage(file: File, folder = "products"): Promise<UploadResult> {
    try {
      // Validar arquivo
      const validation = this.validateImageFile(file)
      if (!validation.valid) {
        throw new Error(validation.error)
      }

      // Comprimir imagem
      const compressedFile = await this.compressImage(file, 0.85)

      // Converter para base64
      const base64 = await this.fileToBase64(compressedFile)
      const pathname = `${folder}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`

      // Salvar no localStorage
      const fileData: StoredImage = {
        url: base64,
        pathname,
        size: compressedFile.size,
        uploadedAt: new Date().toISOString(),
        contentType: compressedFile.type,
      }

      const existingFiles = this.getAllFiles()
      existingFiles.push(fileData)
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(existingFiles))

      return {
        url: base64,
        pathname,
        contentType: compressedFile.type,
      }
    } catch (error) {
      console.error("Error uploading image:", error)
      throw new Error("Falha ao fazer upload da imagem")
    }
  }

  // Converter File para base64
  private static fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = () => reject(new Error("Erro ao ler arquivo"))
      reader.readAsDataURL(file)
    })
  }

  // Upload múltiplo
  static async uploadMultipleImages(files: File[], folder = "products"): Promise<UploadResult[]> {
    const results: UploadResult[] = []

    for (const file of files) {
      const result = await this.uploadImage(file, folder)
      results.push(result)
    }

    return results
  }

  // Deletar imagem
  static async deleteImage(pathname: string): Promise<void> {
    try {
      const existingFiles = this.getAllFiles()
      const filtered = existingFiles.filter((f) => f.pathname !== pathname)
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered))
    } catch (error) {
      console.error("Error deleting image:", error)
    }
  }

  // Deletar múltiplas
  static async deleteMultipleImages(pathnames: string[]): Promise<void> {
    try {
      const existingFiles = this.getAllFiles()
      const filtered = existingFiles.filter((f) => !pathnames.includes(f.pathname))
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered))
    } catch (error) {
      console.error("Error deleting images:", error)
    }
  }

  // Listar imagens
  static async listImages(folder = "products"): Promise<StoredImage[]> {
    try {
      const allFiles = this.getAllFiles()
      return allFiles.filter((f) => f.pathname.startsWith(folder))
    } catch (error) {
      console.error("Error listing images:", error)
      return []
    }
  }

  // Obter todas as imagens
  private static getAllFiles(): StoredImage[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY)
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error("Error getting files:", error)
      return []
    }
  }

  // Validar arquivo
  static validateImageFile(file: File): { valid: boolean; error?: string } {
    const maxSize = 5 * 1024 * 1024 // 5MB
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: "Tipo de arquivo não suportado. Use JPEG, PNG ou WebP.",
      }
    }

    if (file.size > maxSize) {
      return {
        valid: false,
        error: "Arquivo muito grande. Máximo 5MB.",
      }
    }

    return { valid: true }
  }

  // Comprimir imagem
  static async compressImage(file: File, quality = 0.8): Promise<File> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = (event) => {
        const img = new Image()
        img.src = event.target?.result as string
        img.onload = () => {
          const canvas = document.createElement("canvas")
          const ctx = canvas.getContext("2d")

          let width = img.width
          let height = img.height
          const maxDimension = 1200

          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = (height * maxDimension) / width
              width = maxDimension
            } else {
              width = (width * maxDimension) / height
              height = maxDimension
            }
          }

          canvas.width = width
          canvas.height = height
          ctx?.drawImage(img, 0, 0, width, height)

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name, {
                  type: "image/jpeg",
                  lastModified: Date.now(),
                })
                resolve(compressedFile)
              } else {
                reject(new Error("Falha ao comprimir imagem"))
              }
            },
            "image/jpeg",
            quality,
          )
        }
        img.onerror = () => reject(new Error("Falha ao carregar imagem"))
      }
      reader.onerror = () => reject(new Error("Falha ao ler arquivo"))
    })
  }

  // Obter estatísticas
  static async getStorageStats() {
    try {
      const images = await this.listImages()

      const stats = {
        totalFiles: images.length,
        totalSize: images.reduce((acc, file) => acc + file.size, 0),
        byType: {} as Record<string, number>,
      }

      images.forEach((file) => {
        const type = file.contentType.split("/")[1] || "unknown"
        stats.byType[type] = (stats.byType[type] || 0) + 1
      })

      return stats
    } catch (error) {
      console.error("Error getting stats:", error)
      return {
        totalFiles: 0,
        totalSize: 0,
        byType: {},
      }
    }
  }

  // Limpar storage
  static clearStorage(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(this.STORAGE_KEY)
    }
  }
}
