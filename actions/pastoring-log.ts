"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import { pastoringLogSchema, type PastoringLogFormValues } from "@/lib/schemas/pastoring-log"

export async function createPastoringLog(
  memberId: string,
  data: PastoringLogFormValues
): Promise<{ success: boolean; error?: string }> {
  try {
    const validatedData = pastoringLogSchema.parse(data)

    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
            }
          },
        },
      }
    )
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "使用者未登入" }
    }

    const { error: insertError } = await supabase.from("pastoring_logs").insert({
      member_id: memberId,
      user_id: user.id,
      action: validatedData.action,
      summary: validatedData.summary,
      action_date: validatedData.action_date,
    })

    if (insertError) {
      console.error("Failed to insert pastoring log:", insertError)
      return { success: false, error: insertError.message }
    }

    revalidatePath(`/targets/${memberId}`)
    return { success: true }
  } catch (error) {
    console.error("Failed to create pastoring log:", error)
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: "未知錯誤" }
  }
}