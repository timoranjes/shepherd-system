"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase"
import type { Prayer } from "@/types/database"

/**
 * Fetch prayers (shared resource - all users can see)
 * No hierarchy filtering needed
 */
export function usePrayers(category?: string) {
  return useQuery({
    queryKey: ["prayers", category],
    queryFn: async () => {
      const supabase = createClient()
      let query = supabase
        .from("prayers")
        .select(`
          *,
          posted_by_profile:profiles!prayers_posted_by_fkey(id, name, avatar_url)
        `)
        .order("created_at", { ascending: false })

      if (category && category !== "all") {
        query = query.eq("category", category)
      }

      const { data, error } = await query
      if (error) throw error
      return data as Prayer[]
    },
  })
}

export function useAmenActions(userId: string) {
  const queryClient = useQueryClient()

  const { data: prayedIds = [] } = useQuery({
    queryKey: ["amenActions", userId],
    queryFn: async () => {
      if (!userId) return []
      const supabase = createClient()
      const { data } = await supabase
        .from("amen_actions")
        .select("prayer_id")
        .eq("user_id", userId)
      return data?.map((a) => a.prayer_id) || []
    },
    enabled: !!userId,
  })

  const toggleAmen = useMutation({
    mutationFn: async (prayerId: string) => {
      const supabase = createClient()
      const isPrayed = prayedIds.includes(prayerId)

      if (isPrayed) {
        await supabase
          .from("amen_actions")
          .delete()
          .eq("prayer_id", prayerId)
          .eq("user_id", userId)
      } else {
        await supabase
          .from("amen_actions")
          .insert({ prayer_id: prayerId, user_id: userId })
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["amenActions", userId] })
      queryClient.invalidateQueries({ queryKey: ["prayers"] })
    },
  })

  return {
    prayedIds: new Set(prayedIds),
    toggleAmen: toggleAmen.mutateAsync,
  }
}