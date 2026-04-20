import { z } from "zod"

export const careTargetSchema = z.object({
  name: z.string().min(2, "姓名至少需要 2 個字元"),
  gender: z.enum(["男", "女"], { required_error: "性別為必填欄位" }),
  age_group: z.enum(["青少年", "大專", "青職", "壯年", "年長"], {
    required_error: "年齡段為必填欄位",
  }),
  phone: z.string().optional(),

  category: z.enum(["gospel_friend", "little_sheep"], {
    required_error: "照顧類別為必填欄位",
  }),
  status: z.string().min(1, "狀態為必填欄位"),

  structure_id: z.string().min(1, "所屬小排為必填欄位"),
  notes: z.string().optional(),
}).refine(
  (data) => {
    if (data.category === "gospel_friend") {
      return ["new_contact", "son_of_peace", "open", "seeking"].includes(data.status)
    }
    if (data.category === "little_sheep") {
      return ["newly_baptized", "morning_revival", "home_meeting", "lord_day"].includes(data.status)
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
  { value: "new_contact", label: "初接觸" },
  { value: "son_of_peace", label: "平安之子" },
  { value: "open", label: "柔軟敞開" },
  { value: "seeking", label: "有尋求" },
] as const

export const littleSheepStatusOptions = [
  { value: "newly_baptized", label: "剛受浸" },
  { value: "morning_revival", label: "晨興建立中" },
  { value: "home_meeting", label: "穩定家聚會" },
  { value: "lord_day", label: "穩定主日" },
] as const

export const genderOptions = [
  { value: "男", label: "男" },
  { value: "女", label: "女" },
] as const

export const ageGroupOptions = [
  { value: "青少年", label: "青少年" },
  { value: "大專", label: "大專" },
  { value: "青職", label: "青職" },
  { value: "壯年", label: "壯年" },
  { value: "年長", label: "年長" },
] as const
