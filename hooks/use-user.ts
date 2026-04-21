"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"
import type { Profile } from "@/types/database"
import { getAccessTokenFromCookie, clearAuthCookies } from "@/lib/auth"

export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    const getUser = async () => {
      try {
        const accessToken = getAccessTokenFromCookie()

        if (accessToken) {
          const { data: { user }, error } = await supabase.auth.getUser()

          if (error && error.message !== "Auth session missing") {
            console.error("getUser error:", error)
          }

          if (user) {
            setUser(user)
            const { data: profile } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", user.id)
              .single()
            setProfile(profile)
          } else if (accessToken) {
            const refreshToken = document.cookie.match(/sb-refresh-token=([^;]+)/)?.[1]
            if (refreshToken) {
              const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              })
              if (sessionError) {
                console.error("setSession error:", sessionError)
                clearAuthCookies()
              } else if (sessionData?.user) {
                setUser(sessionData.user)
                const { data: profile } = await supabase
                  .from("profiles")
                  .select("*")
                  .eq("id", sessionData.user.id)
                  .single()
                setProfile(profile)
              }
            }
          }
        }
      } catch (err) {
        console.error("Unexpected error in getUser:", err)
      } finally {
        setLoading(false)
      }
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single()
          setProfile(profile)
        } else {
          setProfile(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    clearAuthCookies()
    const { createClient } = await import("@/lib/supabase")
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = "/login"
  }

  return { user, profile, loading, signOut }
}
