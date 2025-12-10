import { createClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"

// Cliente com service role para operações admin (bypass RLS)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
        }

        const productId = parseInt(id)
        console.log("[API] Deleting product:", productId)

        // 1. Buscar imagens para deletar do storage
        const { data: images } = await supabaseAdmin
            .from("product_images")
            .select("image_url")
            .eq("product_id", productId)

        // 2. Deletar imagens do storage
        if (images && images.length > 0) {
            for (const image of images) {
                const path = image.image_url.split("/product-images/")[1]
                if (path) {
                    await supabaseAdmin.storage.from("product-images").remove([path])
                }
            }
        }

        // 3. Deletar registros de product_images
        await supabaseAdmin.from("product_images").delete().eq("product_id", productId)

        // 4. Deletar produto
        const { error, data } = await supabaseAdmin
            .from("products")
            .delete()
            .eq("id", productId)
            .select()

        console.log("[API] Delete result:", data, "Error:", error)

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true, deleted: data })
    } catch (error: any) {
        console.error("[API] Error deleting product:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json()
        const { id, ...data } = body

        if (!id) {
            return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
        }

        console.log("[API] Updating product:", id, "Data:", data)

        const { error, data: updatedData } = await supabaseAdmin
            .from("products")
            .update(data)
            .eq("id", id)
            .select()

        console.log("[API] Update result:", updatedData, "Error:", error)

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true, product: updatedData?.[0] })
    } catch (error: any) {
        console.error("[API] Error updating product:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
