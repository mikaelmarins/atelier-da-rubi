// Sistema de armazenamento de arquivos na pasta public
export interface SavedFile {
  id: string
  filename: string
  path: string
  url: string
  size: number
  type: string
  uploadedAt: string
}

export class FileStorageService {
  private static readonly STORAGE_KEY = "atelier-file-registry"
  private static readonly BASE_PATH = "/uploads"

  // Simular salvamento de arquivo (em produção, seria uma API real)
  static async saveFile(file: File): Promise<SavedFile> {
    try {
      // Gerar ID único
      const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const extension = file.name.split(".").pop()
      const filename = `${id}.${extension}`
      const path = `${this.BASE_PATH}/${filename}`

      // Converter para base64 para salvar no localStorage temporariamente
      const base64 = await this.fileToBase64(file)

      const savedFile: SavedFile = {
        id,
        filename,
        path,
        url: base64, // Em produção, seria o path real
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString(),
      }

      // Salvar registro no localStorage
      const registry = this.getRegistry()
      registry[id] = savedFile
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(registry))

      return savedFile
    } catch (error) {
      console.error("Error saving file:", error)
      throw new Error("Falha ao salvar arquivo")
    }
  }

  static async saveMultipleFiles(files: File[]): Promise<SavedFile[]> {
    const savedFiles: SavedFile[] = []
    for (const file of files) {
      const saved = await this.saveFile(file)
      savedFiles.push(saved)
    }
    return savedFiles
  }

  static getFileById(id: string): SavedFile | null {
    const registry = this.getRegistry()
    return registry[id] || null
  }

  static deleteFile(id: string): void {
    const registry = this.getRegistry()
    delete registry[id]
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(registry))
  }

  static getAllFiles(): SavedFile[] {
    const registry = this.getRegistry()
    return Object.values(registry)
  }

  private static getRegistry(): Record<string, SavedFile> {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY)
      return data ? JSON.parse(data) : {}
    } catch {
      return {}
    }
  }

  private static fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  static clearAll(): void {
    localStorage.removeItem(this.STORAGE_KEY)
  }
}
