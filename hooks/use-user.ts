"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { createClient } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"
import type { Profile } from "@/types/database"
import { signOut as authSignOut } from "@/lib/auth"

export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  // Track whether any auth event has been received.
  // Used to gate the fallback redirect — we only redirect to /login
  // if NO auth event fires within the timeout window.
  const authEventReceived = useRef(false)

  const fetchProfile = useCallback(async (supabase: ReturnType<typeof createClient>, userId: string, cancelledRef: { current: boolean }) => {
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle()
      if (!cancelledRef.current) setProfile(profile)
    } catch (err) {
      console.error("Profile fetch error:", err)
    }
  }, [])

  useEffect(() => {
    const supabase = createClient()
    const cancelled = { current: false }

    // Fallback timeout: if no auth event fires within 15s,
    // assume there's no session and redirect to login.
    const fallbackTimer = setTimeout(() => {
      if (!authEventReceived.current && !cancelled.current) {
        window.location.href = "/login"
      }
    }, 15000)

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (cancelled.current) return

        authEventReceived.current = true

        // Clear loading on the first auth event — the page may be
        // rendering behind a loading screen and we want to unblock it.
        setLoading(false)

        setUser(session?.user ?? null)

        if (session?.user) {
          await fetchProfile(supabase, session.user.id, cancelled)
        } else {
          setProfile(null)
        }

        // If an auth event fires with no user (SIGNED_OUT), redirect.
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

  return { user, profile, loading, signOut }
}
