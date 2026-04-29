"use client"

import { useState } from "react"
import {
  Home,
  Users,
  BookOpen,
  Heart,
  Plus,
  Clock,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { BottomNavigation } from "@/components/layout/BottomNavigation"
import { PrayerFormDialog } from "@/components/prayers/prayer-form-dialog"
import { usePrayers, useAmenActions } from "@/hooks/use-prayers"
import { useUser } from "@/contexts/auth-context"

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
    today: "今天",
    yesterday: "昨天",
    daysAgo: "天前",
    postedBy: "發起人",
    loading: "載入中...",
    noPrayers: "暫無代禱事項",
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
    today: "今天",
    yesterday: "昨天",
    daysAgo: "天前",
    postedBy: "发起人",
    loading: "载入中...",
    noPrayers: "暂无代祷事项",
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

export default function PrayersPage() {
  const [lang, setLang] = useState<Language>("zh-Hant")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [prayerDialogOpen, setPrayerDialogOpen] = useState(false)

  const { profile } = useUser()
  const { data: prayers = [], isLoading: loading } = usePrayers(
    selectedCategory === "all" ? undefined : selectedCategory
  )
  const { prayedIds, toggleAmen } = useAmenActions(profile?.id || "")

  const t = translations[lang]

  const handleAmen = async (prayerId: string) => {
    if (!profile?.id) return
    await toggleAmen(prayerId)
  }

  const getTimeLabel = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return t.today
    if (diffDays === 1) return t.yesterday
    return `${diffDays} ${t.daysAgo}`
  }

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
            <Button size="sm" className="gap-1.5" onClick={() => setPrayerDialogOpen(true)}>
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
            <p className="text-muted-foreground">{t.noPrayers}</p>
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
                        {prayer.posted_by_profile?.name?.charAt(0) || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-foreground text-base">
                        {lang === "zh-Hant" ? prayer.title_zh_hant : prayer.title_zh_hans}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground">
                          {prayer.posted_by_profile?.name || t.postedBy}
                        </span>
                        <span className="text-xs text-muted-foreground">·</span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {getTimeLabel(prayer.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Badge className={`text-xs ${categoryColors[prayer.category] || "bg-muted text-muted-foreground"}`}>
                    {categories.find((c) => c.id === prayer.category)?.label[lang] || prayer.category}
                  </Badge>
                </div>

                <p className="text-sm text-foreground/80 leading-relaxed mb-3">
                  {lang === "zh-Hant" ? prayer.content_zh_hant : prayer.content_zh_hans}
                </p>

                <div className="flex items-center justify-end pt-2 border-t border-border">
                  <Button
                    variant={prayedIds.has(prayer.id) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleAmen(prayer.id)}
                    className={`gap-1.5 ${
                      prayedIds.has(prayer.id)
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-primary/10 hover:text-primary"
                    }`}
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        prayedIds.has(prayer.id) ? "fill-current" : ""
                      }`}
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

      <PrayerFormDialog
        open={prayerDialogOpen}
        onOpenChange={setPrayerDialogOpen}
        onSuccess={() => {}}
      />

      <BottomNavigation lang={lang} />
    </div>
  )
}