"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { FormDialog } from "@/components/ui/form-dialog"
import { InputField } from "@/components/ui/form-field"
import { TextareaField } from "@/components/ui/form-field"
import { SelectField } from "@/components/ui/select-field"
import {
  careTargetSchema,
  type CareTargetFormValues,
  categoryOptions,
  gospelFriendStatusOptions,
  littleSheepStatusOptions,
  genderOptions,
  ageGroupOptions,
} from "@/lib/schemas/target"
import { createCareTarget } from "@/actions/target"

interface AddTargetFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  hierarchyId?: string
  onSuccess?: () => void
}

const mockStructureOptions = [
  { value: "hierarchy-1", label: "火炭一區 / 青年排" },
  { value: "hierarchy-2", label: "沙田大區 / 大專排" },
  { value: "hierarchy-3", label: "九龍大區 / 青職排" },
  { value: "hierarchy-4", label: "港島大區 / 壯年排" },
]

export function AddTargetFormDialog({
  open,
  onOpenChange,
  hierarchyId,
  onSuccess,
}: AddTargetFormDialogProps) {
  const form = useForm<CareTargetFormValues>({
    resolver: zodResolver(careTargetSchema),
    defaultValues: {
      name: "",
      gender: undefined,
      age_group: undefined,
      phone: "",
      category: undefined,
      status: "",
      structure_id: hierarchyId || "",
      notes: "",
    },
  })

  const { reset, watch, setValue } = form
  const watchCategory = watch("category")

  useEffect(() => {
    if (open) {
      reset({
        name: "",
        gender: undefined,
        age_group: undefined,
        phone: "",
        category: undefined,
        status: "",
        structure_id: hierarchyId || "",
        notes: "",
      })
    }
  }, [open, hierarchyId, reset])

  useEffect(() => {
    if (watchCategory) {
      setValue("status", "")
    }
  }, [watchCategory, setValue])

  const category = form.watch("category")
  const statusOptions =
    category === "gospel_friend"
      ? gospelFriendStatusOptions
      : category === "little_sheep"
        ? littleSheepStatusOptions
        : []

  const onSubmit = async () => {
    const isValid = await form.trigger()
    if (!isValid) return

    const values = form.getValues()
    setValue("status", values.status)

    const result = await createCareTarget(values)

    if (result.success) {
      onOpenChange(false)
      onSuccess?.()
    }
  }

  const {
    formState: { errors, isSubmitting },
  } = form

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="新增照顧對象"
      description="新增福音朋友或初信小羊至您的照顧名單"
      onSubmit={onSubmit}
      submitLabel="新增"
      loading={isSubmitting}
    >
      <div className="space-y-4">
        <div className="rounded-lg bg-muted/50 p-3 space-y-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            基本資料
          </p>
          <InputField
            label="姓名"
            placeholder="請輸入姓名"
            {...form.register("name")}
            error={errors.name?.message}
          />
          <div className="grid grid-cols-2 gap-3">
            <SelectField
              label="性別"
              value={form.watch("gender") || ""}
              onValueChange={(v) => form.setValue("gender", v as "男" | "女")}
              options={[...genderOptions]}
              placeholder="選擇性別"
              error={errors.gender?.message}
            />
            <SelectField
              label="年齡段"
              value={form.watch("age_group") || ""}
              onValueChange={(v) =>
                form.setValue("age_group", v as "青少年" | "大專" | "青職" | "壯年" | "年長")
              }
              options={[...ageGroupOptions]}
              placeholder="選擇年齡"
              error={errors.age_group?.message}
            />
          </div>
          <InputField
            label="聯絡電話"
            placeholder="選填"
            type="tel"
            {...form.register("phone")}
            error={errors.phone?.message}
          />
        </div>

        <div className="rounded-lg bg-muted/50 p-3 space-y-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            靈程與類別
          </p>
          <SelectField
            label="照顧類別"
            value={form.watch("category") || ""}
            onValueChange={(v) => {
              form.setValue("category", v as "gospel_friend" | "little_sheep")
              form.setValue("status", "")
            }}
            options={[...categoryOptions]}
            placeholder="選擇類別"
            error={errors.category?.message}
          />
          <SelectField
            label="當前狀態"
            value={form.watch("status") || ""}
            onValueChange={(v) => form.setValue("status", v)}
            options={[...statusOptions]}
            placeholder={category ? "選擇狀態" : "請先選擇類別"}
            error={errors.status?.message}
          />
          <p className="text-xs text-muted-foreground">
            {category === "gospel_friend" && "福音朋友：初接觸 → 平安之子 → 柔軟敞開 → 有尋求"}
            {category === "little_sheep" && "初信小羊：剛受浸 → 晨興建立中 → 穩定家聚會 → 穩定主日"}
          </p>
        </div>

        <div className="rounded-lg bg-muted/50 p-3 space-y-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            組織架構與備註
          </p>
          <SelectField
            label="所屬小排/分區"
            value={form.watch("structure_id") || ""}
            onValueChange={(v) => form.setValue("structure_id", v)}
            options={mockStructureOptions}
            placeholder="選擇小排"
            error={errors.structure_id?.message}
          />
          <TextareaField
            label="背景備註與代禱事項"
            placeholder="請填寫對方的背景、目前靈程傾向或代禱需求..."
            {...form.register("notes")}
            error={errors.notes?.message}
          />
        </div>
      </div>
    </FormDialog>
  )
}
