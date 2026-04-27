"use client"

import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase"
import type { Activity } from "@/types/database"

export function useActivities(hierarchyIds?: string[], limit = 10) {
  return useQuery({
    queryKey: ["activities", hierarchyIds, limit],
    queryFn: async () => {
      const supabase = createClient()

      if (hierarchyIds?.length) {
        const { data: memberData } = await supabase
          .from("members")
          .select("id")
          .in("hierarchy_id", hierarchyIds)

        const memberIds = memberData?.map((m) => m.id) || []

        const { data, error } = await supabase
          .from("activities")
          .select(`
            *,
            user:profiles!activities_user_id_fkey(id, name, avatar_url),
            member:members(id, name_zh_hant, name_zh_hans)
          `)
          .in("member_id", memberIds.length > 0 ? memberIds : ["no-match"])
          .order("created_at", { ascending: false })
          .limit(limit)

        if (error) throw error
        return data as Activity[]
      }

      const { data, error } = await supabase
        .from("activities")
        .select(`
          *,
          user:profiles!activities_user_id_fkey(id, name, avatar_url),
          member:members(id, name_zh_hant, name_zh_hans)
        `)
        .order("created_at", { ascending: false })
        .limit(limit)

      if (error) throw error
      return data as Activity[]
    },
  })
}