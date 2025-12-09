"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { ProductServiceSupabase, type ProductWithImages } from "@/lib/product-service"
import { supabase } from "@/lib/supabase"

// Cache global para evitar múltiplas requisições
let productsCache: ProductWithImages[] | null = null
let cacheTime: number = 0
const CACHE_DURATION = 30000 // 30 segundos de cache

export function useProducts() {
  const [products, setProducts] = useState<ProductWithImages[]>(productsCache || [])
  const [loading, setLoading] = useState(productsCache === null)
  const isLoadingRef = useRef(false)

  const loadProducts = useCallback(async (forceRefresh = false) => {
    // Se já está carregando, não faz outra requisição
    if (isLoadingRef.current) return

    // Se tem cache válido e não é forceRefresh, usa o cache
    const now = Date.now()
    if (!forceRefresh && productsCache && (now - cacheTime) < CACHE_DURATION) {
      setProducts(productsCache)
      setLoading(false)
      return
    }

    isLoadingRef.current = true
    setLoading(true)

    try {
      const data = await ProductServiceSupabase.getAllProducts()
      productsCache = data
      cacheTime = Date.now()
      setProducts(data)
    } catch (error) {
      console.error("Error loading products:", error)
    } finally {
      setLoading(false)
      isLoadingRef.current = false
    }
  }, [])

  useEffect(() => {
    loadProducts()

    // Escutar mudanças em tempo real (com debounce)
    let debounceTimer: NodeJS.Timeout

    const channel = supabase
      .channel("products-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "products",
        },
        () => {
          clearTimeout(debounceTimer)
          debounceTimer = setTimeout(() => loadProducts(true), 500)
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "product_images",
        },
        () => {
          clearTimeout(debounceTimer)
          debounceTimer = setTimeout(() => loadProducts(true), 500)
        },
      )
      .subscribe()

    return () => {
      clearTimeout(debounceTimer)
      supabase.removeChannel(channel)
    }
  }, [loadProducts])

  return {
    products,
    loading,
    refresh: () => loadProducts(true),
  }
}

export function useProduct(id: number) {
  const [product, setProduct] = useState<ProductWithImages | null>(null)
  const [loading, setLoading] = useState(true)

  const loadProduct = useCallback(async () => {
    try {
      const data = await ProductServiceSupabase.getProductById(id)
      setProduct(data)
    } catch (error) {
      console.error("Error loading product:", error)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadProduct()

    const channel = supabase
      .channel(`product-${id}-changes`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "products",
          filter: `id=eq.${id}`,
        },
        () => {
          loadProduct()
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "product_images",
          filter: `product_id=eq.${id}`,
        },
        () => {
          loadProduct()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [id, loadProduct])

  return {
    product,
    loading,
    refresh: loadProduct,
  }
}
