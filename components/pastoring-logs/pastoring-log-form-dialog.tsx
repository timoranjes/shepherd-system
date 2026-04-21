'use client'

import { useState } from "react"
import { FormDialog } from "@/components/ui/form-dialog"
import { SelectField } from "@/components/ui/select-field"
import { TextareaField } from "@/components/ui/form-field"
import { createClient } from "@/lib/supabase"
import { toast } from "sonner"

interface PastoringLogFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  memberId: string
  onSuccess?: () => void
}

const logTypeOptions = [
  { value: "gospel", label: "福音接觸" },
  { value: "home_gathering", label: "家聚會" },
  { value: "morning_revival", label: "晨興" },
  { value: "bible_reading", label: "讀經" },
]

export function PastoringLogFormDialog({
  open,
  onOpenChange,
  memberId,
  onSuccess,
}: PastoringLogFormDialogProps) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    type: "gospel",
    summary_zh_hant: "",
    summary_zh_hans: "",
  })

  const handleSubmit = async () => {
    if (!form.summary_zh_hant.trim()) return

    setLoading(true)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      const { error } = await supabase.from("pastoring_logs").insert({
        member_id: memberId,
        user_id: user?.id,
        type: form.type as "gospel" | "home_gathering" | "morning_revival" | "bible_reading",
        summary_zh_hant: form.summary_zh_hant,
        summary_zh_hans: form.summary_zh_hans || form.summary_zh_hant,
      })
      if (error) throw error

      setForm({ type: "gospel", summary_zh_hant: "", summary_zh_hans: "" })
      onOpenChange(false)
      onSuccess?.()
      toast.success("已新增")
    } catch (error) {
      console.error("Failed to add pastoring log:", error)
      toast.error(error instanceof Error ? error.message : "儲存失敗")
    } finally {
      setLoading(false)
    }
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="填寫牧養紀錄"
      description="記錄本次牧養接觸內容"
      onSubmit={handleSubmit}
      submitLabel="儲存"
      loading={loading}
    >
      <SelectField
        label="牧養類型"
        value={form.type}
        onValueChange={(v) => setForm({ ...form, type: v })}
        options={logTypeOptions}
      />

      <TextareaField
        label="交通與蒙恩摘要"
        value={form.summary_zh_hant}
        onChange={(e) => setForm({ ...form, summary_zh_hant: e.target.value })}
        placeholder="請輸入本次牧養內容摘要..."
      />
    </FormDialog>
  )
}
