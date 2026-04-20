'use client'

import { useState } from "react"
import { FormDialog } from "@/components/ui/form-dialog"
import { InputField, TextareaField } from "@/components/ui/form-field"
import { SelectField } from "@/components/ui/select-field"
import { createClient } from "@/lib/supabase"

interface PrayerFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  hierarchyId?: string
  memberId?: string
  onSuccess?: () => void
}

const categoryOptions = [
  { value: "gospel", label: "福音朋友" },
  { value: "new_believers", label: "初信小羊" },
  { value: "family", label: "家庭" },
  { value: "serving", label: "服事" },
  { value: "urgent", label: "緊急" },
]

export function PrayerFormDialog({
  open,
  onOpenChange,
  hierarchyId = "",
  memberId,
  onSuccess,
}: PrayerFormDialogProps) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title_zh_hant: "",
    title_zh_hans: "",
    content_zh_hant: "",
    content_zh_hans: "",
    category: "gospel",
    is_urgent: false,
    hierarchy_id: hierarchyId,
  })

  const handleSubmit = async () => {
    if (!form.title_zh_hant.trim() || !form.content_zh_hant.trim()) return

    setLoading(true)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      await supabase.from("prayers").insert({
        title_zh_hant: form.title_zh_hant,
        title_zh_hans: form.title_zh_hans || form.title_zh_hant,
        content_zh_hant: form.content_zh_hant,
        content_zh_hans: form.content_zh_hans || form.content_zh_hant,
        category: form.category as "gospel" | "new_believers" | "family" | "serving" | "urgent",
        is_urgent: form.is_urgent,
        hierarchy_id: form.hierarchy_id || user?.id,
        posted_by: user?.id,
      })

      setForm({
        title_zh_hant: "",
        title_zh_hans: "",
        content_zh_hant: "",
        content_zh_hans: "",
        category: "gospel",
        is_urgent: false,
        hierarchy_id: hierarchyId,
      })
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      console.error("Failed to create prayer:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="發起代禱"
      description="分享代禱事項"
      onSubmit={handleSubmit}
      submitLabel="發布"
      loading={loading}
    >
      <InputField
        label="標題"
        value={form.title_zh_hant}
        onChange={(e) => setForm({ ...form, title_zh_hant: e.target.value })}
        placeholder="請輸入代禱標題"
      />

      <TextareaField
        label="代禱內容"
        value={form.content_zh_hant}
        onChange={(e) => setForm({ ...form, content_zh_hant: e.target.value })}
        placeholder="請輸入代禱事項詳情..."
      />

      <SelectField
        label="分類"
        value={form.category}
        onValueChange={(v) => setForm({ ...form, category: v })}
        options={categoryOptions}
      />
    </FormDialog>
  )
}
