"use client"

import { useState } from "react"
import {
  Phone,
  MessageCircle,
  Pencil,
  Megaphone,
  Home,
  Sun,
  BookOpen,
  Plus,
  Heart,
  Trash2,
  Users,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Header } from "@/components/layout/Header"
import { BottomNavigation } from "@/components/layout/BottomNavigation"
import { useMember, usePastoringLogs } from "@/hooks/use-members"
import { useUser } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"
import { AddPastoringLogDrawer } from "@/components/pastoring-logs/add-pastoring-log-drawer"
import { PrayerFormDialog } from "@/components/prayers/prayer-form-dialog"
import { createClient } from "@/lib/supabase"
import { toast } from "sonner"
import type { PastoringLog } from "@/types/database"

const translations = {
  "zh-Hant": {
    back: "返回",
    basicInfo: "基本資料",
    pastoringLogs: "牧養紀錄",
    addLog: "填寫牧養紀錄",
    requestPrayer: "發起代禱",
    call: "撥打電話",
    whatsapp: "WhatsApp",
    edit: "編輯資料",
    partner: "配搭聖徒",
    summary: "交通與蒙恩摘要",
    name: "姓名",
    phone: "電話",
    address: "地址",
    occupation: "職業",
    birthday: "生日",
    notes: "備註",
    noLogs: "暫無牧養紀錄",
    deleteMember: "刪除",
    deleteLog: "刪除紀錄",
    notFound: "找不到對象",
    confirmDeleteMember: "確定要刪除此對象嗎？此操作無法復原。",
    confirmDeleteLog: "確定要刪除此牧養紀錄嗎？",
    deleted: "已刪除",
  },
  "zh-Hans": {
    back: "返回",
    basicInfo: "基本资料",
    pastoringLogs: "牧养记录",
    addLog: "填写牧养记录",
    requestPrayer: "发起代祷",
    call: "拨打电话",
    whatsapp: "WhatsApp",
    edit: "编辑资料",
    partner: "配搭圣徒",
    summary: "交通与蒙恩摘要",
    name: "姓名",
    phone: "电话",
    address: "地址",
    occupation: "职业",
    birthday: "生日",
    notes: "备注",
    noLogs: "暂无牧养记录",
    deleteMember: "删除",
    deleteLog: "删除记录",
    notFound: "找不到对象",
    confirmDeleteMember: "确定要删除此对象吗？此操作无法还原。",
    confirmDeleteLog: "确定要删除此牧养记录吗？",
    deleted: "已删除",
  },
}

const logTypes = {
  gospel_preaching: { icon: Megaphone, color: "text-orange-500", bg: "bg-orange-100" },
  home_meeting: { icon: Home, color: "text-blue-500", bg: "bg-blue-100" },
  morning_revival: { icon: Sun, color: "text-amber-500", bg: "bg-amber-100" },
  reading_together: { icon: BookOpen, color: "text-emerald-500", bg: "bg-emerald-100" },
  visitation: { icon: Users, color: "text-teal-500", bg: "bg-teal-100" },
  love_feast: { icon: Heart, color: "text-pink-500", bg: "bg-pink-100" },
}

const logTypeLabels = {
  gospel_preaching: { "zh-Hant": "傳福音", "zh-Hans": "传福音" },
  home_meeting: { "zh-Hant": "家聚會", "zh-Hans": "家聚会" },
  morning_revival: { "zh-Hant": "晨興", "zh-Hans": "晨兴" },
  reading_together: { "zh-Hant": "陪讀", "zh-Hans": "陪读" },
  visitation: { "zh-Hant": "探訪", "zh-Hans": "探访" },
  love_feast: { "zh-Hant": "愛筵", "zh-Hans": "爱筵" },
}

const statusColors: Record<string, string> = {
  "有尋求": "bg-orange-100 text-orange-700",
  "有寻求": "bg-orange-100 text-orange-700",
  "柔軟敞開": "bg-purple-100 text-purple-700",
  "柔软敞开": "bg-purple-100 text-purple-700",
  "平安之子": "bg-blue-100 text-blue-700",
  "初接觸": "bg-slate-100 text-slate-700",
  "初接触": "bg-slate-100 text-slate-700",
  "剛受浸": "bg-cyan-100 text-cyan-700",
  "刚受浸": "bg-cyan-100 text-cyan-700",
  "晨興建立中": "bg-amber-100 text-amber-700",
  "晨兴建立中": "bg-amber-100 text-amber-700",
  "穩定家聚會": "bg-emerald-100 text-emerald-700",
  "稳定家聚会": "bg-emerald-100 text-emerald-700",
}

