"use client"

import { useState, useEffect } from "react"
import { Funnel, X, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerTrigger,
  DrawerClose,
} from "@/components/ui/drawer"
import {
  gospelFriendStatusOptions,
  littleSheepStatusOptions,
  genderOptions,
  lifeStageOptions,
  statusLabels,
} from "@/lib/schemas/target"

type Language = "zh-Hant" | "zh-Hans"

interface FilterState {
  status: string[]
  gender: string[]
  lifeStage: string[]
}

interface FilterDrawerProps {
  lang: Language
  memberType: "gospel" | "new_believer"
  onApplyFilters: (filters: FilterState) => void
  currentFilters?: FilterState
}

const translations = {
  "zh-Hant": {
    title: "篩選條件",
    statusLabel: "狀態",
    genderLabel: "性別",
    lifeStageLabel: "人生階段",
    apply: "應用篩選",
    clear: "清除全部",
    clearAll: "清除所有篩選",
    gospelFriendStatus: "福音朋友狀態",
    littleSheepStatus: "初信小羊狀態",
  },
  "zh-Hans": {
    title: "筛选条件",
    statusLabel: "状态",
    genderLabel: "性别",
    lifeStageLabel: "人生阶段",
    apply: "应用筛选",
    clear: "清除全部",
    clearAll: "清除所有筛选",
    gospelFriendStatus: "福音朋友状态",
    littleSheepStatus: "初信小羊状态",
  },
}

// Status colors for visual distinction
const statusColors: Record<string, { bg: string; text: string; border: string }> = {
  first_contact: { bg: "bg-slate-50", text: "text-slate-700", border: "border-slate-300" },
  warm_contact: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-300" },
  home_meeting: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-300" },
  ready_baptism: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-300" },
  newly_baptized: { bg: "bg-cyan-50", text: "text-cyan-700", border: "border-cyan-300" },
  morning_revival: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-300" },
  stable_group: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-300" },
  stable_lord_day: { bg: "bg-teal-50", text: "text-teal-700", border: "border-teal-300" },
}

