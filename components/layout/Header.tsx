"use client"

import { BookHeart, Sun, Moon, LogOut, UserCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { useLanguage } from "@/contexts/language-context"
import { useUser } from "@/contexts/auth-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface HeaderProps {
  showBackButton?: boolean
  backHref?: string
  backLabel?: string
}

export function Header({ showBackButton = false, backHref = "/", backLabel = "返回" }: HeaderProps) {
  const { theme, setTheme } = useTheme()
  const { language, setLanguage } = useLanguage()
  const { profile, signOut } = useUser()

  const isDark = theme === "dark"
  const isTraditional = language === "zh-Hant"

  const backLabelLocalized = isTraditional ? backLabel : 
    backLabel === "返回" ? "返回" : backLabel

  return (
    <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left Side - Back Button or Logo */}
        {showBackButton ? (
          <Link
            href={backHref}
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">{backLabelLocalized}</span>
          </Link>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shadow-sm">
              <BookHeart className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground text-base tracking-wide">
              小羊管理系統
            </span>
          </div>
        )}

        {/* Right Side Controls */}
        <div className="flex items-center gap-4">
          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="p-2 rounded-full hover:bg-accent/50 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            aria-label={isDark ? "切換至亮色模式" : "切換至暗色模式"}
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-foreground" />
            ) : (
              <Moon className="w-5 h-5 text-foreground" />
            )}
          </button>

          {/* Language Toggle */}
          <div className="flex items-center gap-1 text-sm">
            <button
              onClick={() => setLanguage("zh-Hant")}
              className={cn(
                "px-1.5 py-0.5 rounded transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                isTraditional
                  ? "font-bold text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-label="切換至繁體中文"
            >
              繁
            </button>
            <span className="text-muted-foreground/60 select-none">|</span>
            <button
              onClick={() => setLanguage("zh-Hans")}
              className={cn(
                "px-1.5 py-0.5 rounded transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                !isTraditional
                  ? "font-bold text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-label="切換至简体中文"
            >
              简
            </button>
          </div>

          {/* User Avatar Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex items-center gap-2 p-1 rounded-full hover:bg-accent/50 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                aria-label="用戶選單"
              >
                <Avatar className="w-8 h-8 border-2 border-border/50 hover:border-primary/50 transition-colors duration-200">
                  {profile?.avatar_url ? (
                    <AvatarImage
                      src={profile.avatar_url}
                      alt={profile.name || "用戶頭像"}
                    />
                  ) : (
                    <AvatarFallback className="bg-muted text-muted-foreground">
                      <UserCircle className="w-5 h-5" />
                    </AvatarFallback>
                  )}
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault()
                  // Placeholder for avatar selection dialog
                  // Will be implemented later
                }}
                className="cursor-pointer"
              >
                <UserCircle className="w-4 h-4 mr-2" />
                選擇預設頭像
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onSelect={(e) => {
                  e.preventDefault()
                  signOut()
                }}
                className="cursor-pointer"
              >
                <LogOut className="w-4 h-4 mr-2" />
                登出
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}