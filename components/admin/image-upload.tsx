"use client"

import type React from "react"
import { useState, useRef } from "react"
import { motion } from "framer-motion"
import { Upload, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

interface ImageUploadProps {
  onImagesChange: (files: File[]) => void
  maxImages?: number
  existingImages?: string[]
}

export default function ImageUpload({ onImagesChange, maxImages = 5, existingImages = [] }: ImageUploadProps) {
  const [previewUrls, setPreviewUrls] = useState<string[]>(existingImages)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFiles = async (files: FileList) => {
    const fileArray = Array.from(files)
    const remainingSlots = maxImages - previewUrls.length

    if (fileArray.length > remainingSlots) {
      alert(`Você pode adicionar no máximo ${remainingSlots} imagens`)
      return
    }

    // Validar arquivos
    const validFiles = fileArray.filter((file) => {
      if (!file.type.startsWith("image/")) {
        alert(`${file.name} não é uma imagem válida`)
        return false
      }
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} é muito grande (máximo 5MB)`)
        return false
      }
      return true
    })

    if (validFiles.length === 0) return

    // Criar previews
    const newPreviews: string[] = []
    for (const file of validFiles) {
      const url = URL.createObjectURL(file)
      newPreviews.push(url)
    }

    const updatedPreviews = [...previewUrls, ...newPreviews]
    const updatedFiles = [...selectedFiles, ...validFiles]

    setPreviewUrls(updatedPreviews)
    setSelectedFiles(updatedFiles)
    onImagesChange(updatedFiles)
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const removePreview = (index: number) => {
    // Calcular o índice correto considerando imagens existentes
    const isExisting = index < existingImages.length

    if (isExisting) {
      // Remover de existentes
      const newExisting = existingImages.filter((_, i) => i !== index)
      setPreviewUrls([...newExisting, ...previewUrls.slice(existingImages.length)])
    } else {
      // Remover de novos arquivos
      const fileIndex = index - existingImages.length
      const newFiles = selectedFiles.filter((_, i) => i !== fileIndex)
      const newPreviews = previewUrls.filter((_, i) => i !== index)

      setSelectedFiles(newFiles)
      setPreviewUrls(newPreviews)
      onImagesChange(newFiles)
    }
  }

  return (
    <div className="space-y-4">
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive ? "border-pink-400 bg-pink-50" : "border-gray-300 hover:border-pink-400 hover:bg-pink-50"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={previewUrls.length >= maxImages || uploading}
        />

        <div className="space-y-2">
          {uploading ? (
            <Loader2 className="h-8 w-8 mx-auto text-pink-500 animate-spin" />
          ) : (
            <Upload className="h-8 w-8 mx-auto text-gray-400" />
          )}
          <div>
            <p className="text-sm font-medium text-gray-700">
              {uploading ? "Fazendo upload..." : "Clique ou arraste imagens aqui"}
            </p>
            <p className="text-xs text-gray-500">
              PNG, JPG, WebP até 5MB ({previewUrls.length}/{maxImages})
            </p>
          </div>
        </div>
      </div>

      {previewUrls.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {previewUrls.map((url, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden"
            >
              <Image src={url || "/placeholder.svg"} alt={`Upload ${index + 1}`} fill className="object-cover" />

              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                <Button
                  variant="destructive"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removePreview(index)}
                  type="button"
                  disabled={uploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {index === 0 && (
                <div className="absolute top-2 left-2 bg-pink-500 text-white text-xs px-2 py-1 rounded">Principal</div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
