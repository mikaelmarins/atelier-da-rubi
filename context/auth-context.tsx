"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { supabase } from "@/lib/supabase"
import { User, Session } from "@supabase/supabase-js"

interface UserProfile {
    id: string
    email: string
    name: string | null
    phone: string | null
    created_at: string
}

interface Address {
    id: string
    user_id: string
    label: string
    zip: string
    street: string
    number: string
    complement: string | null
    neighborhood: string
    city: string
    state: string
    is_default: boolean
}

interface AuthContextType {
    user: User | null
    profile: UserProfile | null
    addresses: Address[]
    session: Session | null
    loading: boolean
    signUp: (email: string, password: string, name: string) => Promise<{ error: Error | null }>
    signIn: (email: string, password: string) => Promise<{ error: Error | null }>
    signInWithGoogle: () => Promise<{ error: Error | null }>
    signOut: () => Promise<void>
    updateProfile: (data: Partial<UserProfile>) => Promise<{ error: Error | null }>
    addAddress: (address: Omit<Address, "id" | "user_id">) => Promise<{ error: Error | null }>
    removeAddress: (id: string) => Promise<void>
    setDefaultAddress: (id: string) => Promise<void>
    refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [profile, setProfile] = useState<UserProfile | null>(null)
    const [addresses, setAddresses] = useState<Address[]>([])
    const [session, setSession] = useState<Session | null>(null)
    const [loading, setLoading] = useState(true)

    // Load user profile and addresses
    const loadUserData = async (userId: string) => {
        try {
            // Load profile
            const { data: profileData } = await supabase
                .from("user_profiles")
                .select("*")
                .eq("id", userId)
                .single()

            if (profileData) {
                setProfile(profileData)
            }

            // Load addresses
            const { data: addressData } = await supabase
                .from("user_addresses")
                .select("*")
                .eq("user_id", userId)
                .order("is_default", { ascending: false })

            if (addressData) {
                setAddresses(addressData)
            }
        } catch (error) {
            console.error("Error loading user data:", error)
        }
    }

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session)
            setUser(session?.user ?? null)
            if (session?.user) {
                loadUserData(session.user.id)
            }
            setLoading(false)
        })

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                setSession(session)
                setUser(session?.user ?? null)

                if (session?.user) {
                    await loadUserData(session.user.id)
                } else {
                    setProfile(null)
                    setAddresses([])
                }
                setLoading(false)
            }
        )

        return () => subscription.unsubscribe()
    }, [])

    const signUp = async (email: string, password: string, name: string) => {
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: { name }
                }
            })

            if (error) throw error

            // Create profile
            if (data.user) {
                await supabase.from("user_profiles").insert({
                    id: data.user.id,
                    email: email,
                    name: name
                })
            }

            return { error: null }
        } catch (error) {
            return { error: error as Error }
        }
    }

    const signIn = async (email: string, password: string) => {
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password
            })
            if (error) throw error
            return { error: null }
        } catch (error) {
            return { error: error as Error }
        }
    }

    const signInWithGoogle = async () => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`
                }
            })
            if (error) throw error
            return { error: null }
        } catch (error) {
            return { error: error as Error }
        }
    }

    const signOut = async () => {
        await supabase.auth.signOut()
        setUser(null)
        setProfile(null)
        setAddresses([])
        setSession(null)
    }

    const updateProfile = async (data: Partial<UserProfile>) => {
        if (!user) return { error: new Error("Not authenticated") }

        try {
            const { error } = await supabase
                .from("user_profiles")
                .update(data)
                .eq("id", user.id)

            if (error) throw error

            await loadUserData(user.id)
            return { error: null }
        } catch (error) {
            return { error: error as Error }
        }
    }

    const addAddress = async (address: Omit<Address, "id" | "user_id">) => {
        if (!user) return { error: new Error("Not authenticated") }

        try {
            // If this is default, remove default from others
            if (address.is_default) {
                await supabase
                    .from("user_addresses")
                    .update({ is_default: false })
                    .eq("user_id", user.id)
            }

            const { error } = await supabase
                .from("user_addresses")
                .insert({
                    ...address,
                    user_id: user.id
                })

            if (error) throw error

            await loadUserData(user.id)
            return { error: null }
        } catch (error) {
            return { error: error as Error }
        }
    }

    const removeAddress = async (id: string) => {
        await supabase.from("user_addresses").delete().eq("id", id)
        if (user) await loadUserData(user.id)
    }

    const setDefaultAddress = async (id: string) => {
        if (!user) return

        // Remove default from all
        await supabase
            .from("user_addresses")
            .update({ is_default: false })
            .eq("user_id", user.id)

        // Set new default
        await supabase
            .from("user_addresses")
            .update({ is_default: true })
            .eq("id", id)

        await loadUserData(user.id)
    }

    const refreshProfile = async () => {
        if (user) await loadUserData(user.id)
    }

    return (
        <AuthContext.Provider value={{
            user,
            profile,
            addresses,
            session,
            loading,
            signUp,
            signIn,
            signInWithGoogle,
            signOut,
            updateProfile,
            addAddress,
            removeAddress,
            setDefaultAddress,
            refreshProfile
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
}
