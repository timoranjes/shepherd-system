"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Search,
  Plus,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Header } from "@/components/layout/Header"
import { BottomNavigation } from "@/components/layout/BottomNavigation"
import { FilterDrawer } from "@/components/targets/filter-drawer"
import { MemberFormDialog } from "@/components/members/member-form-dialog"
import { useMembers } from "@/hooks/use-members"
import { useLanguage } from "@/contexts/language-context"
import { statusLabels } from "@/lib/schemas/target"

type MemberType = "gospel" | "new_believer"

interface FilterState {
  status: string[]
  gender: string[]
  lifeStage: string[]
}

const translations = {
  "zh-Hant": {
    search: "搜尋姓名...",
    addNew: "新增對象",
    gospelFriends: "福音朋友",
    newBelievers: "初信小羊",
    partner: "配搭",
    noMembers: "暫無成員",
  },
  "zh-Hans": {
    search: "搜索姓名...",
    addNew: "新增对象",
    gospelFriends: "福音朋友",
    newBelievers: "初信小羊",
    partner: "配搭",
    noMembers: "暂无成员",
  },
}

// Status colors for visual distinction (using English keys)
const statusColors: Record<string, string> = {
  first_contact: "bg-slate-100 text-slate-700",
  warm_contact: "bg-blue-100 text-blue-700",
  home_meeting: "bg-purple-100 text-purple-700",
  ready_baptism: "bg-orange-100 text-orange-700",
  newly_baptized: "bg-cyan-100 text-cyan-700",
  morning_revival: "bg-amber-100 text-amber-700",
  stable_group: "bg-emerald-100 text-emerald-700",
  stable_lord_day: "bg-teal-100 text-teal-700",
}

// Loading skeleton for member card
function MemberCardSkeleton() {
  return (
    <Card className="bg-card border-border shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Skeleton className="w-12 h-12 rounded-full shrink-0" />
          <div className="flex-1 min-w-0 space-y-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-5 w-16 rounded-full shrink-0" />
        </div>
      </CardContent>
    </Card>
  )
}

export default function TargetsPage() {
  const { language } = useLanguage()
  const [memberType, setMemberType] = useState<MemberType>("gospel")
  const [searchQuery, setSearchQuery] = useState("")
  const [memberDialogOpen, setMemberDialogOpen] = useState(false)
  const [filters, setFilters] = useState<FilterState>({
    status: [],
    gender: [],
    lifeStage: [],
  })

  const { data: members = [], isLoading: loading } = useMembers()

  const t = translations[language]

  // Helper to get status label in current language
  const getStatusLabel = (statusKey: string) => {
    return statusLabels[statusKey]?.[language] || statusKey
  }

  // Filter members based on type, search, and filter state
  const filteredMembers = members.filter((member) => {
    // Filter by member type
    if (member.type !== memberType) return false

    // Filter by search query
    if (searchQuery) {
      const name = language === "zh-Hant" ? member.name_zh_hant : member.name_zh_hans
      if (!name.toLowerCase().includes(searchQuery.toLowerCase())) return false
    }

    // Filter by status (if any selected)
    if (filters.status.length > 0) {
      // Member status could be English key or Chinese string
      // Check both formats
      const memberStatusKey = member.status
      const memberStatusLabel = member.status ? getStatusLabel(member.status) : ""
      
      const matchesStatus = filters.status.some((filterStatus) => {
        // Match by English key
        if (memberStatusKey === filterStatus) return true
        // Match by Chinese label
        if (memberStatusLabel === getStatusLabel(filterStatus)) return true
        return false
      })
      
      if (!matchesStatus) return false
    }

    // Filter by gender (if any selected)
    if (filters.gender.length > 0 && member.gender) {
      if (!filters.gender.includes(member.gender)) return false
    }

    // Filter by life stage (if any selected)
    if (filters.lifeStage.length > 0 && member.life_stage) {
      if (!filters.lifeStage.includes(member.life_stage)) return false
    }

    return true
  })

  // Handle filter changes from FilterDrawer
  const handleApplyFilters = (newFilters: FilterState) => {
    setFilters(newFilters)
  }

  // Count active filters for badge display
  const activeFilterCount =
    filters.status.length + filters.gender.length + filters.lifeStage.length

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header />

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
          <FilterDrawer
            lang={language}
            memberType={memberType}
            onApplyFilters={handleApplyFilters}
            currentFilters={filters}
          />
          <Button
            className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1 shrink-0"
            onClick={() => setMemberDialogOpen(true)}
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">{t.addNew}</span>
          </Button>
        </div>

        {/* Segmented control for gospel/new_believer - KEEP AS IS */}
        <div className="bg-muted p-1 rounded-xl flex">
          <button
            onClick={() => {
              setMemberType("gospel")
              setFilters({ status: [], gender: [], lifeStage: [] })
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
              setFilters({ status: [], gender: [], lifeStage: [] })
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

        {/* Active filters indicator */}
        {activeFilterCount > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>
              {language === "zh-Hant" ? "已篩選" : "已筛选"} {activeFilterCount} {language === "zh-Hant" ? "項條件" : "项条件"}
            </span>
          </div>
        )}

        {/* Member list with loading skeleton */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <MemberCardSkeleton key={i} />
            ))}
          </div>
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
                          {(language === "zh-Hant" ? member.name_zh_hant : member.name_zh_hans).charAt(0)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="font-semibold text-foreground truncate">
                              {language === "zh-Hant" ? member.name_zh_hant : member.name_zh_hans}
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
                              {getStatusLabel(member.status)}
                            </Badge>
                          )}
                        </div>
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

      <BottomNavigation />
    </div>
  )
}