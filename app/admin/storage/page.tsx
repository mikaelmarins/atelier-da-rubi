"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Upload, Trash2, Eye, Download, Search, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StorageService } from "@/lib/storage"
import Image from "next/image"
import Link from "next/link"

interface StorageFile {
  url: string
  pathname: string
  size: number
  uploadedAt: string
  contentType: string
}

export default function StoragePage() {
  const [files, setFiles] = useState<StorageFile[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")

  useEffect(() => {
    loadFiles()
  }, [])

  const loadFiles = async () => {
    try {
      const blobs = await StorageService.listImages()
      const formattedFiles = blobs.map((blob) => ({
        url: blob.url,
        pathname: blob.pathname,
        size: blob.size,
        uploadedAt: blob.uploadedAt,
        contentType: blob.contentType || "image/jpeg",
      }))
      setFiles(formattedFiles)
    } catch (error) {
      console.error("Error loading files:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files
    if (!selectedFiles || selectedFiles.length === 0) return

    setUploading(true)

    try {
      const fileArray = Array.from(selectedFiles)
      await StorageService.uploadMultipleImages(fileArray)
      await loadFiles()
      alert("Imagens enviadas com sucesso!")
    } catch (error) {
      console.error("Error uploading files:", error)
      alert("Erro ao enviar imagens")
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteFile = async (pathname: string) => {
    if (!confirm("Tem certeza que deseja deletar esta imagem?")) return

    try {
      await StorageService.deleteImage(pathname)
      await loadFiles()
      alert("Imagem deletada com sucesso!")
    } catch (error) {
      console.error("Error deleting file:", error)
      alert("Erro ao deletar imagem")
    }
  }

  const filteredFiles = files.filter((file) => {
    const matchesSearch = file.pathname.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === "all" || file.contentType.includes(filterType)
    return matchesSearch && matchesType
  })

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center pt-24">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando arquivos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 pt-24">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-dancing font-bold text-gray-800">Gerenciar Imagens</h1>
            <p className="text-gray-600">Gerencie todas as imagens do site</p>
          </div>

          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/admin">Voltar ao Admin</Link>
            </Button>
            <Button asChild className="bg-pink-500 hover:bg-pink-600">
              <Link href="/admin/products/new">Novo Produto</Link>
            </Button>
          </div>
        </div>

        {/* Upload Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Upload de Imagens</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploading}
                className="flex-1"
              />
              <Button disabled={uploading} className="bg-green-500 hover:bg-green-600">
                {uploading ? (
                  <>
                    <Upload className="h-4 w-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Enviar
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar por nome do arquivo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os tipos</SelectItem>
                    <SelectItem value="jpeg">JPEG</SelectItem>
                    <SelectItem value="png">PNG</SelectItem>
                    <SelectItem value="webp">WebP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Files Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredFiles.map((file, index) => (
            <motion.div
              key={file.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-square relative bg-gray-100">
                  <Image src={file.url || "/placeholder.svg"} alt={file.pathname} fill className="object-cover" />
                </div>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <h3 className="font-medium text-sm truncate" title={file.pathname}>
                      {file.pathname.split("/").pop()}
                    </h3>
                    <div className="text-xs text-gray-500 space-y-1">
                      <p>Tamanho: {formatFileSize(file.size)}</p>
                      <p>Tipo: {file.contentType}</p>
                      <p>Upload: {new Date(file.uploadedAt).toLocaleDateString("pt-BR")}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-transparent"
                      onClick={() => window.open(file.url, "_blank")}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Ver
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-transparent"
                      onClick={() => {
                        const link = document.createElement("a")
                        link.href = file.url
                        link.download = file.pathname.split("/").pop() || "image"
                        link.click()
                      }}
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Baixar
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteFile(file.pathname)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredFiles.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              {searchTerm || filterType !== "all" ? "Nenhum arquivo encontrado" : "Nenhuma imagem enviada ainda"}
            </p>
          </div>
        )}

        {/* Storage Stats */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Estatísticas do Storage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-pink-500">{files.length}</div>
                <div className="text-gray-600 text-sm">Total de Arquivos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-500">
                  {formatFileSize(files.reduce((acc, file) => acc + file.size, 0))}
                </div>
                <div className="text-gray-600 text-sm">Espaço Utilizado</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-500">
                  {files.filter((f) => f.contentType.includes("image")).length}
                </div>
                <div className="text-gray-600 text-sm">Imagens</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
