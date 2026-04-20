"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home,
  Users,
  BookOpen,
  Heart,
  Search,
  Plus,
  ChevronDown,
  ArrowLeftRight,
  MapPin,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useMembers } from "@/hooks/use-members"
import { useHierarchies, useUserHierarchyIds } from "@/hooks/use-hierarchies"
import { MemberFormDialog } from "@/components/members/member-form-dialog"
import { TransferDialog } from "@/components/members/transfer-dialog"
import type { Member } from "@/types/database"

type Language = "zh-Hant" | "zh-Hans"
type TargetType = "gospel" | "new_believer"

const translations = {
  "zh-Hant": {
    search: "搜尋姓名...",
    addNew: "新增對象",
    gospelFriends: "福音朋友",
    newBelievers: "初信小羊",
    home: "首頁",
    targets: "名單",
    materials: "資源",
    prayers: "代禱",
    all: "全部",
    lastCare: "上次牧養",
    partner: "配搭",
    transfer: "轉交/轉排",
    swipeHint: "左滑查看更多操作",
    loading: "載入中...",
  },
  "zh-Hans": {
    search: "搜索姓名...",
    addNew: "新增对象",
    gospelFriends: "福音朋友",
    newBelievers: "初信小羊",
    home: "首页",
    targets: "名单",
    materials: "资源",
    prayers: "代祷",
    all: "全部",
    lastCare: "上次牧养",
    partner: "配搭",
    transfer: "转交/转排",
    swipeHint: "左滑查看更多操作",
    loading: "载入中...",
  },
}

const statusColors: Record<string, { bg: string; text: string }> = {
  "初接觸": { bg: "bg-slate-100", text: "text-slate-700" },
  "初接触": { bg: "bg-slate-100", text: "text-slate-700" },
  "平安之子": { bg: "bg-blue-100", text: "text-blue-700" },
  "柔軟敞開": { bg: "bg-purple-100", text: "text-purple-700" },
  "柔软敞开": { bg: "bg-purple-100", text: "text-purple-700" },
  "有尋求": { bg: "bg-orange-100", text: "text-orange-700" },
  "有寻求": { bg: "bg-orange-100", text: "text-orange-700" },
  "剛受浸": { bg: "bg-cyan-100", text: "text-cyan-700" },
  "刚受浸": { bg: "bg-cyan-100", text: "text-cyan-700" },
  "晨興建立中": { bg: "bg-amber-100", text: "text-amber-700" },
  "晨兴建立中": { bg: "bg-amber-100", text: "text-amber-700" },
  "穩定家聚會": { bg: "bg-emerald-100", text: "text-emerald-700" },
  "稳定家聚会": { bg: "bg-emerald-100", text: "text-emerald-700" },
}

function getStatusColor(status?: string) {
  if (!status) return "bg-muted text-muted-foreground"
  const colors = statusColors[status]
  return colors ? `${colors.bg} ${colors.text}` : "bg-muted text-muted-foreground"
}

function formatLastCare(dateString?: string, lang: Language = "zh-Hant"): string {
  if (!dateString) return lang === "zh-Hant" ? "未記錄" : "未记录"
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffDays === 0) return lang === "zh-Hant" ? "今天" : "今天"
  if (diffDays === 1) return lang === "zh-Hant" ? "昨天" : "昨天"
  if (diffDays < 7) return lang === "zh-Hant" ? `${diffDays}天前` : `${diffDays}天前`
  if (diffDays < 30) return lang === "zh-Hant" ? `${Math.floor(diffDays / 7)}週前` : `${Math.floor(diffDays / 7)}周前`
  return lang === "zh-Hant" ? `${Math.floor(diffDays / 30)}個月前` : `${Math.floor(diffDays / 30)}个月前`
}

