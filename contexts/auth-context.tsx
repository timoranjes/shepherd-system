"use client"

import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react"
import { createClient } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"
import type { Profile } from "@/types/database"
import { signOut as authSignOut } from "@/lib/auth"

interface AuthContextValue {
  user: User | null
  profile: Profile | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const authEventReceived = useRef(false)

  const fetchProfile = useCallback(async (userId: string) => {
    const supabase = createClient()
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle()
    setProfile(data)
  }, [])

  useEffect(() => {
    const supabase = createClient()
    const cancelled = { current: false }

    const fallbackTimer = setTimeout(() => {
      if (!authEventReceived.current && !cancelled.current) {
        window.location.href = "/login"
      }
    }, 15000)

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (cancelled.current) return
        authEventReceived.current = true
        setLoading(false)

        setUser(session?.user ?? null)

        if (session?.user) {
          await fetchProfile(session.user.id)
        } else {
          setProfile(null)
        }

        if (!session?.user && event === "SIGNED_OUT") {
          window.location.href = "/login"
        }
      }
    )

    return () => {
      cancelled.current = true
      clearTimeout(fallbackTimer)
      subscription.unsubscribe()
    }
  }, [fetchProfile])

  const signOut = async () => {
    await authSignOut()
    window.location.href = "/login"
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

export function useUser() {
  return useAuth()
}