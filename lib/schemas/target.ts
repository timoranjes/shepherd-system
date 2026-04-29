import { z } from "zod"

export const careTargetSchema = z.object({
  name: z.string().min(2, "姓名至少需要 2 個字元"),
  gender: z.enum(["男", "女"], { required_error: "性別為必填欄位" }),
  category: z.enum(["gospel_friend", "little_sheep"], {
    required_error: "照顧類別為必填欄位",
  }),
  status: z.string().min(1, "狀態為必填欄位"),
  life_stage: z.enum(["兒童", "中學生", "大專生", "青職", "壯年", "年長"]).optional(),
  source: z.enum(["熟人介紹", "街頭接觸", "校園福音", "網絡接觸", "其他"]).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  birthday: z.string().optional(),
  notes: z.string().optional(),
}).refine(
  (data) => {
    if (data.category === "gospel_friend") {
      return ["first_contact", "warm_contact", "home_meeting", "ready_baptism"].includes(data.status)
    }
    if (data.category === "little_sheep") {
      return ["newly_baptized", "morning_revival", "stable_group", "stable_lord_day"].includes(data.status)
    }
    return false
  },
  {
    message: "請選擇有效的狀態選項",
    path: ["status"],
  }
)

export type CareTargetFormValues = z.infer<typeof careTargetSchema>

export const categoryOptions = [
  { value: "gospel_friend", label: "福音朋友" },
  { value: "little_sheep", label: "初信小羊" },
] as const

export const gospelFriendStatusOptions = [
  { value: "first_contact", label: "初接觸" },
  { value: "warm_contact", label: "保持聯繫" },
  { value: "home_meeting", label: "福音家聚會" },
  { value: "ready_baptism", label: "渴慕受浸" },
] as const

export const littleSheepStatusOptions = [
  { value: "newly_baptized", label: "剛受浸" },
  { value: "morning_revival", label: "晨興建立中" },
  { value: "stable_group", label: "穩定排聚會" },
  { value: "stable_lord_day", label: "穩定主日" },
] as const

export const genderOptions = [
  { value: "男", label: "男" },
  { value: "女", label: "女" },
] as const

export const lifeStageOptions = [
  { value: "兒童", label: "兒童" },
  { value: "中學生", label: "中學生" },
  { value: "大專生", label: "大專生" },
  { value: "青職", label: "青職" },
  { value: "壯年", label: "壯年" },
  { value: "年長", label: "年長" },
] as const

export const sourceOptions = [
  { value: "熟人介紹", label: "熟人介紹" },
  { value: "街頭接觸", label: "街頭接觸" },
  { value: "校園福音", label: "校園福音" },
  { value: "網絡接觸", label: "網絡接觸" },
  { value: "其他", label: "其他" },
] as const

export const statusLabels: Record<string, { "zh-Hant": string; "zh-Hans": string }> = {
  first_contact: { "zh-Hant": "初接觸", "zh-Hans": "初接触" },
  warm_contact: { "zh-Hant": "保持聯繫", "zh-Hans": "保持联系" },
  home_meeting: { "zh-Hant": "福音家聚會", "zh-Hans": "福音家聚会" },
  ready_baptism: { "zh-Hant": "渴慕受浸", "zh-Hans": "渴慕受浸" },
  newly_baptized: { "zh-Hant": "剛受浸", "zh-Hans": "刚受浸" },
  morning_revival: { "zh-Hant": "晨興建立中", "zh-Hans": "晨兴建立中" },
  stable_group: { "zh-Hant": "穩定排聚會", "zh-Hans": "稳定排聚会" },
  stable_lord_day: { "zh-Hant": "穩定主日", "zh-Hans": "稳定主日" },
}
