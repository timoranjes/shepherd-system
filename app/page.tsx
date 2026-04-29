"use client"

import {
  Users,
  BookOpen,
  Heart,
  UserPlus,
  Sun,
  Quote,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Header } from "@/components/layout/Header"
import { BottomNavigation } from "@/components/layout/BottomNavigation"
import { useUser } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"
import { useMembers } from "@/hooks/use-members"
import { useActivities } from "@/hooks/use-activities"
import { usePrayers, useAmenActions } from "@/hooks/use-prayers"

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
    selectLevel: "選擇管理層級",
    today: "今天",
    yesterday: "昨天",
    daysAgo: "天前",
    loading: "載入中...",
    noActivities: "暫無動態",
    noPrayers: "暫無代禱事項",
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
    selectLevel: "选择管理层级",
    today: "今天",
    yesterday: "昨天",
    daysAgo: "天前",
    loading: "载入中...",
    noActivities: "暂无动态",
    noPrayers: "暂无代祷事项",
  },
}

const actionTypeLabels = {
  gospel_preaching: { "zh-Hant": "傳福音", "zh-Hans": "传福音" },
  visitation: { "zh-Hant": "探訪", "zh-Hans": "探访" },
  home_meeting: { "zh-Hant": "家聚會", "zh-Hans": "家聚会" },
  morning_revival: { "zh-Hant": "晨興", "zh-Hans": "晨兴" },
  reading_together: { "zh-Hant": "陪讀", "zh-Hans": "陪读" },
  love_feast: { "zh-Hant": "愛筵", "zh-Hans": "爱筵" },
}

export default function HomePage() {
  const { language } = useLanguage()
  const { profile } = useUser()

  const { data: members = [], isLoading: membersLoading } = useMembers()

  const { data: activities = [], isLoading: activitiesLoading } = useActivities(10)

  const { data: prayers = [], isLoading: prayersLoading } = usePrayers()

  const { prayedIds, toggleAmen } = useAmenActions(profile?.id || "")

  const t = translations[language]

  const greetingName = profile?.name || "訪客"
  const greetingTitle = profile?.gender || t.brother

  const newGospelFriendsThisWeek = members.filter((m) => {
    if (m.type !== "gospel") return false
    const createdAt = new Date(m.created_at)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return createdAt >= weekAgo
  }).length

  const sheepNeedingMorningRevival = members.filter((m) => {
    return m.status === "晨興建立中" || m.status === "晨兴建立中" || m.status === "剛受浸" || m.status === "刚受浸"
  }).length

  const focusPrayer = prayers.find((p) => p.is_urgent) || prayers[0] || null

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

  const formatActivityContent = (activity: typeof activities[0]) => {
    const memberName = language === "zh-Hant"
      ? activity.member?.name_zh_hant
      : activity.member?.name_zh_hans
    const actionLabel = actionTypeLabels[activity.type as keyof typeof actionTypeLabels]?.[language] || activity.type
    const userName = activity.user?.name || ""

    if (language === "zh-Hant") {
      return `${userName}${actionLabel}${memberName ? ` ${memberName}` : ""}`
    }
    return `${userName}${actionLabel}${memberName ? ` ${memberName}` : ""}`
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />

      <main className="px-4 py-5 space-y-5">
        <section className="space-y-3">
          <h1 className="text-xl font-semibold text-foreground">
            {t.greeting}，<span className="text-primary">{greetingName}</span> {greetingTitle}
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
              <p className="text-3xl font-bold text-foreground mb-1">
                {membersLoading ? "-" : newGospelFriendsThisWeek}
              </p>
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
              <p className="text-3xl font-bold text-foreground mb-1">
                {membersLoading ? "-" : sheepNeedingMorningRevival}
              </p>
              <p className="text-sm text-muted-foreground leading-tight">
                {t.sheepNeedCare}
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Scripture Quote Block */}
        <section className="relative">
          <Card className="bg-primary/5 border-primary/20 overflow-hidden">
            <CardContent className="p-5">
              <div className="flex gap-3">
                <Quote className="w-5 h-5 text-primary/60 shrink-0 mt-1" />
                <div className="space-y-2">
                  <p className="text-sm text-foreground/80 leading-relaxed font-serif italic">
                    "務要牧養你們中間神的羣羊，按著神旨意照管他們；不是出於勉強，乃是出於甘心；不是因為貪財，乃是出於樂意；"
                  </p>
                  <p className="text-xs text-primary/70 font-medium text-right">
                    （彼前 5:2）
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">{t.recentActivity}</h2>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              {activitiesLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-3">
                      <Skeleton className="w-10 h-10 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-3 w-16" />
                        <Skeleton className="h-4 w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : activities.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">{t.noActivities}</p>
              ) : (
                <div className="space-y-4">
                  {activities.map((activity, index) => (
                    <div key={activity.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <Avatar className="w-10 h-10 border-2 border-primary/20">
                          <AvatarImage src={activity.user?.avatar_url || ""} alt={activity.user?.name || ""} />
                          <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                            {activity.user?.name?.charAt(0) || "?"}
                          </AvatarFallback>
                        </Avatar>
                        {index < activities.length - 1 && (
                          <div className="w-0.5 flex-1 bg-border mt-2 min-h-[20px]" />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-muted-foreground">
                            {getTimeLabel(activity.created_at)}
                          </span>
                          {activity.member && (
                            <Badge
                              variant="secondary"
                              className="text-xs py-0 px-2 bg-accent text-accent-foreground"
                            >
                              {language === "zh-Hant"
                                ? activity.member.name_zh_hant
                                : activity.member.name_zh_hans}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-foreground leading-relaxed">
                          {formatActivityContent(activity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">{t.focusPrayer}</h2>
          {prayersLoading ? (
            <Card className="bg-card border-border">
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <div className="flex justify-end">
                  <Skeleton className="h-8 w-20" />
                </div>
              </CardContent>
            </Card>
          ) : focusPrayer ? (
            <Card className="bg-card border-border overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs text-muted-foreground">
                    {getTimeLabel(focusPrayer.created_at)}
                  </span>
                </div>
                <p className="text-sm text-foreground leading-relaxed mb-4">
                  {language === "zh-Hant" ? focusPrayer.content_zh_hant : focusPrayer.content_zh_hans}
                </p>
                <div className="flex justify-end">
                  <Button
                    variant={prayedIds.has(focusPrayer.id) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleAmen(focusPrayer.id)}
                    className={`gap-2 ${
                      prayedIds.has(focusPrayer.id)
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-primary/10 hover:text-primary"
                    }`}
                  >
                    <Heart
                      className={`w-4 h-4 ${prayedIds.has(focusPrayer.id) ? "fill-current" : ""}`}
                    />
                    {t.amen} ({focusPrayer.amen_count})
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-card border-border">
              <CardContent className="p-4 text-center text-muted-foreground">
                {t.noPrayers}
              </CardContent>
            </Card>
          )}
        </section>
      </main>

      <BottomNavigation />
    </div>
  )
}