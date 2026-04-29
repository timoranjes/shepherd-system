"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookHeart, Mail, Lock, Loader2 } from "lucide-react"
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
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex items-center justify-center p-4">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <Card className="w-full max-w-md bg-card/95 backdrop-blur-sm border-border/50 shadow-xl relative">
        <CardHeader className="text-center space-y-6 pb-8">
          {/* Logo */}
          <div className="mx-auto relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20">
              <BookHeart className="w-10 h-10 text-primary-foreground" />
            </div>
            {/* Subtle glow effect */}
            <div className="absolute inset-0 w-20 h-20 rounded-2xl bg-primary/20 blur-xl -z-10" />
          </div>

          {/* Title */}
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold tracking-tight">
              小羊管理系統
            </CardTitle>
            <CardDescription className="text-muted-foreground text-sm">
              {isSignUp ? "建立新帳戶，開始您的牧養旅程" : "登入您的帳戶，繼續牧養工作"}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-destructive" />
              {error}
            </div>
          )}

          {/* Success Message */}
          {message && (
            <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 text-primary text-sm flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary" />
              {message}
            </div>
          )}

          {/* Email/Password Form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div className="space-y-2">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="電子郵件"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="bg-background/50 pl-10 h-11 border-border/50 focus:border-primary/50"
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="密碼"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete="current-password"
                  className="bg-background/50 pl-10 h-11 border-border/50 focus:border-primary/50"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-sm shadow-primary/10" 
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              {loading ? "處理中..." : isSignUp ? "註冊" : "登入"}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/50" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-card px-3 text-muted-foreground">或使用其他方式</span>
            </div>
          </div>

          {/* Google Auth */}
          <Button
            type="button"
            variant="outline"
            className="w-full h-11 bg-background/50 hover:bg-accent/50 border-border/50 font-medium"
            onClick={handleGoogleAuth}
            disabled={loading}
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google 登入
          </Button>

          {/* Toggle Sign Up/Login */}
          <p className="text-center text-sm text-muted-foreground pt-2">
            {isSignUp ? "已經有帳戶？" : "還沒有帳戶？"}
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp)
                setError(null)
                setMessage(null)
              }}
              className="ml-1.5 text-primary hover:text-primary/80 font-medium transition-colors"
            >
              {isSignUp ? "登入" : "註冊"}
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}