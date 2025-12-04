import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get("code")

    if (code) {
        const supabase = createRouteHandlerClient({ cookies })

        // Exchange code for session
        const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error && session?.user) {
            // Check if profile exists, create if not (for Google OAuth users)
            const { data: existingProfile } = await supabase
                .from("user_profiles")
                .select("id")
                .eq("id", session.user.id)
                .single()

            if (!existingProfile) {
                // Create profile from Google data
                await supabase.from("user_profiles").insert({
                    id: session.user.id,
                    email: session.user.email,
                    name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || null
                })
            }
        }
    }

    // URL to redirect to after sign in process completes
    return NextResponse.redirect(new URL("/", requestUrl.origin))
}
