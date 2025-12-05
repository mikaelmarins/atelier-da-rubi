import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get("code")

    if (code) {
        const cookieStore = await cookies()

        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll()
                    },
                    setAll(cookiesToSet) {
                        try {
                            cookiesToSet.forEach(({ name, value, options }) =>
                                cookieStore.set(name, value, options)
                            )
                        } catch {
                            // The `setAll` method was called from a Server Component.
                            // This can be ignored if you have middleware refreshing user sessions.
                        }
                    },
                },
            }
        )

        // Exchange code for session
        const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error && session?.user) {
            // Get user metadata from Google
            const googleName = session.user.user_metadata?.full_name
                || session.user.user_metadata?.name
                || session.user.email?.split('@')[0]

            // Check if profile exists, create if not (for Google OAuth users)
            const { data: existingProfile } = await supabase
                .from("user_profiles")
                .select("id")
                .eq("id", session.user.id)
                .single()

            if (!existingProfile) {
                // Create profile from Google data
                const { error: insertError } = await supabase.from("user_profiles").insert({
                    id: session.user.id,
                    email: session.user.email,
                    name: googleName,
                    phone: null
                })

                if (insertError) {
                    console.error("Error creating profile:", insertError)
                }
            } else {
                // Update profile if name is empty (for existing users who logged in with Google)
                const { data: profileData } = await supabase
                    .from("user_profiles")
                    .select("name")
                    .eq("id", session.user.id)
                    .single()

                if (profileData && !profileData.name && googleName) {
                    await supabase
                        .from("user_profiles")
                        .update({ name: googleName })
                        .eq("id", session.user.id)
                }
            }
        }
    }

    // URL to redirect to after sign in process completes
    return NextResponse.redirect(new URL("/", requestUrl.origin))
}
