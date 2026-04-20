"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home,
  Users,
  BookOpen,
  Heart,
  Plus,
  Clock,
  MapPin,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { usePrayers, useAmenActions } from "@/hooks/use-prayers"
import { useUserHierarchyIds } from "@/hooks/use-hierarchies"
import { useUser } from "@/hooks/use-user"
import { PrayerFormDialog } from "@/components/prayers/prayer-form-dialog"
import type { Prayer } from "@/types/database"

type Language = "zh-Hant" | "zh-Hans"

const translations = {
  "zh-Hant": {
    title: "代禱事項",
    addPrayer: "發起代禱",
    all: "全部",
    gospel: "福音朋友",
    newBelievers: "初信小羊",
    family: "家庭",
    serving: "服事",
    urgent: "緊急",
    amen: "阿們",
    home: "首頁",
    targets: "名單",
    materials: "資源",
    prayers: "代禱",
    loading: "載入中...",
  },
  "zh-Hans": {
    title: "代祷事项",
    addPrayer: "发起代祷",
    all: "全部",
    gospel: "福音朋友",
    newBelievers: "初信小羊",
    family: "家庭",
    serving: "服事",
    urgent: "紧急",
    amen: "阿们",
    home: "首页",
    targets: "名单",
    materials: "资源",
    prayers: "代祷",
    loading: "载入中...",
  },
}

const categories = [
  { id: "all", label: { "zh-Hant": "全部", "zh-Hans": "全部" } },
  { id: "gospel", label: { "zh-Hant": "福音朋友", "zh-Hans": "福音朋友" } },
  { id: "new_believers", label: { "zh-Hant": "初信小羊", "zh-Hans": "初信小羊" } },
  { id: "family", label: { "zh-Hant": "家庭", "zh-Hans": "家庭" } },
  { id: "serving", label: { "zh-Hant": "服事", "zh-Hans": "服事" } },
  { id: "urgent", label: { "zh-Hant": "緊急", "zh-Hans": "紧急" } },
]

const categoryColors: Record<string, string> = {
  gospel: "bg-amber-100 text-amber-700",
  new_believers: "bg-emerald-100 text-emerald-700",
  family: "bg-blue-100 text-blue-700",
  serving: "bg-purple-100 text-purple-700",
  urgent: "bg-red-100 text-red-700",
}

const categoryLabels: Record<string, Record<Language, string>> = {
  gospel: { "zh-Hant": "福音朋友", "zh-Hans": "福音朋友" },
  new_believers: { "zh-Hant": "初信小羊", "zh-Hans": "初信小羊" },
  family: { "zh-Hant": "家庭", "zh-Hans": "家庭" },
  serving: { "zh-Hant": "服事", "zh-Hans": "服事" },
  urgent: { "zh-Hant": "緊急", "zh-Hans": "紧急" },
}

function formatTimeAgo(dateString: string, lang: Language): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (lang === "zh-Hant") {
    if (diffMins < 1) return "剛剛"
    if (diffMins < 60) return `${diffMins}分鐘前`
    if (diffHours < 24) return `${diffHours}小時前`
    if (diffDays < 7) return `${diffDays}天前`
    return date.toLocaleDateString("zh-Hant")
  } else {
    if (diffMins < 1) return "刚刚"
    if (diffMins < 60) return `${diffMins}分钟前`
    if (diffHours < 24) return `${diffHours}小时前`
    if (diffDays < 7) return `${diffDays}天前`
    return date.toLocaleDateString("zh-Hans")
  }
}

export default function PrayersPage() {
  const [lang, setLang] = useState<Language>("zh-Hant")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [prayerDialogOpen, setPrayerDialogOpen] = useState(false)

  const pathname = usePathname()
  const { user } = useUser()
  const { ids: hierarchyIds } = useUserHierarchyIds(undefined)
  const { prayers, loading } = usePrayers(
    hierarchyIds,
    selectedCategory === "all" ? undefined : selectedCategory
  )
  const { prayedIds, toggleAmen } = useAmenActions(user?.id || "")

  const t = translations[lang]

  const navItems = [
    { id: "home", icon: Home, label: t.home, href: "/" },
    { id: "targets", icon: Users, label: t.targets, href: "/targets" },
    { id: "materials", icon: BookOpen, label: t.materials, href: "/materials" },
    { id: "prayers", icon: Heart, label: t.prayers, href: "/prayers" },
  ]

  const isActive = (href: string) => pathname === href

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-lg font-semibold text-foreground">{t.title}</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLang(lang === "zh-Hant" ? "zh-Hans" : "zh-Hant")}
              className="text-sm font-medium"
            >
              {lang === "zh-Hant" ? "繁/簡" : "简/繁"}
            </Button>
            <Button
              size="sm"
              className="gap-1.5"
              onClick={() => setPrayerDialogOpen(true)}
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">{t.addPrayer}</span>
            </Button>
          </div>
        </div>

        <div className="px-4 pb-3">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                {category.label[lang]}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="px-4 py-4 space-y-4">
        {loading ? (
          <p className="text-center text-muted-foreground py-8">{t.loading}</p>
        ) : prayers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Heart className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">
              {lang === "zh-Hant" ? "暫無代禱事項" : "暂无代祷事项"}
            </p>
          </div>
        ) : (
          prayers.map((prayer) => (
            <Card
              key={prayer.id}
              className={`bg-card border-border shadow-sm overflow-hidden ${
                prayer.is_urgent ? "border-l-4 border-l-red-500" : ""
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10 border-2 border-primary/20">
                      <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                        {prayer.posted_by_profile?.name?.charAt(0) || "用"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-foreground text-base">
                        {lang === "zh-Hant" ? prayer.title_zh_hant : prayer.title_zh_hans}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground">
                          {prayer.posted_by_profile?.name || "用戶"}
                        </span>
                        <span className="text-xs text-muted-foreground">·</span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTimeAgo(prayer.created_at, lang)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Badge className={`text-xs ${categoryColors[prayer.category] || "bg-muted text-muted-foreground"}`}>
                    {categoryLabels[prayer.category]?.[lang] || prayer.category}
                  </Badge>
                </div>

                <p className="text-sm text-foreground/80 leading-relaxed mb-3">
                  {lang === "zh-Hant" ? prayer.content_zh_hant : prayer.content_zh_hans}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>
                      {prayer.hierarchy
                        ? lang === "zh-Hant"
                          ? prayer.hierarchy.name_zh_hant
                          : prayer.hierarchy.name_zh_hans
                        : "-"}
                    </span>
                  </div>
                  <Button
                    variant={prayedIds.has(prayer.id) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleAmen(prayer.id)}
                    className={`gap-1.5 ${
                      prayedIds.has(prayer.id)
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-primary/10 hover:text-primary"
                    }`}
                  >
                    <Heart
                      className={`w-4 h-4 ${prayedIds.has(prayer.id) ? "fill-current" : ""}`}
                    />
                    <span>{t.amen}</span>
                    <span className="text-xs opacity-80">({prayer.amen_count})</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t border-border z-40">
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
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
        <div className="h-safe-area-inset-bottom bg-card" />
      </nav>

      <PrayerFormDialog
        open={prayerDialogOpen}
        onOpenChange={setPrayerDialogOpen}
      />
    </div>
  )
}
