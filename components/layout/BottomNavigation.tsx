"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Users, BookOpen, Heart } from "lucide-react"

type Language = "zh-Hant" | "zh-Hans"

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

const navItems = [
  { id: "home", icon: Home, labelKey: "home" as const, href: "/" },
  { id: "targets", icon: Users, labelKey: "targets" as const, href: "/targets" },
  { id: "materials", icon: BookOpen, labelKey: "materials" as const, href: "/materials" },
  { id: "prayers", icon: Heart, labelKey: "prayers" as const, href: "/prayers" },
]

interface BottomNavigationProps {
  lang: Language
}

export function BottomNavigation({ lang }: BottomNavigationProps) {
  const pathname = usePathname()
  const t = translations[lang]

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t border-border z-50">
      <div className="flex items-center justify-around py-2 px-4 max-w-md mx-auto">
        {navItems.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className={`flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition-colors ${
              isActive(item.href)
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <div
              className={`p-2 rounded-xl transition-colors ${
                isActive(item.href) ? "bg-primary/10" : ""
              }`}
            >
              <item.icon className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium">{t[item.labelKey]}</span>
          </Link>
        ))}
      </div>
      <div className="h-safe-area-inset-bottom bg-card" />
    </nav>
  )
}