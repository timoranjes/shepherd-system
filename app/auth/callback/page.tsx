"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function AuthCallbackPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const handleCallback = async () => {
      const { createClient } = await import("@/lib/supabase")
      const supabase = createClient()
      await supabase.auth.getSession()
      router.push("/")
    }
    handleCallback().finally(() => setLoading(false))
  }, [router])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <p className="text-muted-foreground">{loading ? "登入中..." : "跳轉中..."}</p>
    </div>
  )
}
