"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import { careTargetSchema, type CareTargetFormValues } from "@/lib/schemas/target"

export async function createCareTarget(
  data: CareTargetFormValues
): Promise<{ success: boolean; error?: string }> {
  try {
    const validatedData = careTargetSchema.parse(data)

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

    const typeMap: Record<string, "gospel" | "new_believer"> = {
      gospel_friend: "gospel",
      little_sheep: "new_believer",
    }

    const { error: insertError } = await supabase.from("members").insert({
      name_zh_hant: validatedData.name,
      name_zh_hans: validatedData.name,
      phone: validatedData.phone || null,
      type: typeMap[validatedData.category],
      status: validatedData.status,
      notes_zh_hant: validatedData.notes || null,
      notes_zh_hans: validatedData.notes || null,
      created_by: user.id,
      assigned_to: user.id,
    })

    if (insertError) {
      console.error("Failed to insert care target:", insertError)
      return { success: false, error: insertError.message }
    }

    revalidatePath("/targets")
    return { success: true }
  } catch (error) {
    console.error("Failed to create care target:", error)
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: "未知錯誤" }
  }
}