// Gender colors
const genderColors: Record<string, { bg: string; text: string; border: string }> = {
  男: { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-300" },
  女: { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-300" },
}

// Life stage colors
const lifeStageColors: Record<string, { bg: string; text: string; border: string }> = {
  兒童: { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-300" },
  中學生: { bg: "bg-green-50", text: "text-green-700", border: "border-green-300" },
  大專生: { bg: "bg-sky-50", text: "text-sky-700", border: "border-sky-300" },
  青職: { bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-300" },
  壯年: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-300" },
  年長: { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-300" },
}

export function FilterDrawer({
  lang,
  memberType,
  onApplyFilters,
  currentFilters,
}: FilterDrawerProps) {
  const t = translations[lang]
  const [open, setOpen] = useState(false)
  const [localFilters, setLocalFilters] = useState<FilterState>(
    currentFilters || { status: [], gender: [], lifeStage: [] }
  )

  // Sync local filters when drawer opens
  useEffect(() => {
    if (open && currentFilters) {
      setLocalFilters(currentFilters)
    }
  }, [open, currentFilters])

  // Get status options based on member type
  const statusOptions =
    memberType === "gospel" ? gospelFriendStatusOptions : littleSheepStatusOptions

  const toggleFilter = (
    category: keyof FilterState,
    value: string
  ) => {
    setLocalFilters((prev) => {
      const current = prev[category]
      const isSelected = current.includes(value)

      return {
        ...prev,
        [category]: isSelected
          ? current.filter((v) => v !== value)
          : [...current, value],
      }
    })
  }

  const clearAllFilters = () => {
    setLocalFilters({ status: [], gender: [], lifeStage: [] })
  }

  const handleApply = () => {
    onApplyFilters(localFilters)
    setOpen(false)
  }

  const hasActiveFilters =
    localFilters.status.length > 0 ||
    localFilters.gender.length > 0 ||
    localFilters.lifeStage.length > 0

  // Get label for status value
  const getStatusLabel = (value: string) => {
    return statusLabels[value]?.[lang] || value
  }

  // Filter button component
  const FilterButton = ({
    value,
    label,
    colors,
    isSelected,
    onClick,
  }: {
    value: string
    label: string
    colors: { bg: string; text: string; border: string }
    isSelected: boolean
    onClick: () => void
  }) => (
    <button
      onClick={onClick}
      className={`relative flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
        isSelected
          ? `${colors.bg} ${colors.text} ${colors.border} border-2 shadow-sm`
          : "bg-card border border-border text-muted-foreground hover:border-muted-foreground/50 hover:bg-muted/50"
      }`}
    >
      {isSelected && (
        <Check className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground rounded-full shadow-sm" />
      )}
      {label}
    </button>
  )

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 shrink-0 relative"
        >
          <Funnel className="w-4 h-4" />
          <span className="hidden sm:inline">{t.title}</span>
          {hasActiveFilters && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center font-bold">
              {localFilters.status.length +
                localFilters.gender.length +
                localFilters.lifeStage.length}
            </span>
          )}
        </Button>
      </DrawerTrigger>

      <DrawerContent className="max-h-[85vh]">
        <div className="mx-auto w-full max-w-md overflow-y-auto">
          <DrawerHeader className="pt-6 pb-4">
            <div className="flex items-center justify-between">
              <DrawerTitle className="text-xl font-bold text-foreground">
                {t.title}
              </DrawerTitle>
              <DrawerClose asChild>
                <button className="p-2 rounded-full hover:bg-muted transition-colors">
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </DrawerClose>
            </div>
          </DrawerHeader>

          <div className="px-6 pb-6 space-y-6">
            {/* Status Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">
                  {memberType === "gospel"
                    ? t.gospelFriendStatus
                    : t.littleSheepStatus}
                </h3>
                {localFilters.status.length > 0 && (
                  <button
                    onClick={() =>
                      setLocalFilters((prev) => ({
                        ...prev,
                        status: [],
                      }))
                    }
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {t.clear}
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {statusOptions.map((option) => (
                  <FilterButton
                    key={option.value}
                    value={option.value}
                    label={getStatusLabel(option.value)}
                    colors={statusColors[option.value] || statusColors.first_contact}
                    isSelected={localFilters.status.includes(option.value)}
                    onClick={() => toggleFilter("status", option.value)}
                  />
                ))}
              </div>
            </div>

            {/* Gender Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">
                  {t.genderLabel}
                </h3>
                {localFilters.gender.length > 0 && (
                  <button
                    onClick={() =>
                      setLocalFilters((prev) => ({
                        ...prev,
                        gender: [],
                      }))
                    }
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {t.clear}
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                {genderOptions.map((option) => (
                  <FilterButton
                    key={option.value}
                    value={option.value}
                    label={option.label}
                    colors={genderColors[option.value]}
                    isSelected={localFilters.gender.includes(option.value)}
                    onClick={() => toggleFilter("gender", option.value)}
                  />
                ))}
              </div>
            </div>

            {/* Life Stage Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">
                  {t.lifeStageLabel}
                </h3>
                {localFilters.lifeStage.length > 0 && (
                  <button
                    onClick={() =>
                      setLocalFilters((prev) => ({
                        ...prev,
                        lifeStage: [],
                      }))
                    }
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {t.clear}
                  </button>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2">
                {lifeStageOptions.map((option) => (
                  <FilterButton
                    key={option.value}
                    value={option.value}
                    label={option.label}
                    colors={lifeStageColors[option.value]}
                    isSelected={localFilters.lifeStage.includes(option.value)}
                    onClick={() => toggleFilter("lifeStage", option.value)}
                  />
                ))}
              </div>
            </div>
          </div>

          <DrawerFooter className="px-6 pb-8 pt-4 border-t border-border bg-card/50">
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={clearAllFilters}
                className="flex-1 py-3 text-sm font-medium"
                disabled={!hasActiveFilters}
              >
                {t.clearAll}
              </Button>
              <Button
                onClick={handleApply}
                className="flex-1 py-3 text-sm font-semibold bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {t.apply}
              </Button>
            </div>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )
}