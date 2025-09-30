import { put, del, list } from "@vercel/blob"

export interface UploadResult {
  url: string
  pathname: string
  contentType: string
  contentDisposition: string
}

export class StorageService {
  static async uploadImage(file: File, folder = "products"): Promise<UploadResult> {
    try {
      const filename = `${folder}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`

      // Upload real para Vercel Blob
      const blob = await put(filename, file, {
        access: "public",
        contentType: file.type,
      })

      return {
        url: blob.url,
        pathname: blob.pathname,
        contentType: file.type,
        contentDisposition: `inline; filename="${file.name}"`,
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
      await del(pathname)
    } catch (error) {
      console.error("Error deleting image:", error)
      throw new Error("Failed to delete image")
    }
  }

  static async deleteMultipleImages(pathnames: string[]): Promise<void> {
    try {
      const deletePromises = pathnames.map((pathname) => del(pathname))
      await Promise.all(deletePromises)
    } catch (error) {
      console.error("Error deleting multiple images:", error)
      throw new Error("Failed to delete images")
    }
  }

  static async listImages(folder = "products") {
    try {
      const { blobs } = await list({
        prefix: folder,
      })

      return blobs.map((blob) => ({
        url: blob.url,
        pathname: blob.pathname,
        size: blob.size,
        uploadedAt: blob.uploadedAt,
        contentType: blob.contentType || "image/jpeg",
      }))
    } catch (error) {
      console.error("Error listing images:", error)
      return []
    }
  }

  static getImageUrl(pathname: string): string {
    // Em produção com Blob, a URL já está completa
    // Este método é mantido por compatibilidade
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

  // Método para obter estatísticas
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
}
