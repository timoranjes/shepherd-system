"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase"
import type { RealtimeChannel } from "@supabase/supabase-js"
import type { Activity } from "@/types/database"

export function useActivities(hierarchyIds?: string[], limit = 10) {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    const fetchActivities = async () => {
      setLoading(true)

      if (hierarchyIds && hierarchyIds.length > 0) {
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

        if (!error && data) {
          setActivities(data)
        }
      } else {
        const { data, error } = await supabase
          .from("activities")
          .select(`
            *,
            user:profiles!activities_user_id_fkey(id, name, avatar_url),
            member:members(id, name_zh_hant, name_zh_hans)
          `)
          .order("created_at", { ascending: false })
          .limit(limit)

        if (!error && data) {
          setActivities(data)
        }
      }
      setLoading(false)
    }

    fetchActivities()

    const channel: RealtimeChannel = supabase
      .channel("activities_changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "activities" },
        () => {
          fetchActivities()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [hierarchyIds, limit])

  return { activities, loading }
}
