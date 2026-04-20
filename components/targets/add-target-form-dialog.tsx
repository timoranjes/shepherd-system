"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FormDialog } from "@/components/ui/form-dialog"
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
import { cn } from "@/lib/utils"

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
      gender: "" as "男" | "女",
      age_group: "" as "青少年" | "大專" | "青職" | "壯年" | "年長",
      phone: "",
      category: "" as "gospel_friend" | "little_sheep",
      status: "",
      structure_id: hierarchyId || "",
      notes: "",
    },
    mode: "onChange",
  })

  const { reset, watch } = form
  const watchCategory = watch("category")

  useEffect(() => {
    if (open) {
      reset({
        name: "",
        gender: "" as "男" | "女",
        age_group: "" as "青少年" | "大專" | "青職" | "壯年" | "年長",
        phone: "",
        category: "" as "gospel_friend" | "little_sheep",
        status: "",
        structure_id: hierarchyId || "",
        notes: "",
      })
    }
  }, [open, hierarchyId, reset])

  useEffect(() => {
    if (watchCategory) {
      form.setValue("status", "")
    }
  }, [watchCategory, form])

  const category = watch("category")
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
      <Form {...form}>
        <div className="space-y-4">
          <div className="rounded-lg bg-muted/50 p-3 space-y-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              基本資料
            </p>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>姓名</FormLabel>
                  <FormControl>
                    <Input placeholder="請輸入姓名" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>性別</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="選擇性別" />
                        </SelectTrigger>
                        <SelectContent>
                          {genderOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="age_group"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>年齡段</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="選擇年齡" />
                        </SelectTrigger>
                        <SelectContent>
                          {ageGroupOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>聯絡電話</FormLabel>
                  <FormControl>
                    <Input placeholder="選填" type="tel" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="rounded-lg bg-muted/50 p-3 space-y-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              靈程與類別
            </p>

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>照顧類別</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={(v) => {
                        field.onChange(v)
                        form.setValue("status", "")
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="選擇類別" />
                      </SelectTrigger>
                      <SelectContent>
                        {categoryOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>當前狀態</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={!category}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            category ? "選擇狀態" : "請先選擇類別"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <p className="text-xs text-muted-foreground">
              {category === "gospel_friend" &&
                "福音朋友：初接觸 → 平安之子 → 柔軟敞開 → 有尋求"}
              {category === "little_sheep" &&
                "初信小羊：剛受浸 → 晨興建立中 → 穩定家聚會 → 穩定主日"}
            </p>
          </div>

          <div className="rounded-lg bg-muted/50 p-3 space-y-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              組織架構與備註
            </p>

            <FormField
              control={form.control}
              name="structure_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>所屬小排/分區</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="選擇小排" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockStructureOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>背景備註與代禱事項</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="請填寫對方的背景、目前靈程傾向或代禱需求..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </Form>
    </FormDialog>
  )
}