function formatDate(dateString: string, lang: "zh-Hant" | "zh-Hans"): string {
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${year}年${month}月${day}日`
}

export default function TargetProfilePage({ params }: { params: { id: string } }) {
  const { language } = useLanguage()
  const [activeTab, setActiveTab] = useState("logs")
  const [memberDialogOpen, setMemberDialogOpen] = useState(false)
  const [logDrawerOpen, setLogDrawerOpen] = useState(false)
  const [prayerDialogOpen, setPrayerDialogOpen] = useState(false)

  const { data: member, isLoading: memberLoading } = useMember(params.id)
  const { data: logs = [], isLoading: logsLoading } = usePastoringLogs(params.id)
  const { user } = useUser()

  const t = translations[language]

  const handleCall = () => {
    if (member?.phone) {
      window.location.href = `tel:${member.phone}`
    }
  }

  const handleWhatsApp = () => {
    if (member?.phone) {
      const cleanPhone = member.phone.replace(/-/g, "")
      window.location.href = `https://wa.me/${cleanPhone}`
    }
  }

  const handleDeleteMember = async () => {
    if (!confirm(t.confirmDeleteMember)) return
    const supabase = createClient()
    const { error } = await supabase.from("members").delete().eq("id", params.id)
    if (error) {
      toast.error(error.message)
      return
    }
    toast.success(t.deleted)
    window.location.href = "/targets"
  }

  const handleDeleteLog = async (logId: string) => {
    if (!confirm(t.confirmDeleteLog)) return
    const supabase = createClient()
    const { error } = await supabase.from("pastoring_logs").delete().eq("id", logId)
    if (error) {
      toast.error(error.message)
      return
    }
    toast.success(t.deleted)
  }

  if (memberLoading) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <Header showBackButton backHref="/targets" backLabel={t.back} />
        
        <main className="px-4 py-5 space-y-5">
          {/* Avatar Skeleton */}
          <section className="flex flex-col items-center text-center space-y-3">
            <Skeleton className="w-24 h-24 rounded-full" />
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-6 w-20 rounded-full" />
            
            {/* Action Buttons Skeleton */}
            <div className="flex items-center gap-6 pt-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex flex-col items-center gap-1.5">
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <Skeleton className="h-3 w-16" />
                </div>
              ))}
            </div>
          </section>

          {/* Tabs Skeleton */}
          <Tabs defaultValue="logs" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-muted p-1 rounded-xl">
              <TabsTrigger value="info" className="rounded-lg">
                {t.basicInfo}
              </TabsTrigger>
              <TabsTrigger value="logs" className="rounded-lg">
                {t.pastoringLogs}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="logs" className="mt-4 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                    {i < 3 && <Skeleton className="w-0.5 h-24" />}
                  </div>
                  <div className="flex-1 pb-6">
                    <Card className="bg-card border-border shadow-sm">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                        <Skeleton className="h-3 w-32 mb-3" />
                        <Skeleton className="h-4 w-full mb-1" />
                        <Skeleton className="h-4 w-3/4" />
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </main>

