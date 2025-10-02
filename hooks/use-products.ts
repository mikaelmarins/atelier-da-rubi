"use client"

import { useState, useEffect } from "react"
import { ProductService } from "@/lib/product-service"
import type { Product } from "@/data/products"

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  const loadProducts = () => {
    const allProducts = ProductService.getAllProducts()
    setProducts(allProducts)
    setLoading(false)
  }

  useEffect(() => {
    // Carregar produtos inicialmente
    loadProducts()

    // Ouvir mudanças nos produtos
    const handleProductsChange = () => {
      loadProducts()
    }

    window.addEventListener("productsChanged", handleProductsChange)

    return () => {
      window.removeEventListener("productsChanged", handleProductsChange)
    }
  }, [])

  const refresh = () => {
    loadProducts()
  }

  return {
    products,
    loading,
    refresh,
  }
}

export function useProduct(id: number) {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)

  const loadProduct = () => {
    const found = ProductService.getProductById(id)
    setProduct(found || null)
    setLoading(false)
  }

  useEffect(() => {
    loadProduct()

    const handleProductsChange = () => {
      loadProduct()
    }

    window.addEventListener("productsChanged", handleProductsChange)

    return () => {
      window.removeEventListener("productsChanged", handleProductsChange)
    }
  }, [id])

  return {
    product,
    loading,
  }
}
