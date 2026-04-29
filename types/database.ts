export interface Profile {
  id: string
  name: string
  email: string
  avatar_url?: string
  role: "admin" | "member"
  gender?: "弟兄" | "姊妹"
  default_avatar?: string
  created_at: string
  updated_at: string
}

export interface Member {
  id: string
  name_zh_hant: string
  name_zh_hans: string
  gender?: "男" | "女"
  phone?: string
  address_zh_hant?: string
  address_zh_hans?: string
  occupation_zh_hant?: string
  occupation_zh_hans?: string
  life_stage?: string
  source?: string
  birthday?: string
  notes_zh_hant?: string
  notes_zh_hans?: string
  avatar_url?: string
  type: "gospel" | "new_believer"
  status?: string
  assigned_to?: string
  created_by?: string
  created_at: string
  updated_at: string
  assigned_to_profile?: Profile
}

export interface PastoringLog {
  id: string
  member_id: string
  user_id: string
  action: "gospel_preaching" | "visitation" | "home_meeting" | "morning_revival" | "reading_together" | "love_feast"
  summary: string
  action_date: string
  partner_id?: string
  created_at: string
  user?: Profile
  partner?: Profile
}

export interface Material {
  id: string
  title_zh_hant: string
  title_zh_hans: string
  category: "gospel" | "new_believer" | "life_course" | "hymns"
  type: "pdf" | "article" | "video" | "audio"
  suitable_for?: string
  cover_color?: string
  file_url?: string
  uploaded_by: string
  created_at: string
  uploader?: Profile
}

export interface Prayer {
  id: string
  title_zh_hant: string
  title_zh_hans: string
  content_zh_hant: string
  content_zh_hans: string
  category: "gospel" | "new_believers" | "family" | "serving" | "urgent"
  is_urgent: boolean
  posted_by: string
  amen_count: number
  created_at: string
  posted_by_profile?: Profile
}

export interface AmenAction {
  id: string
  prayer_id: string
  user_id: string
  created_at: string
}

export interface Activity {
  id: string
  member_id?: string
  user_id: string
  type: string
  description_zh_hant?: string
  description_zh_hans?: string
  created_at: string
  user?: Profile
  member?: Pick<Member, "id" | "name_zh_hant" | "name_zh_hans">
}
