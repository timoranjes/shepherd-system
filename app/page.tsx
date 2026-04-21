"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home,
  Users,
  BookOpen,
  Heart,
  ChevronDown,
  UserPlus,
  Sun,
  LogOut,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useUser } from "@/hooks/use-user"
import { useActivities } from "@/hooks/use-activities"
import { usePrayers, useAmenActions } from "@/hooks/use-prayers"
import { useUserHierarchyIds } from "@/hooks/use-hierarchies"
import type { Activity, Prayer, Member } from "@/types/database"

type Language = "zh-Hant" | "zh-Hans"

const translations = {
  "zh-Hant": {
    greeting: "主恩常伴",
    brother: "弟兄",
    sister: "姊妹",
    newFriends: "本週新增福音朋友",
    sheepNeedCare: "本週需晨興小羊",
    recentActivity: "近期牧養動態",
    focusPrayer: "焦點代禱",
    amen: "阿們",
    home: "首頁",
    targets: "名單",
    materials: "資源",
    prayers: "代禱",
    selectLevel: "選擇管理層級",
    logout: "登出",
    loading: "載入中...",
  },
  "zh-Hans": {
    greeting: "主恩常伴",
    brother: "弟兄",
    sister: "姊妹",
    newFriends: "本周新增福音朋友",
    sheepNeedCare: "本周需晨兴小羊",
    recentActivity: "近期牧养动态",
    focusPrayer: "焦点代祷",
    amen: "阿们",
    home: "首页",
    targets: "名单",
    materials: "资源",
    prayers: "代祷",
    selectLevel: "选择管理层级",
    logout: "登出",
    loading: "载入中...",
  },
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

export default function HomePage() {
  const [lang, setLang] = useState<Language>("zh-Hant")
  const [selectedHierarchy, setSelectedHierarchy] = useState<{ id: string; name: Record<Language, string> } | null>(null)
  const [gospelCount, setGospelCount] = useState(0)
  const [newBelieverCount, setNewBelieverCount] = useState(0)

  const { user, profile, loading: userLoading, signOut } = useUser()
  const { ids: hierarchyIds } = useUserHierarchyIds(profile?.id)
  const { activities, loading: activitiesLoading } = useActivities(hierarchyIds, 5)
  const { prayers, loading: prayersLoading } = usePrayers(hierarchyIds)
  const { prayedIds, toggleAmen } = useAmenActions(user?.id ?? "")
  const t = translations[lang]

  useEffect(() => {
    const fetchStats = async () => {
      if (hierarchyIds.length === 0) return

      const { createClient } = await import("@/lib/supabase")
      const supabase = createClient()

      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

      const { count: gospel } = await supabase
        .from("members")
        .select("*", { count: "exact", head: true })
        .eq("type", "gospel")
        .in("hierarchy_id", hierarchyIds)
        .gte("created_at", oneWeekAgo.toISOString())

      const { count: believer } = await supabase
        .from("members")
        .select("*", { count: "exact", head: true })
        .eq("type", "new_believer")
        .in("hierarchy_id", hierarchyIds)
        .gte("created_at", oneWeekAgo.toISOString())

      setGospelCount(gospel || 0)
      setNewBelieverCount(believer || 0)
    }

    fetchStats()
  }, [hierarchyIds])

  const getInitials = (name: string) => {
    return name.charAt(0)
  }

  const pathname = usePathname()

  const navItems = [
    { id: "home", icon: Home, label: t.home, href: "/" },
    { id: "targets", icon: Users, label: t.targets, href: "/targets" },
    { id: "materials", icon: BookOpen, label: t.materials, href: "/materials" },
    { id: "prayers", icon: Heart, label: t.prayers, href: "/prayers" },
  ]

  const isActive = (href: string) => pathname === href

  // Redirect to login if auth check completes but no user found
  useEffect(() => {
    if (!userLoading && !user) {
      window.location.href = "/login"
    }
  }, [userLoading, user])

  if (userLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">{t.loading}</p>
      </div>
    )
  }

  const focusPrayer = prayers.find((p) => p.category === "gospel" || p.is_urgent)

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <Sun className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">牧養管理</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLang(lang === "zh-Hant" ? "zh-Hans" : "zh-Hant")}
              className="text-sm font-medium"
            >
              {lang === "zh-Hant" ? "繁/簡" : "简/繁"}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="w-8 h-8 cursor-pointer">
                  <AvatarImage src={profile?.avatar_url || ""} />
                  <AvatarFallback className="bg-primary/10 text-primary text-sm">
                    {profile?.name?.charAt(0) || "用"}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="text-destructive" onClick={signOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  {t.logout}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="px-4 py-5 space-y-5">
        <section className="space-y-3">
          <h1 className="text-xl font-semibold text-foreground">
            {t.greeting}，<span className="text-primary">{profile?.name || "用戶"}</span>
          </h1>
        </section>

        <section className="grid grid-cols-2 gap-3">
          <Card className="bg-card border-border overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <UserPlus className="w-5 h-5 text-primary" />
                </div>
              </div>
              <p className="text-3xl font-bold text-foreground mb-1">{gospelCount}</p>
              <p className="text-sm text-muted-foreground leading-tight">
                {t.newFriends}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
                  <Sun className="w-5 h-5 text-primary" />
                </div>
              </div>
              <p className="text-3xl font-bold text-foreground mb-1">{newBelieverCount}</p>
              <p className="text-sm text-muted-foreground leading-tight">
                {t.sheepNeedCare}
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">{t.recentActivity}</h2>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              {activitiesLoading ? (
                <p className="text-sm text-muted-foreground">{t.loading}</p>
              ) : activities.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {lang === "zh-Hant" ? "暫無活動記錄" : "暂无活动记录"}
                </p>
              ) : (
                <div className="space-y-4">
                  {activities.map((activity, index) => (
                    <div key={activity.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <Avatar className="w-10 h-10 border-2 border-primary/20">
                          <AvatarImage src={activity.user?.avatar_url || ""} />
                          <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                            {activity.user?.name?.charAt(0) || "用"}
                          </AvatarFallback>
                        </Avatar>
                        {index < activities.length - 1 && (
                          <div className="w-0.5 flex-1 bg-border mt-2 min-h-[20px]" />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-muted-foreground">
                            {formatTimeAgo(activity.created_at, lang)}
                          </span>
                          {activity.member && (
                            <Badge
                              variant="secondary"
                              className="text-xs py-0 px-2 bg-accent text-accent-foreground"
                            >
                              {activity.member.name_zh_hant}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-foreground leading-relaxed">
                          {lang === "zh-Hant"
                            ? activity.description_zh_hant
                            : activity.description_zh_hans}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {focusPrayer && (
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">{t.focusPrayer}</h2>
            <Card className="bg-card border-border overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Badge
                    variant="secondary"
                    className="text-xs py-0.5 px-2 bg-primary/10 text-primary"
                  >
                    {focusPrayer.hierarchy?.name_zh_hant || "代禱"}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {lang === "zh-Hant" ? "今日更新" : "今日更新"}
                  </span>
                </div>
                <p className="text-sm text-foreground leading-relaxed mb-4">
                  {lang === "zh-Hant" ? focusPrayer.content_zh_hant : focusPrayer.content_zh_hans}
                </p>
                <div className="flex justify-end">
                  <Button
                    variant={prayedIds.has(focusPrayer.id) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleAmen(focusPrayer.id)}
                    className={`gap-2 ${
                      prayedIds.has(focusPrayer.id)
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-primary/10 hover:text-primary"
                    }`}
                  >
                    <Heart
                      className={`w-4 h-4 ${prayedIds.has(focusPrayer.id) ? "fill-current" : ""}`}
                    />
                    {t.amen} ({focusPrayer.amen_count || 0})
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>
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
    </div>
  )
}
