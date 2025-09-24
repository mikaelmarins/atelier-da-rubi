// Sistema de Storage Offline Simplificado
interface StorageFile {
  url: string
  pathname: string
  size: number
  uploadedAt: string
  contentType: string
}

export interface UploadResult {
  url: string
  pathname: string
  contentType: string
  contentDisposition: string
}

export class StorageService {
  private static storageKey = "atelier-storage-files"

  static async uploadImage(file: File, folder = "products"): Promise<UploadResult> {
    try {
      const filename = `${folder}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`

      // Criar URL do placeholder baseado no nome do arquivo
      const mockUrl = `/placeholder.svg?height=400&width=400&text=${encodeURIComponent(file.name.split(".")[0])}`

      const storageFile: StorageFile = {
        url: mockUrl,
        pathname: filename,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        contentType: file.type,
      }

      // Salvar no localStorage
      this.saveFile(storageFile)

      return {
        url: mockUrl,
        pathname: filename,
        contentType: file.type,
        contentDisposition: "",
      }
    } catch (error) {
      console.error("Error uploading image:", error)
      throw new Error("Failed to upload image")
    }
  }

  static async uploadMultipleImages(files: File[], folder = "products"): Promise<UploadResult[]> {
    try {
      const uploadPromises = files.map((file) => this.uploadImage(file, folder))
      return await Promise.all(uploadPromises)
    } catch (error) {
      console.error("Error uploading multiple images:", error)
      throw new Error("Failed to upload images")
    }
  }

  static async deleteImage(pathname: string): Promise<void> {
    try {
      const files = this.getAllFiles()
      const updatedFiles = files.filter((file) => file.pathname !== pathname)
      this.saveAllFiles(updatedFiles)
    } catch (error) {
      console.error("Error deleting image:", error)
      throw new Error("Failed to delete image")
    }
  }

  static async deleteMultipleImages(pathnames: string[]): Promise<void> {
    try {
      const files = this.getAllFiles()
      const updatedFiles = files.filter((file) => !pathnames.includes(file.pathname))
      this.saveAllFiles(updatedFiles)
    } catch (error) {
      console.error("Error deleting multiple images:", error)
      throw new Error("Failed to delete images")
    }
  }

  static async listImages(folder = "products"): Promise<StorageFile[]> {
    try {
      const files = this.getAllFiles()
      return files.filter((file) => file.pathname.startsWith(folder))
    } catch (error) {
      console.error("Error listing images:", error)
      throw new Error("Failed to list images")
    }
  }

  static getImageUrl(pathname: string): string {
    const files = this.getAllFiles()
    const file = files.find((f) => f.pathname === pathname)
    return file?.url || `/placeholder.svg?height=400&width=400&text=${encodeURIComponent(pathname)}`
  }

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

  static async compressImage(file: File, quality = 0.8): Promise<File> {
    // Em um sistema offline, retornamos o arquivo original
    // Em produção, aqui seria implementada a compressão real
    return file
  }

  // Métodos privados para gerenciar localStorage
  private static getAllFiles(): StorageFile[] {
    if (typeof window === "undefined") return []

    try {
      const stored = localStorage.getItem(this.storageKey)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error("Error loading files from storage:", error)
      return []
    }
  }

  private static saveFile(file: StorageFile): void {
    if (typeof window === "undefined") return

    try {
      const files = this.getAllFiles()
      files.push(file)
      localStorage.setItem(this.storageKey, JSON.stringify(files))
    } catch (error) {
      console.error("Error saving file to storage:", error)
    }
  }

  private static saveAllFiles(files: StorageFile[]): void {
    if (typeof window === "undefined") return

    try {
      localStorage.setItem(this.storageKey, JSON.stringify(files))
    } catch (error) {
      console.error("Error saving files to storage:", error)
    }
  }

  // Método para limpar o storage (útil para desenvolvimento)
  static clearStorage(): void {
    if (typeof window === "undefined") return
    localStorage.removeItem(this.storageKey)
  }

  // Método para obter estatísticas do storage
  static getStorageStats(): { totalFiles: number; totalSize: number; byType: Record<string, number> } {
    const files = this.getAllFiles()

    const stats = {
      totalFiles: files.length,
      totalSize: files.reduce((acc, file) => acc + file.size, 0),
      byType: {} as Record<string, number>,
    }

    files.forEach((file) => {
      const type = file.contentType.split("/")[1] || "unknown"
      stats.byType[type] = (stats.byType[type] || 0) + 1
    })

    return stats
  }
}