<BottomNavigation />
      </div>
    )
  }

  if (!member) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Header showBackButton backHref="/targets" backLabel={t.back} />
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-muted-foreground">{t.notFound}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header showBackButton backHref="/targets" backLabel={t.back} />

      <main className="px-4 py-5 space-y-5">
        <section className="flex flex-col items-center text-center space-y-3">
          <Avatar className="w-24 h-24 border-4 border-primary/20">
            <AvatarImage src={member.avatar_url || ""} />
            <AvatarFallback className="bg-primary/10 text-primary text-3xl font-semibold">
              {(language === "zh-Hant" ? member.name_zh_hant : member.name_zh_hans).charAt(0)}
            </AvatarFallback>
          </Avatar>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">
              {language === "zh-Hant" ? member.name_zh_hant : member.name_zh_hans}
            </h1>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              {member.status && (
                <Badge className={`${statusColors[member.status] || "bg-muted text-muted-foreground"} text-sm`}>
                  {member.status}
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center gap-6 pt-2">
            <button onClick={handleCall} className="flex flex-col items-center gap-1.5 group">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Phone className="w-5 h-5 text-primary" />
              </div>
              <span className="text-xs text-muted-foreground">{t.call}</span>
            </button>
            <button onClick={handleWhatsApp} className="flex flex-col items-center gap-1.5 group">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                <MessageCircle className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="text-xs text-muted-foreground">{t.whatsapp}</span>
            </button>
            <button
              className="flex flex-col items-center gap-1.5 group"
              onClick={() => setMemberDialogOpen(true)}
            >
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center group-hover:bg-accent transition-colors">
                <Pencil className="w-5 h-5 text-muted-foreground" />
              </div>
              <span className="text-xs text-muted-foreground">{t.edit}</span>
            </button>
            <button
              className="flex flex-col items-center gap-1.5 group"
              onClick={handleDeleteMember}
            >
              <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center group-hover:bg-destructive/20 transition-colors">
                <Trash2 className="w-5 h-5 text-destructive" />
              </div>
              <span className="text-xs text-destructive">{t.deleteMember}</span>
            </button>
          </div>
        </section>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-muted p-1 rounded-xl">
            <TabsTrigger
              value="info"
              className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm"
            >
              {t.basicInfo}
            </TabsTrigger>
            <TabsTrigger
              value="logs"
              className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm"
            >
              {t.pastoringLogs}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="mt-4">
            <Card className="bg-card border-border">
              <CardContent className="p-4 space-y-4">
                <div className="grid gap-4">
                  <div className="flex justify-between items-start">
                    <span className="text-sm text-muted-foreground">{t.name}</span>
                    <span className="text-sm font-medium text-foreground">
                      {language === "zh-Hant" ? member.name_zh_hant : member.name_zh_hans}
                    </span>
                  </div>
                  <div className="h-px bg-border" />
                  <div className="flex justify-between items-start">
                    <span className="text-sm text-muted-foreground">{t.phone}</span>
                    <span className="text-sm font-medium text-foreground">{member.phone || "-"}</span>
                  </div>
                  <div className="h-px bg-border" />
                  <div className="flex justify-between items-start">
                    <span className="text-sm text-muted-foreground">{t.address}</span>
                    <span className="text-sm font-medium text-foreground text-right max-w-[60%]">
                      {language === "zh-Hant" ? member.address_zh_hant : member.address_zh_hans || "-"}
                    </span>
                  </div>
                  <div className="h-px bg-border" />
                  <div className="flex justify-between items-start">
                    <span className="text-sm text-muted-foreground">{t.occupation}</span>
                    <span className="text-sm font-medium text-foreground">
                      {language === "zh-Hant" ? member.occupation_zh_hant : member.occupation_zh_hans || "-"}
                    </span>
                  </div>
                  <div className="h-px bg-border" />
                  <div className="flex justify-between items-start">
                    <span className="text-sm text-muted-foreground">{t.birthday}</span>
                    <span className="text-sm font-medium text-foreground">{member.birthday || "-"}</span>
                  </div>
                  <div className="h-px bg-border" />
                  <div className="space-y-2">
                    <span className="text-sm text-muted-foreground">{t.notes}</span>
                    <p className="text-sm text-foreground leading-relaxed">
                      {language === "zh-Hant" ? member.notes_zh_hant : member.notes_zh_hans || "-"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs" className="mt-4">
            {logsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                      {i < 3 && <Skeleton className="w-0.5 h-24" />}
                    </div>
                    <div className="flex-1 pb-6">
                      <Card className="bg-card border-border shadow-sm">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-20" />
                          </div>
                          <Skeleton className="h-3 w-32 mb-3" />
                          <Skeleton className="h-4 w-full mb-1" />
                          <Skeleton className="h-4 w-3/4" />
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                ))}
              </div>
            ) : logs.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">{t.noLogs}</p>
            ) : (
              <div className="space-y-0">
                {logs.map((log, index) => {
                  const logType = logTypes[log.action] || logTypes.home_meeting
                  const IconComponent = logType.icon

                  return (
                    <div key={log.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-10 h-10 rounded-full ${logType.bg} flex items-center justify-center shrink-0`}
                        >
                          <IconComponent className={`w-5 h-5 ${logType.color}`} />
                        </div>
                        {index < logs.length - 1 && (
                          <div className="w-0.5 flex-1 bg-border min-h-[24px]" />
                        )}
                      </div>
                      <div className="flex-1 pb-6 relative group">
                        <button
                          onClick={() => handleDeleteLog(log.id)}
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </button>
                        <Card className="bg-card border-border shadow-sm">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-foreground">
                                  {logTypeLabels[log.action]?.[language] || log.action}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {formatDate(log.action_date || log.created_at, language)}
                                </span>
                              </div>
                            </div>
                            {log.partner && (
                              <p className="text-xs text-muted-foreground mb-3">
                                {t.partner}：{log.partner.name}
                              </p>
                            )}
                            <div className="space-y-1">
                              <p className="text-xs font-medium text-muted-foreground">
                                {t.summary}
                              </p>
                              <p className="text-sm text-foreground leading-relaxed">
                                {log.summary}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t border-border z-40 px-4 py-3">
        <div className="flex gap-3 max-w-md mx-auto">
          <Button
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
            onClick={() => setLogDrawerOpen(true)}
          >
            <Plus className="w-4 h-4" />
            {t.addLog}
          </Button>
          <Button
            variant="outline"
            className="flex-1 gap-2 hover:bg-accent"
            onClick={() => setPrayerDialogOpen(true)}
          >
            <Heart className="w-4 h-4" />
            {t.requestPrayer}
          </Button>
        </div>
        <div className="h-safe-area-inset-bottom bg-card" />
      </div>

      <AddPastoringLogDrawer
        open={logDrawerOpen}
        onOpenChange={setLogDrawerOpen}
        memberId={params.id}
        targetName={language === "zh-Hant" ? member.name_zh_hant : member.name_zh_hans}
        lang={language}
        onSuccess={() => {}}
      />

      <PrayerFormDialog
        open={prayerDialogOpen}
        onOpenChange={setPrayerDialogOpen}
        memberId={params.id}
      />

      <BottomNavigation />
    </div>
  )
}