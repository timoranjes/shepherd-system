"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase"
import type { Member, PastoringLog } from "@/types/database"

/**
 * Fetch members for the current user (RLS auto-filters by user)
 * No hierarchy filtering needed - Supabase RLS handles it
 */
export function useMembers() {
  const queryClient = useQueryClient()

  return useQuery({
    queryKey: ["members"],
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("members")
        .select(`
          *,
          assigned_to_profile:profiles!members_assigned_to_fkey(id, name, avatar_url)
        `)
        .order("created_at", { ascending: false })

      if (error) throw error
      return data as Member[]
    },
  })
}

export function useMember(id: string) {
  return useQuery({
    queryKey: ["member", id],
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("members")
        .select(`
          *,
          assigned_to_profile:profiles!members_assigned_to_fkey(id, name, avatar_url)
        `)
        .eq("id", id)
        .single()

      if (error) throw error
      return data as Member
    },
    enabled: !!id,
  })
}

export function usePastoringLogs(memberId: string) {
  return useQuery({
    queryKey: ["pastoringLogs", memberId],
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("pastoring_logs")
        .select(`
          *,
          user:profiles!pastoring_logs_user_id_fkey(id, name, avatar_url),
          partner:profiles!pastoring_logs_partner_id_fkey(id, name)
        `)
        .eq("member_id", memberId)
        .order("created_at", { ascending: false })

      if (error) throw error
      return data as PastoringLog[]
    },
    enabled: !!memberId,
  })
}

export function useInvalidateMembers() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: ["members"] })
}