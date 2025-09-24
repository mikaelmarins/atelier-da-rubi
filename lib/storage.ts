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

      const blob = await put(filename, file, {
        access: "public",
        contentType: file.type,
      })

      return {
        url: blob.url,
        pathname: blob.pathname,
        contentType: blob.contentType || file.type,
        contentDisposition: blob.contentDisposition || "",
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
      const deletePromises = pathnames.map((pathname) => this.deleteImage(pathname))
      await Promise.all(deletePromises)
    } catch (error) {
      console.error("Error deleting multiple images:", error)
      throw new Error("Failed to delete images")
    }
  }

  static async listImages(folder = "products"): Promise<any[]> {
    try {
      const { blobs } = await list({
        prefix: folder,
        limit: 1000,
      })
      return blobs
    } catch (error) {
      console.error("Error listing images:", error)
      throw new Error("Failed to list images")
    }
  }

  static getImageUrl(pathname: string): string {
    return `https://blob.vercel-storage.com/${pathname}`
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
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      const img = new Image()

      img.onload = () => {
        const maxWidth = 1200
        const maxHeight = 1200

        let { width, height } = img

        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width
            width = maxWidth
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height
            height = maxHeight
          }
        }

        canvas.width = width
        canvas.height = height

        ctx?.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              })
              resolve(compressedFile)
            } else {
              resolve(file)
            }
          },
          file.type,
          quality,
        )
      }

      img.src = URL.createObjectURL(file)
    })
  }
}
