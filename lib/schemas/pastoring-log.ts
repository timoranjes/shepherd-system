import { z } from "zod"

export const pastoringLogSchema = z.object({
  action_date: z.string().min(1, "日期為必填"),
  action: z.enum(["gospel_preaching", "visitation", "home_meeting", "morning_revival", "reading_together", "love_feast"], {
    required_error: "牧養類型為必填",
  }),
  summary: z.string().min(5, "摘要至少需要 5 個字元"),
})

export type PastoringLogFormValues = z.infer<typeof pastoringLogSchema>

export const actionTypeOptions = [
  { value: "gospel_preaching", label: "傳福音" },
  { value: "visitation", label: "探訪" },
  { value: "home_meeting", label: "家聚會" },
  { value: "morning_revival", label: "晨興" },
  { value: "reading_together", label: "陪讀" },
  { value: "love_feast", label: "愛筵" },
] as const