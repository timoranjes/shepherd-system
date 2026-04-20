"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase"
import { setAuthCookies } from "@/lib/auth"

export default function AuthCallbackPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleCallback = async () => {
      const supabase = createClient()

      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()

        if (sessionError) {
          console.error("Session error:", sessionError)
          setError("登入失敗，請稍後再試")
          setLoading(false)
          return
        }

        if (!session) {
          setError("無法獲取會話，請重新登入")
          setLoading(false)
          return
        }

        if (session.access_token && session.refresh_token) {
          setAuthCookies(session.access_token, session.refresh_token)
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single()

        if (!profile) {
          const { error: profileError } = await supabase
            .from("profiles")
            .insert({
              id: session.user.id,
              email: session.user.email,
              name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || "",
              avatar_url: session.user.user_metadata?.avatar_url || null,
              role: "member",
            })

          if (profileError) {
            console.error("Profile creation error:", profileError)
          }
        }

        router.push("/")
      } catch (err) {
        console.error("Callback error:", err)
        setError("處理登入時發生錯誤")
        setLoading(false)
      }
    }
    handleCallback()
  }, [router])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        {error ? (
          <div className="p-4">
            <p className="text-destructive mb-4">{error}</p>
            <button
              onClick={() => router.push("/login")}
              className="text-primary hover:underline"
            >
              返回登入頁面
            </button>
          </div>
        ) : (
          <p className="text-muted-foreground">{loading ? "登入中..." : "跳轉中..."}</p>
        )}
      </div>
    </div>
  )
}
