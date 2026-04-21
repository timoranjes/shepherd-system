"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

type Language = "zh-Hant" | "zh-Hans"

const translations = {
  zhHant: {
    title: "發生錯誤",
    message: "抱歉，此頁面發生了預料之外的錯誤。",
    retry: "重試",
    home: "返回首頁",
  },
  zhHans: {
    title: "发生错误",
    message: "抱歉，此页面发生了预料之外的错误。",
    retry: "重试",
    home: "返回首页",
  },
}

type ErrorProps = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("Route error:", error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="space-y-2">
          <div className="w-16 h-16 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-destructive"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            {translations.zhHant.title}
          </h1>
          <p className="text-muted-foreground">
            {translations.zhHant.message}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={reset} variant="default">
            {translations.zhHant.retry}
          </Button>
          <Button onClick={() => (window.location.href = "/")} variant="secondary">
            {translations.zhHant.home}
          </Button>
        </div>
      </div>
    </div>
  )
}