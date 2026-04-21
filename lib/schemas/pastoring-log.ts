import { z } from "zod"

export const pastoringLogSchema = z.object({
  action_date: z.string().min(1, "日期為必填"),
  type: z.enum(["gospel", "visitation", "home_meeting", "morning_revival", "reading_together", "love_feast"], {
    required_error: "牧養類型為必填",
  }),
  summary_zh_hant: z.string().min(5, "摘要至少需要 5 個字元"),
  summary_zh_hans: z.string().optional(),
})

export type PastoringLogFormValues = z.infer<typeof pastoringLogSchema>

export const logTypeOptions = [
  { value: "gospel", label: "傳福音", icon: "Megaphone" },
  { value: "visitation", label: "探訪", icon: "Users" },
  { value: "home_meeting", label: "家聚會", icon: "Home" },
  { value: "morning_revival", label: "晨興", icon: "Sun" },
  { value: "reading_together", label: "陪讀", icon: "BookOpen" },
  { value: "love_feast", label: "愛筵", icon: "Heart" },
] as const