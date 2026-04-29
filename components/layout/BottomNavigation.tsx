"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Users, BookOpen, Heart, Plus } from "lucide-react"
import { MemberFormDialog } from "@/components/members/member-form-dialog"
import { useLanguage } from "@/contexts/language-context"

const translations = {
  "zh-Hant": {
    home: "首頁",
    targets: "名單",
    materials: "資源",
    prayers: "代禱",
  },
  "zh-Hans": {
    home: "首页",
    targets: "名单",
    materials: "资源",
    prayers: "代祷",
  },
}

export function BottomNavigation() {
  const pathname = usePathname()
  const { language } = useLanguage()
  const t = translations[language]
  const [dialogOpen, setDialogOpen] = useState(false)

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t border-border z-50">
        {/* 5-section grid layout */}
        <div className="grid grid-cols-5 items-center max-w-md mx-auto px-2 pt-2 pb-2">
          {/* Left section: Home */}
          <Link
            href="/"
            className={`flex flex-col items-center gap-1 py-2 px-2 rounded-xl transition-colors min-h-[44px] ${
              isActive("/")
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <div
              className={`p-2 rounded-xl transition-colors ${
                isActive("/") ? "bg-primary/10" : ""
              }`}
            >
              <Home className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium">{t.home}</span>
          </Link>

          {/* Left section: Targets */}
          <Link
            href="/targets"
            className={`flex flex-col items-center gap-1 py-2 px-2 rounded-xl transition-colors min-h-[44px] ${
              isActive("/targets")
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <div
              className={`p-2 rounded-xl transition-colors ${
                isActive("/targets") ? "bg-primary/10" : ""
              }`}
            >
              <Users className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium">{t.targets}</span>
          </Link>

          {/* Center section: FAB placeholder (invisible, for spacing) */}
          <div className="flex justify-center items-center min-h-[44px]">
            {/* Empty placeholder for FAB space */}
          </div>

          {/* Right section: Materials */}
          <Link
            href="/materials"
            className={`flex flex-col items-center gap-1 py-2 px-2 rounded-xl transition-colors min-h-[44px] ${
              isActive("/materials")
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <div
              className={`p-2 rounded-xl transition-colors ${
                isActive("/materials") ? "bg-primary/10" : ""
              }`}
            >
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium">{t.materials}</span>
          </Link>

          {/* Right section: Prayers */}
          <Link
            href="/prayers"
            className={`flex flex-col items-center gap-1 py-2 px-2 rounded-xl transition-colors min-h-[44px] ${
              isActive("/prayers")
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <div
              className={`p-2 rounded-xl transition-colors ${
                isActive("/prayers") ? "bg-primary/10" : ""
              }`}
            >
              <Heart className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium">{t.prayers}</span>
          </Link>
        </div>

        {/* Safe area padding for iOS/Android */}
        <div 
          className="bg-card"
          style={{ height: 'env(safe-area-inset-bottom, 0px)' }}
        />

        {/* Central FAB button - elevated above nav bar */}
        <button
          onClick={() => setDialogOpen(true)}
          className="absolute left-1/2 -translate-x-1/2 -top-5 w-14 h-14 rounded-full bg-emerald-600 shadow-lg shadow-emerald-600/30 flex items-center justify-center text-white transition-all hover:bg-emerald-700 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          aria-label="新增對象"
        >
          <Plus className="w-7 h-7" strokeWidth={2.5} />
        </button>
      </nav>

      {/* MemberFormDialog embedded */}
      <MemberFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={() => setDialogOpen(false)}
      />
    </>
  )
}