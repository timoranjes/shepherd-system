"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"
import type { Profile } from "@/types/database"
import { signOut as authSignOut } from "@/lib/auth"

export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    let cancelled = false

    const getUser = async () => {
      try {
        // Add 10s timeout to prevent hanging indefinitely
        const timeout = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Auth timeout")), 10000)
        )
        const result = await Promise.race([supabase.auth.getUser(), timeout])
        const { data: { user }, error } = result
        if (cancelled) return
        if (error) {
          console.error("Auth getUser error:", error.message)
        }
        setUser(user)

        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single()
          if (!cancelled) setProfile(profile)
        }
      } catch (err) {
        console.error("Auth getUser failed:", err)
        setUser(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (cancelled) return
        setUser(session?.user ?? null)
        if (session?.user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single()
          if (!cancelled) setProfile(profile)
        } else {
          setProfile(null)
        }
        setLoading(false)
      }
    )

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    await authSignOut()
    window.location.href = "/login"
  }

  return { user, profile, loading, signOut }
}
