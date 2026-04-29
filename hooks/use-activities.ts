"use client"

import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase"
import type { Activity } from "@/types/database"

/**
 * Fetch activities for the current user (RLS auto-filters by user)
 * No hierarchy filtering needed - Supabase RLS handles it
 */
export function useActivities(limit = 10) {
  return useQuery({
    queryKey: ["activities", limit],
    queryFn: async () => {
      const supabase = createClient()
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