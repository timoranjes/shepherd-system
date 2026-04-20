"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase"
import type { RealtimeChannel } from "@supabase/supabase-js"
import type { Member, PastoringLog } from "@/types/database"

export function useMembers(hierarchyIds?: string[]) {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    const fetchMembers = async () => {
      setLoading(true)
      let query = supabase
        .from("members")
        .select(`
          *,
          hierarchy:hierarchies(id, name_zh_hant, name_zh_hans, level),
          assigned_to_profile:profiles!members_assigned_to_fkey(id, name, avatar_url)
        `)
        .order("created_at", { ascending: false })

      if (hierarchyIds && hierarchyIds.length > 0) {
        query = query.in("hierarchy_id", hierarchyIds)
      }

      const { data, error } = await query
      if (!error && data) {
        setMembers(data)
      }
      setLoading(false)
    }

    fetchMembers()

    const channel: RealtimeChannel = supabase
      .channel("members_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "members" },
        () => {
          fetchMembers()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [hierarchyIds])

  return { members, loading }
}

export function useMember(id: string) {
  const [member, setMember] = useState<Member | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    const fetchMember = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from("members")
        .select(`
          *,
          hierarchy:hierarchies(id, name_zh_hant, name_zh_hans, level),
          assigned_to_profile:profiles!members_assigned_to_fkey(id, name, avatar_url)
        `)
        .eq("id", id)
        .single()

      if (!error && data) {
        setMember(data)
      }
      setLoading(false)
    }

    if (id) fetchMember()
  }, [id])

  return { member, loading }
}

export function usePastoringLogs(memberId: string) {
  const [logs, setLogs] = useState<PastoringLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    const fetchLogs = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from("pastoring_logs")
        .select(`
          *,
          user:profiles!pastoring_logs_user_id_fkey(id, name, avatar_url),
          partner:profiles!pastoring_logs_partner_id_fkey(id, name)
        `)
        .eq("member_id", memberId)
        .order("created_at", { ascending: false })

      if (!error && data) {
        setLogs(data)
      }
      setLoading(false)
    }

    if (memberId) fetchLogs()
  }, [memberId])

  return { logs, loading }
}
