"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sun } from "lucide-react"
import { createClient } from "@/lib/supabase"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()

    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      const supabase = createClient()
      
      if (isSignUp) {
        console.log("Attempting sign up for:", email)
        const { data, error } = await supabase.auth.signUp({ email, password })
        console.log("Sign up response:", data)

        if (error) throw error

        if (data.user?.identities?.length === 0) {
          setMessage("此郵箱已註冊，請直接登入。")
        } else {
          setMessage("註冊成功！請查看郵箱確認郵件以完成激活。")
        }
      } else {
        console.log("Attempting sign in for:", email)
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        console.log("Sign in response:", data)

        if (error) throw error

        const supabase = createClient()
        await supabase.auth.setSession({
          access_token: data.access_token,
          refresh_token: data.refresh_token,
        })

        console.log("Sign in successful, redirecting...")
        window.location.href = "/"
      }
    } catch (err) {
      console.error("Auth error:", err)
      setError(err instanceof Error ? err.message : "發生錯誤")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleAuth = async () => {
    setLoading(true)
    setError(null)

    const { createClient } = await import("@/lib/supabase")
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) {
      console.error("Google auth error:", error)
      setError("Google 登入失敗，請稍後再試")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-sm bg-card border-border">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary flex items-center justify-center">
            <Sun className="w-8 h-8 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold">福音與牧養管理系統</CardTitle>
            <CardDescription className="text-muted-foreground mt-2">
              {isSignUp ? "建立新帳戶" : "登入您的帳戶"}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}
          {message && (
            <div className="p-3 rounded-lg bg-primary/10 text-primary text-sm">
              {message}
            </div>
          )}

          <form onSubmit={handleEmailAuth} className="space-y-3">
            <Input
              type="email"
              placeholder="電子郵件"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="bg-background"
            />
            <Input
              type="password"
              placeholder="密碼"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="current-password"
              className="bg-background"
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "處理中..." : isSignUp ? "註冊" : "登入"}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">或</span>
            </div>
          </div>

          <div className="space-y-2">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleGoogleAuth}
              disabled={loading}
            >
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </Button>
            </div>

          <p className="text-center text-sm text-muted-foreground">
            {isSignUp ? "已經有帳戶？" : "還沒有帳戶？"}
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp)
                setError(null)
                setMessage(null)
              }}
              className="ml-1 text-primary hover:underline font-medium"
            >
              {isSignUp ? "登入" : "註冊"}
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
