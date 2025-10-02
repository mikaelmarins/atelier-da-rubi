"use client"

import type React from "react"
import { useState, useRef } from "react"
import { motion } from "framer-motion"
import { Upload, X, Loader2, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StorageService } from "@/lib/storage"
import Image from "next/image"

interface ImageUploadProps {
  onImagesUploaded: (urls: string[]) => void
  maxImages?: number
  existingImages?: string[]
}

export default function ImageUpload({ onImagesUploaded, maxImages = 5, existingImages = [] }: ImageUploadProps) {
  const [images, setImages] = useState<string[]>(existingImages)
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFiles = async (files: FileList) => {
    if (files.length === 0) return

    const fileArray = Array.from(files)
    const remainingSlots = maxImages - images.length

    if (fileArray.length > remainingSlots) {
      alert(`Você pode adicionar no máximo ${remainingSlots} imagens`)
      return
    }

    setUploading(true)

    try {
      const validFiles: File[] = []

      for (const file of fileArray) {
        const validation = StorageService.validateImageFile(file)
        if (!validation.valid) {
          alert(`Erro no arquivo ${file.name}: ${validation.error}`)
          continue
        }
        validFiles.push(file)
      }

      if (validFiles.length === 0) {
        setUploading(false)
        return
      }

      const uploadResults = []

      for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i]
        setUploadProgress((prev) => ({ ...prev, [file.name]: 33 }))

        const result = await StorageService.uploadImage(file)
        uploadResults.push(result)

        setUploadProgress((prev) => ({ ...prev, [file.name]: 100 }))
      }

      const newImageUrls = uploadResults.map((result) => result.url)
      const updatedImages = [...images, ...newImageUrls]
      setImages(updatedImages)
      onImagesUploaded(updatedImages)

      setTimeout(() => setUploadProgress({}), 1000)
    } catch (error) {
      console.error("Error uploading images:", error)
      alert("Erro ao fazer upload das imagens.")
      setUploadProgress({})
    } finally {
      setUploading(false)
    }
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

  const removeImage = async (index: number) => {
    try {
      const updatedImages = images.filter((_, i) => i !== index)
      setImages(updatedImages)
      onImagesUploaded(updatedImages)
    } catch (error) {
      console.error("Error removing image:", error)
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
          disabled={uploading || images.length >= maxImages}
        />

        <div className="space-y-2">
          {uploading ? (
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-pink-500" />
          ) : (
            <Upload className="h-8 w-8 mx-auto text-gray-400" />
          )}

          <div>
            <p className="text-sm font-medium text-gray-700">
              {uploading ? "Fazendo upload..." : "Clique ou arraste imagens aqui"}
            </p>
            <p className="text-xs text-gray-500">
              PNG, JPG, WebP até 5MB ({images.length}/{maxImages})
            </p>
          </div>
        </div>
      </div>

      {Object.keys(uploadProgress).length > 0 && (
        <div className="space-y-2">
          {Object.entries(uploadProgress).map(([filename, progress]) => (
            <div key={filename} className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-700 truncate flex-1">{filename}</span>
                {progress === 100 ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <span className="text-sm text-gray-500">{progress}%</span>
                )}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-pink-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((imageUrl, index) => (
            <motion.div
              key={imageUrl}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden"
            >
              <Image src={imageUrl || "/placeholder.svg"} alt={`Upload ${index + 1}`} fill className="object-cover" />

              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                <Button
                  variant="destructive"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeImage(index)}
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
