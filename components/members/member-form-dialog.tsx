'use client'

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { FormDialog } from "@/components/ui/form-dialog"
import { InputField, TextareaField } from "@/components/ui/form-field"
import { SelectField } from "@/components/ui/select-field"
import { createClient } from "@/lib/supabase"
import { toast } from "sonner"
import { careTargetSchema, type CareTargetFormValues } from "@/lib/schemas/target"
import {
  categoryOptions,
  gospelFriendStatusOptions,
  littleSheepStatusOptions,
  genderOptions,
  lifeStageOptions,
  sourceOptions,
  mockStructureOptions,
} from "@/lib/schemas/target"
import type { Member } from "@/types/database"

interface MemberFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  member?: Member | null
  hierarchyIds?: string[]
  onSuccess?: () => void
}

export function MemberFormDialog({
  open,
  onOpenChange,
  member,
  onSuccess,
}: MemberFormDialogProps) {
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CareTargetFormValues>({
    resolver: zodResolver(careTargetSchema),
    defaultValues: {
      name: "",
      gender: undefined,
      category: "gospel_friend",
      structure_id: "",
      status: "",
      life_stage: undefined,
      source: undefined,
      phone: "",
      address: "",
      birthday: "",
      notes: "",
    },
  })

  const category = watch("category")
  const isEdit = !!member

  useEffect(() => {
    if (member) {
      reset({
        name: member.name_zh_hant || member.name_zh_hans || "",
        gender: member.gender,
        category: member.type === "gospel" ? "gospel_friend" : "little_sheep",
        structure_id: member.hierarchy_id || "",
        status: member.status || "",
        life_stage: member.life_stage,
        source: member.source,
        phone: member.phone || "",
        address: member.address_zh_hant || member.address_zh_hans || "",
        birthday: member.birthday || "",
        notes: member.notes_zh_hant || member.notes_zh_hans || "",
      })
    } else {
      reset({
        name: "",
        gender: undefined,
        category: "gospel_friend",
        structure_id: "",
        status: "",
        life_stage: undefined,
        source: undefined,
        phone: "",
        address: "",
        birthday: "",
        notes: "",
      })
    }
  }, [member, open, reset])

  const statusOptions = category === "gospel_friend" ? gospelFriendStatusOptions : littleSheepStatusOptions

  useEffect(() => {
    setValue("status", "", { shouldValidate: false })
  }, [category, setValue])

  const onSubmit = async (data: CareTargetFormValues) => {
    setLoading(true)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      const payload = {
        name_zh_hant: data.name,
        name_zh_hans: data.name,
        gender: data.gender || null,
        phone: data.phone || null,
        address_zh_hant: data.address || null,
        address_zh_hans: data.address || null,
        occupation_zh_hant: null,
        occupation_zh_hans: null,
        life_stage: data.life_stage || null,
        source: data.source || null,
        birthday: data.birthday || null,
        notes_zh_hant: data.notes || null,
        notes_zh_hans: data.notes || null,
        type: data.category === "gospel_friend" ? "gospel" : "new_believer",
        status: data.status || null,
        hierarchy_id: data.structure_id,
      }

      if (isEdit && member) {
        const { error } = await supabase
          .from("members")
          .update(payload)
          .eq("id", member.id)
        if (error) throw error
        toast.success("已更新")
      } else {
        const { error } = await supabase
          .from("members")
          .insert({
            ...payload,
            created_by: user?.id,
            assigned_to: user?.id,
          })
        if (error) throw error
        toast.success("已新增")
      }

      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      console.error("Failed to save member:", error)
      toast.error(error instanceof Error ? error.message : "儲存失敗")
    } finally {
      setLoading(false)
    }
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "編輯對象" : "新增對象"}
      description={isEdit ? "修改對象資料" : "新增福音朋友或初信小羊"}
      onSubmit={handleSubmit(onSubmit)}
      submitLabel={isEdit ? "儲存" : "新增"}
      loading={loading}
    >
      <InputField
        label="姓名"
        {...register("name")}
        error={errors.name?.message}
        placeholder="請輸入姓名"
      />

      <SelectField
        label="性別"
        value={watch("gender") || ""}
        onValueChange={(v) => setValue("gender", v as "男" | "女", { shouldValidate: true })}
        options={genderOptions}
        placeholder="選擇性別"
        error={errors.gender?.message}
      />

      <SelectField
        label="類型"
        value={watch("category")}
        onValueChange={(v) => setValue("category", v as "gospel_friend" | "little_sheep", { shouldValidate: true })}
        options={categoryOptions}
        error={errors.category?.message}
      />

      <SelectField
        label="小排"
        value={watch("structure_id")}
        onValueChange={(v) => setValue("structure_id", v, { shouldValidate: true })}
        options={mockStructureOptions}
        placeholder="選擇小排"
        error={errors.structure_id?.message}
      />

      <SelectField
        label="狀態"
        value={watch("status")}
        onValueChange={(v) => setValue("status", v, { shouldValidate: true })}
        options={statusOptions}
        placeholder="選擇狀態"
        error={errors.status?.message}
      />

      <SelectField
        label="身分階段 (選填)"
        value={watch("life_stage") || ""}
        onValueChange={(v) => setValue("life_stage", v as CareTargetFormValues["life_stage"], { shouldValidate: true })}
        options={lifeStageOptions}
        placeholder="選擇身分階段"
        error={errors.life_stage?.message}
      />

      <SelectField
        label="接觸來源 (選填)"
        value={watch("source") || ""}
        onValueChange={(v) => setValue("source", v as CareTargetFormValues["source"], { shouldValidate: true })}
        options={sourceOptions}
        placeholder="選擇接觸來源"
        error={errors.source?.message}
      />

      <InputField
        label="電話 (選填)"
        {...register("phone")}
        placeholder="請輸入電話"
        type="tel"
        error={errors.phone?.message}
      />

      <InputField
        label="地址 (選填)"
        {...register("address")}
        placeholder="請輸入地址"
        error={errors.address?.message}
      />

      <InputField
        label="生日 (選填)"
        {...register("birthday")}
        placeholder="YYYY-MM-DD"
        type="date"
        error={errors.birthday?.message}
      />

      <TextareaField
        label="備註 (選填)"
        {...register("notes")}
        placeholder="請輸入備註"
        error={errors.notes?.message}
      />
    </FormDialog>
  )
}