export default function TargetsPage() {
  const [lang, setLang] = useState<Language>("zh-Hant")
  const [targetType, setTargetType] = useState<TargetType>("gospel")
  const [activeFilter, setActiveFilter] = useState(0)
  const [selectedGroup, setSelectedGroup] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [memberDialogOpen, setMemberDialogOpen] = useState(false)
  const [transferDialogOpen, setTransferDialogOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)

  const pathname = usePathname()
  const { ids: hierarchyIds } = useUserHierarchyIds(undefined)
  const { members, loading } = useMembers(hierarchyIds)
  const { hierarchies, getHierarchyTree } = useHierarchies()

  const { groups } = getHierarchyTree()

  const t = translations[lang]

  const filters = {
    gospel: lang === "zh-Hant"
      ? ["全部", "初接觸", "平安之子", "柔軟敞開", "有尋求"]
      : ["全部", "初接触", "平安之子", "柔软敞开", "有寻求"],
    new_believer: lang === "zh-Hant"
      ? ["全部", "剛受浸", "晨興建立中", "穩定家聚會"]
      : ["全部", "刚受浸", "晨兴建立中", "稳定家聚会"],
  }

  const groupOptions = {
    gospel: groups.map((g) => lang === "zh-Hant" ? g.name_zh_hant : g.name_zh_hans),
    new_believer: groups.map((g) => lang === "zh-Hant" ? g.name_zh_hant : g.name_zh_hans),
  }

  const allGroupOptions = [lang === "zh-Hant" ? "全部小排" : "全部小排", ...groupOptions.gospel]

  const filteredMembers = members
    .filter((m) => m.type === targetType)
    .filter((m) => {
      if (activeFilter === 0) return true
      const statusList = targetType === "gospel"
        ? ["初接觸", "初接触", "平安之子", "柔軟敞開", "柔软敞开", "有尋求", "有寻求"]
        : ["剛受浸", "刚受浸", "晨興建立中", "晨兴建立中", "穩定家聚會", "稳定家聚会"]
      return m.status === statusList[activeFilter]
    })
    .filter((m) => {
      if (!searchQuery) return true
      const query = searchQuery.toLowerCase()
      const nameHant = m.name_zh_hant.toLowerCase()
      const nameHans = m.name_zh_hans.toLowerCase()
      return nameHant.includes(query) || nameHans.includes(query)
    })
    .filter((m) => {
      if (selectedGroup === 0) return true
      const selectedHierarchy = groups[selectedGroup - 1]
      if (!selectedHierarchy) return true
      return m.hierarchy_id === selectedHierarchy.id
    })

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
          <h1 className="text-lg font-semibold text-foreground">{t.targets}</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLang(lang === "zh-Hant" ? "zh-Hans" : "zh-Hant")}
            className="text-sm font-medium"
          >
            {lang === "zh-Hant" ? "繁/簡" : "简/繁"}
          </Button>
        </div>
      </header>

      <main className="px-4 py-4 space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder={t.search}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-card border-border"
            />
          </div>
          <Button
            type="button"
            className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1 shrink-0"
            onClick={() => setMemberDialogOpen(true)}
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">{t.addNew}</span>
          </Button>
        </div>

        <div className="bg-muted p-1 rounded-xl flex">
          <button
            onClick={() => { setTargetType("gospel"); setActiveFilter(0) }}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
              targetType === "gospel"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.gospelFriends}
          </button>
          <button
            onClick={() => { setTargetType("new_believer"); setActiveFilter(0) }}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
              targetType === "new_believer"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.newBelievers}
          </button>
        </div>

        <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
          <div className="flex gap-2 pb-1">
            {filters[targetType].map((filter, index) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(index)}
                className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  activeFilter === index
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/50"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-between bg-card hover:bg-accent"
            >
              <span className="text-sm">
                {allGroupOptions[selectedGroup]}
              </span>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[calc(100vw-2rem)]">
            {allGroupOptions.map((group, index) => (
              <DropdownMenuItem
                key={group}
                onClick={() => setSelectedGroup(index)}
                className={selectedGroup === index ? "bg-accent text-accent-foreground" : ""}
              >
                {group}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <p className="text-xs text-muted-foreground text-center">
          {t.swipeHint}
        </p>

        {loading ? (
          <p className="text-center text-muted-foreground py-8">{t.loading}</p>
        ) : filteredMembers.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            {lang === "zh-Hant" ? "暫無對象" : "暂无对象"}
          </p>
        ) : (
          <div className="space-y-3">
            {filteredMembers.map((member, index) => (
              <div
                key={member.id}
                className="relative overflow-hidden rounded-xl"
              >
                <div
                  className="absolute right-0 top-0 bottom-0 w-24 bg-primary flex items-center justify-center rounded-r-xl cursor-pointer"
                  onClick={() => {
                    setSelectedMember(member)
                    setTransferDialogOpen(true)
                  }}
                >
                  <div className="flex flex-col items-center gap-1 text-primary-foreground">
                    <ArrowLeftRight className="w-5 h-5" />
                    <span className="text-xs font-medium">{t.transfer}</span>
                  </div>
                </div>

                <Link href={`/targets/${member.id}`}>
                  <Card
                    className={`bg-card border-border shadow-sm relative transition-transform ${
                      index === 0 ? "-translate-x-12" : ""
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Avatar className="w-12 h-12 border-2 border-primary/20 shrink-0">
                          <AvatarImage src={member.avatar_url || ""} />
                          <AvatarFallback className="bg-primary/10 text-primary text-lg font-medium">
                            {member.name_zh_hant.charAt(0)}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <h3 className="font-semibold text-foreground truncate">
                                {lang === "zh-Hant" ? member.name_zh_hant : member.name_zh_hans}
                              </h3>
                              <p className="text-sm text-muted-foreground mt-0.5">
                                {t.lastCare}：{formatLastCare(undefined, lang)}
                              </p>
                              {member.assigned_to_profile && (
                                <p className="text-sm text-muted-foreground">
                                  {t.partner}：{member.assigned_to_profile.name}
                                </p>
                              )}
                            </div>

                            {member.status && (
                              <Badge
                                className={`shrink-0 text-xs font-medium ${getStatusColor(member.status)}`}
                              >
                                {member.status}
                              </Badge>
                            )}
                          </div>

                          {member.hierarchy && (
                            <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                              <MapPin className="w-3 h-3" />
                              <span>
                                {lang === "zh-Hant"
                                  ? member.hierarchy.name_zh_hant
                                  : member.hierarchy.name_zh_hans}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            ))}
          </div>
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

      <MemberFormDialog
        open={memberDialogOpen}
        onOpenChange={setMemberDialogOpen}
        hierarchyIds={hierarchyIds}
      />

      <TransferDialog
        open={transferDialogOpen}
        onOpenChange={setTransferDialogOpen}
        member={selectedMember}
      />
    </div>
  )
}
