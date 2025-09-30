import { put, del, list } from "@vercel/blob"

export interface UploadResult {
  url: string
  pathname: string
  contentType: string
  contentDisposition: string
}

export interface StoredImage {
  url: string
  pathname: string
  size: number
  uploadedAt: string
  contentType: string
}

export class StorageService {
  // Verificar se o Blob está configurado
  static isBlobConfigured(): boolean {
    return typeof process !== "undefined" && !!process.env.BLOB_READ_WRITE_TOKEN
  }

  // Upload para Vercel Blob ou fallback para base64
  static async uploadImage(file: File, folder = "products"): Promise<UploadResult> {
    try {
      // Validar arquivo primeiro
      const validation = this.validateImageFile(file)
      if (!validation.valid) {
        throw new Error(validation.error)
      }

      // Verificar se Blob está configurado
      if (!this.isBlobConfigured()) {
        console.warn("Vercel Blob not configured, using localStorage fallback")
        return await this.uploadToLocalStorage(file, folder)
      }

      // Upload real para Vercel Blob
      const filename = `${folder}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`

      const blob = await put(filename, file, {
        access: "public",
        contentType: file.type,
        token: process.env.BLOB_READ_WRITE_TOKEN,
      })

      return {
        url: blob.url,
        pathname: blob.pathname,
        contentType: file.type,
        contentDisposition: `inline; filename="${file.name}"`,
      }
    } catch (error) {
      console.error("Error uploading to Blob, falling back to localStorage:", error)
      return await this.uploadToLocalStorage(file, folder)
    }
  }

  // Fallback: Upload para localStorage como base64
  private static async uploadToLocalStorage(file: File, folder = "products"): Promise<UploadResult> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = (e) => {
        try {
          const base64 = e.target?.result as string
          const pathname = `${folder}/${Date.now()}-${file.name}`

          // Salvar metadados no localStorage
          const storageKey = "atelier-storage-files"
          const existingFiles = JSON.parse(localStorage.getItem(storageKey) || "[]")

          const fileData: StoredImage = {
            url: base64,
            pathname,
            size: file.size,
            uploadedAt: new Date().toISOString(),
            contentType: file.type,
          }

          existingFiles.push(fileData)
          localStorage.setItem(storageKey, JSON.stringify(existingFiles))

          resolve({
            url: base64,
            pathname,
            contentType: file.type,
            contentDisposition: `inline; filename="${file.name}"`,
          })
        } catch (error) {
          reject(error)
        }
      }

      reader.onerror = () => reject(new Error("Failed to read file"))
      reader.readAsDataURL(file)
    })
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
      // Se for base64 (localStorage), remover do storage
      if (pathname.startsWith("products/") && !pathname.startsWith("http")) {
        const storageKey = "atelier-storage-files"
        const existingFiles = JSON.parse(localStorage.getItem(storageKey) || "[]")
        const filtered = existingFiles.filter((f: StoredImage) => f.pathname !== pathname)
        localStorage.setItem(storageKey, JSON.stringify(filtered))
        return
      }

      // Se for Vercel Blob
      if (this.isBlobConfigured()) {
        await del(pathname, { token: process.env.BLOB_READ_WRITE_TOKEN })
      }
    } catch (error) {
      console.error("Error deleting image:", error)
      // Não lançar erro, continuar
    }
  }

  static async deleteMultipleImages(pathnames: string[]): Promise<void> {
    try {
      const deletePromises = pathnames.map((pathname) => this.deleteImage(pathname))
      await Promise.all(deletePromises)
    } catch (error) {
      console.error("Error deleting multiple images:", error)
    }
  }

  static async listImages(folder = "products"): Promise<StoredImage[]> {
    try {
      // Tentar listar do Vercel Blob
      if (this.isBlobConfigured()) {
        const { blobs } = await list({
          prefix: folder,
          token: process.env.BLOB_READ_WRITE_TOKEN,
        })

        return blobs.map((blob) => ({
          url: blob.url,
          pathname: blob.pathname,
          size: blob.size,
          uploadedAt: blob.uploadedAt,
          contentType: blob.contentType || "image/jpeg",
        }))
      }

      // Fallback: listar do localStorage
      const storageKey = "atelier-storage-files"
      const existingFiles = JSON.parse(localStorage.getItem(storageKey) || "[]")
      return existingFiles.filter((f: StoredImage) => f.pathname.startsWith(folder))
    } catch (error) {
      console.error("Error listing images:", error)
      // Fallback para localStorage
      const storageKey = "atelier-storage-files"
      const existingFiles = JSON.parse(localStorage.getItem(storageKey) || "[]")
      return existingFiles.filter((f: StoredImage) => f.pathname.startsWith(folder))
    }
  }

  static getImageUrl(pathname: string): string {
    return pathname
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
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = (event) => {
        const img = new Image()
        img.src = event.target?.result as string
        img.onload = () => {
          const canvas = document.createElement("canvas")
          const ctx = canvas.getContext("2d")

          // Redimensionar se necessário (máximo 1200px)
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
                reject(new Error("Failed to compress image"))
              }
            },
            "image/jpeg",
            quality,
          )
        }
        img.onerror = () => reject(new Error("Failed to load image"))
      }
      reader.onerror = () => reject(new Error("Failed to read file"))
    })
  }

  static async getStorageStats() {
    try {
      const images = await this.listImages()

      const stats = {
        totalFiles: images.length,
        totalSize: images.reduce((acc, file) => acc + file.size, 0),
        byType: {} as Record<string, number>,
        usingBlob: this.isBlobConfigured(),
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
        usingBlob: this.isBlobConfigured(),
      }
    }
  }

  static clearLocalStorage(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem("atelier-storage-files")
    }
  }
}
