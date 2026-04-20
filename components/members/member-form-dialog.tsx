'use client'

import { useState, useEffect } from "react"
import { FormDialog } from "@/components/ui/form-dialog"
import { InputField, TextareaField } from "@/components/ui/form-field"
import { SelectField } from "@/components/ui/select-field"
import { createClient } from "@/lib/supabase"
import type { Member, Hierarchy } from "@/types/database"

type Language = "zh-Hant" | "zh-Hans"

interface MemberFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  member?: Member | null
  hierarchyIds?: string[]
  onSuccess?: () => void
}

const statusOptions = {
  gospel: [
    { value: "初接觸", label: "初接觸" },
    { value: "平安之子", label: "平安之子" },
    { value: "柔軟敞開", label: "柔軟敞開" },
    { value: "有尋求", label: "有尋求" },
  ],
  new_believer: [
    { value: "剛受浸", label: "剛受浸" },
    { value: "晨興建立中", label: "晨興建立中" },
    { value: "穩定家聚會", label: "穩定家聚會" },
  ],
}

const typeOptions = [
  { value: "gospel", label: "福音朋友" },
  { value: "new_believer", label: "初信小羊" },
]

export function MemberFormDialog({
  open,
  onOpenChange,
  member,
  hierarchyIds = [],
  onSuccess,
}: MemberFormDialogProps) {
  const [loading, setLoading] = useState(false)
  const [hierarchies, setHierarchies] = useState<Hierarchy[]>([])
  const [form, setForm] = useState({
    name_zh_hant: "",
    name_zh_hans: "",
    phone: "",
    address_zh_hant: "",
    address_zh_hans: "",
    occupation_zh_hant: "",
    occupation_zh_hans: "",
    birthday: "",
    notes_zh_hant: "",
    notes_zh_hans: "",
    type: "gospel" as "gospel" | "new_believer",
    status: "",
    hierarchy_id: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const isEdit = !!member

  useEffect(() => {
    const fetchHierarchies = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from("hierarchies")
        .select("*")
        .eq("level", "group")
        .order("sort_order")

      if (data) {
        setHierarchies(data)
      }
    }

    if (open) {
      fetchHierarchies()
    }
  }, [open])

  useEffect(() => {
    if (member) {
      setForm({
        name_zh_hant: member.name_zh_hant,
        name_zh_hans: member.name_zh_hans,
        phone: member.phone || "",
        address_zh_hant: member.address_zh_hant || "",
        address_zh_hans: member.address_zh_hans || "",
        occupation_zh_hant: member.occupation_zh_hant || "",
        occupation_zh_hans: member.occupation_zh_hans || "",
        birthday: member.birthday || "",
        notes_zh_hant: member.notes_zh_hant || "",
        notes_zh_hans: member.notes_zh_hans || "",
        type: member.type,
        status: member.status || "",
        hierarchy_id: member.hierarchy_id,
      })
    } else {
      setForm({
        name_zh_hant: "",
        name_zh_hans: "",
        phone: "",
        address_zh_hant: "",
        address_zh_hans: "",
        occupation_zh_hant: "",
        occupation_zh_hans: "",
        birthday: "",
        notes_zh_hant: "",
        notes_zh_hans: "",
        type: "gospel",
        status: "",
        hierarchy_id: hierarchyIds[0] || "",
      })
    }
    setErrors({})
  }, [member, hierarchyIds, open])

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {}

    if (!form.name_zh_hant.trim()) {
      newErrors.name_zh_hant = "姓名為必填欄位"
    }

    if (!form.hierarchy_id) {
      newErrors.hierarchy_id = "小排為必填欄位"
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length > 0) {
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      const payload = {
        name_zh_hant: form.name_zh_hant,
        name_zh_hans: form.name_zh_hans || form.name_zh_hant,
        phone: form.phone || null,
        address_zh_hant: form.address_zh_hant || null,
        address_zh_hans: form.address_zh_hans || null,
        occupation_zh_hant: form.occupation_zh_hant || null,
        occupation_zh_hans: form.occupation_zh_hans || null,
        birthday: form.birthday || null,
        notes_zh_hant: form.notes_zh_hant || null,
        notes_zh_hans: form.notes_zh_hans || null,
        type: form.type,
        status: form.status || null,
        hierarchy_id: form.hierarchy_id,
      }

      if (isEdit && member) {
        await supabase
          .from("members")
          .update(payload)
          .eq("id", member.id)
      } else {
        await supabase
          .from("members")
          .insert({
            ...payload,
            created_by: user?.id,
            assigned_to: user?.id,
          })
      }

      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      console.error("Failed to save member:", error)
    } finally {
      setLoading(false)
    }
  }

  const hierarchyOptions = hierarchies.map((h) => ({
    value: h.id,
    label: h.name_zh_hant,
  }))

  const currentStatusOptions = statusOptions[form.type] || statusOptions.gospel

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "編輯對象" : "新增對象"}
      description={isEdit ? "修改對象資料" : "新增福音朋友或初信小羊"}
      onSubmit={handleSubmit}
      submitLabel={isEdit ? "儲存" : "新增"}
      loading={loading}
    >
      <InputField
        label="姓名（繁體）"
        value={form.name_zh_hant}
        onChange={(e) => setForm({ ...form, name_zh_hant: e.target.value })}
        error={errors.name_zh_hant}
        placeholder="請輸入姓名"
      />

      <InputField
        label="姓名（簡體）"
        value={form.name_zh_hans}
        onChange={(e) => setForm({ ...form, name_zh_hans: e.target.value })}
        placeholder="請輸入姓名"
      />

      <SelectField
        label="類型"
        value={form.type}
        onValueChange={(v) => setForm({ ...form, type: v as "gospel" | "new_believer", status: "" })}
        options={typeOptions}
      />

      <SelectField
        label="小排"
        value={form.hierarchy_id}
        onValueChange={(v) => setForm({ ...form, hierarchy_id: v })}
        options={hierarchyOptions}
        placeholder="選擇小排"
        error={errors.hierarchy_id}
      />

      <SelectField
        label="狀態"
        value={form.status}
        onValueChange={(v) => setForm({ ...form, status: v })}
        options={currentStatusOptions}
        placeholder="選擇狀態"
      />

      <InputField
        label="電話"
        value={form.phone}
        onChange={(e) => setForm({ ...form, phone: e.target.value })}
        placeholder="請輸入電話"
        type="tel"
      />

      <InputField
        label="地址"
        value={form.address_zh_hant}
        onChange={(e) => setForm({ ...form, address_zh_hant: e.target.value })}
        placeholder="請輸入地址"
      />

      <InputField
        label="職業"
        value={form.occupation_zh_hant}
        onChange={(e) => setForm({ ...form, occupation_zh_hant: e.target.value })}
        placeholder="請輸入職業"
      />

      <InputField
        label="生日"
        value={form.birthday}
        onChange={(e) => setForm({ ...form, birthday: e.target.value })}
        placeholder="YYYY-MM-DD"
        type="date"
      />

      <TextareaField
        label="備註"
        value={form.notes_zh_hant}
        onChange={(e) => setForm({ ...form, notes_zh_hant: e.target.value })}
        placeholder="請輸入備註"
      />
    </FormDialog>
  )
}
