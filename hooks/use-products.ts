"use client"

import { useState, useEffect } from "react"
import { ProductServiceSupabase, type ProductWithImages } from "@/lib/product-service"
import { supabase } from "@/lib/supabase"

export function useProducts() {
  const [products, setProducts] = useState<ProductWithImages[]>([])
  const [loading, setLoading] = useState(true)

  const loadProducts = async () => {
    try {
      console.log("useProducts: calling getAllProducts")
      const data = await ProductServiceSupabase.getAllProducts()
      console.log("useProducts: got data", data?.length)
      setProducts(data)
    } catch (error) {
      console.error("Error loading products:", error)
    } finally {
      console.log("useProducts: setting loading false")
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()

    // Escutar mudanças em tempo real
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
          loadProducts()
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
          loadProducts()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return {
    products,
    loading,
    refresh: loadProducts,
  }
}

export function useProduct(id: number) {
  const [product, setProduct] = useState<ProductWithImages | null>(null)
  const [loading, setLoading] = useState(true)

  const loadProduct = async () => {
    try {
      const data = await ProductServiceSupabase.getProductById(id)
      setProduct(data)
    } catch (error) {
      console.error("Error loading product:", error)
    } finally {
      setLoading(false)
    }
  }

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
  }, [id])

  return {
    product,
    loading,
    refresh: loadProduct,
  }
}
