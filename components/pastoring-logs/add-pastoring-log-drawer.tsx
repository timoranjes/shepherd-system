"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Calendar, Megaphone, Home, Sun, BookOpen, Users, Heart, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/components/ui/drawer"
import { createPastoringLog } from "@/actions/pastoring-log"
import { pastoringLogSchema, logTypeOptions } from "@/lib/schemas/pastoring-log"
import type { PastoringLogFormValues } from "@/lib/schemas/pastoring-log"
import { toast } from "sonner"

type Language = "zh-Hant" | "zh-Hans"

interface AddPastoringLogDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  memberId: string
  targetName: string
  lang: Language
  onSuccess?: () => void
}

const translations = {
  "zh-Hant": {
    title: "新增牧養紀錄",
    recordingFor: "正在記錄與",
    fellowship: "的交通",
    dateLabel: "日期",
    today: "今天",
    actionTypeLabel: "牧養類型",
    summaryLabel: "交通與蒙恩摘要",
    summaryPlaceholder: "請簡述今日的交通內容、對方的反應、或是你的蒙恩摸著...",
    submit: "提交紀錄",
    submitting: "提交中...",
  },
  "zh-Hans": {
    title: "新增牧养记录",
    recordingFor: "正在记录与",
    fellowship: "的交通",
    dateLabel: "日期",
    today: "今天",
    actionTypeLabel: "牧养类型",
    summaryLabel: "交通与蒙恩摘要",
    summaryPlaceholder: "请简述今日的交通内容、对方的反应、或是你的蒙恩摸着...",
    submit: "提交记录",
    submitting: "提交中...",
  },
}

const actionTypeIcons: Record<string, typeof Megaphone> = {
  gospel: Megaphone,
  visitation: Users,
  home_meeting: Home,
  morning_revival: Sun,
  reading_together: BookOpen,
  love_feast: Heart,
}

export function AddPastoringLogDrawer({
  open,
  onOpenChange,
  memberId,
  targetName,
  lang,
  onSuccess,
}: AddPastoringLogDrawerProps) {
  const t = translations[lang]
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<PastoringLogFormValues>({
    resolver: zodResolver(pastoringLogSchema),
    defaultValues: {
      action_date: new Date().toISOString().split("T")[0],
      type: "home_meeting",
      summary_zh_hant: "",
      summary_zh_hans: "",
    },
  })

  const selectedType = watch("type")

  const onSubmit = async (data: PastoringLogFormValues) => {
    setSubmitting(true)
    try {
      const result = await createPastoringLog(memberId, data)
      if (result.success) {
        toast.success(lang === "zh-Hant" ? "已新增牧養紀錄" : "已新增牧养记录")
        onOpenChange(false)
        reset()
        onSuccess?.()
      } else {
        toast.error(result.error || "提交失敗")
      }
    } catch {
      toast.error("提交失敗，請重試")
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, "0")
    const day = String(d.getDate()).padStart(2, "0")
    return `${year}/${month}/${day}`
  }

  const isToday = (dateStr: string) => {
    const today = new Date().toISOString().split("T")[0]
    return dateStr === today
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <div className="mx-auto w-full max-w-md overflow-y-auto">
          <DrawerHeader className="pt-6 pb-4">
            <DrawerTitle className="text-xl font-bold text-foreground text-center">
              {t.title}
            </DrawerTitle>
            <DrawerDescription className="text-center">
              {t.recordingFor}{" "}
              <span className="text-primary font-medium">[{targetName}]</span>{" "}
              {t.fellowship}
            </DrawerDescription>
          </DrawerHeader>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="px-6 pb-4 space-y-6">
              {/* Date Selector */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  {t.dateLabel}
                </label>
                <div className="relative">
                  <input
                    type="date"
                    {...register("action_date")}
                    className="w-full px-4 py-3 pr-12 bg-card border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  />
                  <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                </div>
                {isToday(watch("action_date")) && (
                  <p className="text-xs text-muted-foreground">
                    {t.today} ({formatDate(watch("action_date"))})
                  </p>
                )}
                {errors.action_date && (
                  <p className="text-xs text-destructive">{errors.action_date.message}</p>
                )}
              </div>

              {/* Action Type 3x2 Grid Buttons */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  {t.actionTypeLabel}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {logTypeOptions.map((option) => {
                    const Icon = actionTypeIcons[option.value]
                    const isSelected = selectedType === option.value

                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setValue("type", option.value as PastoringLogFormValues["type"], { shouldValidate: true })}
                        className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border transition-all ${
                          isSelected
                            ? "bg-emerald-50 border-emerald-600 text-emerald-700"
                            : "bg-card border-border text-muted-foreground hover:border-muted-foreground/50"
                        }`}
                      >
                        <Icon
                          className={`w-5 h-5 ${
                            isSelected ? "text-emerald-600" : "text-current"
                          }`}
                        />
                        <span className="text-xs font-medium">{option.label}</span>
                      </button>
                    )
                  })}
                </div>
                {errors.type && (
                  <p className="text-xs text-destructive">{errors.type.message}</p>
                )}
              </div>

              {/* Summary Textarea */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  {t.summaryLabel}
                </label>
                <Textarea
                  {...register("summary_zh_hant")}
                  placeholder={t.summaryPlaceholder}
                  className="min-h-[140px] resize-none bg-card border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                {errors.summary_zh_hant && (
                  <p className="text-xs text-destructive">{errors.summary_zh_hant.message}</p>
                )}
              </div>
            </div>

            <DrawerFooter className="px-6 pb-8">
              <Button
                type="submit"
                disabled={submitting}
                className="w-full py-6 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t.submitting}
                  </>
                ) : (
                  t.submit
                )}
              </Button>
            </DrawerFooter>
          </form>
        </div>
      </DrawerContent>
    </Drawer>
  )
}