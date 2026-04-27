"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Home,
  Users,
  BookOpen,
  Heart,
  Search,
  Plus,
  ChevronDown,
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
import { BottomNavigation } from "@/components/layout/BottomNavigation"
import { MemberFormDialog } from "@/components/members/member-form-dialog"
import { useMembers } from "@/hooks/use-members"
import { useHierarchies } from "@/hooks/use-hierarchies"

type Language = "zh-Hant" | "zh-Hans"
type MemberType = "gospel" | "new_believer"

const translations = {
  "zh-Hant": {
    search: "搜尋姓名...",
    addNew: "新增對象",
    gospelFriends: "福音朋友",
    newBelievers: "初信小羊",
    all: "全部",
    allGroups: "全部小排",
    lastCare: "上次牧養",
    partner: "配搭",
    loading: "載入中...",
    noMembers: "暫無成員",
  },
  "zh-Hans": {
    search: "搜索姓名...",
    addNew: "新增对象",
    gospelFriends: "福音朋友",
    newBelievers: "初信小羊",
    all: "全部",
    allGroups: "全部小排",
    lastCare: "上次牧养",
    partner: "配搭",
    loading: "载入中...",
    noMembers: "暂无成员",
  },
}

const gospelFilters = {
  "zh-Hant": ["全部", "初接觸", "平安之子", "柔軟敞開", "有尋求"],
  "zh-Hans": ["全部", "初接触", "平安之子", "柔软敞开", "有寻求"],
}

const believerFilters = {
  "zh-Hant": ["全部", "剛受浸", "晨興建立中", "穩定家聚會"],
  "zh-Hans": ["全部", "刚受浸", "晨兴建立中", "稳定家聚会"],
}

const statusColors: Record<string, string> = {
  "初接觸": "bg-slate-100 text-slate-700",
  "初接触": "bg-slate-100 text-slate-700",
  "平安之子": "bg-blue-100 text-blue-700",
  "柔軟敞開": "bg-purple-100 text-purple-700",
  "柔软敞开": "bg-purple-100 text-purple-700",
  "有尋求": "bg-orange-100 text-orange-700",
  "有寻求": "bg-orange-100 text-orange-700",
  "剛受浸": "bg-cyan-100 text-cyan-700",
  "刚受浸": "bg-cyan-100 text-cyan-700",
  "晨興建立中": "bg-amber-100 text-amber-700",
  "晨兴建立中": "bg-amber-100 text-amber-700",
  "穩定家聚會": "bg-emerald-100 text-emerald-700",
  "稳定家聚会": "bg-emerald-100 text-emerald-700",
}

export default function TargetsPage() {
  const [lang, setLang] = useState<Language>("zh-Hant")
  const [memberType, setMemberType] = useState<MemberType>("gospel")
  const [activeFilter, setActiveFilter] = useState(0)
  const [selectedHierarchyId, setSelectedHierarchyId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [memberDialogOpen, setMemberDialogOpen] = useState(false)

  const { hierarchies } = useHierarchies()
  const { data: members = [], isLoading: loading } = useMembers(
    selectedHierarchyId ? [selectedHierarchyId] : undefined
  )

  const t = translations[lang]
  const filters = memberType === "gospel" ? gospelFilters[lang] : believerFilters[lang]

  const filteredMembers = members.filter((member) => {
    if (member.type !== memberType) return false

    if (searchQuery) {
      const name = lang === "zh-Hant" ? member.name_zh_hant : member.name_zh_hans
      if (!name.toLowerCase().includes(searchQuery.toLowerCase())) return false
    }

    if (activeFilter > 0) {
      const filterValue = filters[activeFilter]
      if (member.status !== filterValue) return false
    }

    return true
  })

  const hierarchyGroups = [...new Set(members.map((m) => m.hierarchy_id))]
  const groupOptions = hierarchies.filter((h) => hierarchyGroups.includes(h.id))

  const selectedHierarchy = hierarchies.find((h) => h.id === selectedHierarchyId)

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-lg font-semibold text-foreground">
            {lang === "zh-Hant" ? "名單" : "名单"}
          </h1>
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
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1 shrink-0" onClick={() => setMemberDialogOpen(true)}>
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">{t.addNew}</span>
          </Button>
        </div>

        <div className="bg-muted p-1 rounded-xl flex">
          <button
            onClick={() => {
              setMemberType("gospel")
              setActiveFilter(0)
            }}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
              memberType === "gospel"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.gospelFriends}
          </button>
          <button
            onClick={() => {
              setMemberType("new_believer")
              setActiveFilter(0)
            }}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
              memberType === "new_believer"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.newBelievers}
          </button>
        </div>

        <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
          <div className="flex gap-2 pb-1">
            {filters.map((filter, index) => (
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
                {selectedHierarchy
                  ? (lang === "zh-Hant" ? selectedHierarchy.name_zh_hant : selectedHierarchy.name_zh_hans)
                  : t.allGroups}
              </span>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[calc(100vw-2rem)]">
            <DropdownMenuItem
              onClick={() => setSelectedHierarchyId(null)}
              className={selectedHierarchyId === null ? "bg-accent text-accent-foreground" : ""}
            >
              {t.allGroups}
            </DropdownMenuItem>
            {groupOptions.map((group) => (
              <DropdownMenuItem
                key={group.id}
                onClick={() => setSelectedHierarchyId(group.id)}
                className={
                  selectedHierarchyId === group.id
                    ? "bg-accent text-accent-foreground"
                    : ""
                }
              >
                {lang === "zh-Hant" ? group.name_zh_hant : group.name_zh_hans}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {loading ? (
          <p className="text-center text-muted-foreground py-8">{t.loading}</p>
        ) : filteredMembers.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">{t.noMembers}</p>
        ) : (
          <div className="space-y-3">
            {filteredMembers.map((member) => (
              <Link key={member.id} href={`/targets/${member.id}`}>
                <Card className="bg-card border-border shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="w-12 h-12 border-2 border-primary/20 shrink-0">
                        <AvatarImage src={member.avatar_url || ""} alt={member.name_zh_hant} />
                        <AvatarFallback className="bg-primary/10 text-primary text-lg font-medium">
                          {(lang === "zh-Hant" ? member.name_zh_hant : member.name_zh_hans).charAt(0)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="font-semibold text-foreground truncate">
                              {lang === "zh-Hant" ? member.name_zh_hant : member.name_zh_hans}
                            </h3>
                            {member.assigned_to_profile && (
                              <p className="text-sm text-muted-foreground mt-0.5">
                                {t.partner}：{member.assigned_to_profile.name}
                              </p>
                            )}
                          </div>

                          {member.status && (
                            <Badge
                              className={`shrink-0 text-xs font-medium ${
                                statusColors[member.status] || "bg-muted text-muted-foreground"
                              }`}
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
            ))}
          </div>
        )}
      </main>

      <MemberFormDialog
        open={memberDialogOpen}
        onOpenChange={setMemberDialogOpen}
        onSuccess={() => {}}
      />

      <BottomNavigation lang={lang} />
    </div>
  )
}