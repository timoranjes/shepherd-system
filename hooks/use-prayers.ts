"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase"
import type { RealtimeChannel } from "@supabase/supabase-js"
import type { Prayer } from "@/types/database"

export function usePrayers(hierarchyIds?: string[], category?: string) {
  const [prayers, setPrayers] = useState<Prayer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    const fetchPrayers = async () => {
      setLoading(true)
      let query = supabase
        .from("prayers")
        .select(`
          *,
          posted_by_profile:profiles!prayers_posted_by_fkey(id, name, avatar_url),
          hierarchy:hierarchies(id, name_zh_hant, name_zh_hans)
        `)
        .order("created_at", { ascending: false })

      if (hierarchyIds && hierarchyIds.length > 0) {
        query = query.in("hierarchy_id", hierarchyIds)
      }

      if (category && category !== "all") {
        query = query.eq("category", category)
      }

      const { data, error } = await query
      if (!error && data) {
        setPrayers(data)
      }
      setLoading(false)
    }

    fetchPrayers()

    const channel: RealtimeChannel = supabase
      .channel("prayers_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "prayers" },
        () => {
          fetchPrayers()
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "amen_actions" },
        () => {
          fetchPrayers()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [hierarchyIds, category])

  return { prayers, loading }
}

export function useAmenActions(userId: string) {
  const [prayedIds, setPrayedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    const supabase = createClient()

    const fetchAmenActions = async () => {
      if (!userId) return
      const { data } = await supabase
        .from("amen_actions")
        .select("prayer_id")
        .eq("user_id", userId)

      if (data) {
        setPrayedIds(new Set(data.map((a) => a.prayer_id)))
      }
    }

    fetchAmenActions()

    const channel: RealtimeChannel = supabase
      .channel("amen_changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "amen_actions" },
        (payload) => {
          if ((payload.new as { user_id: string }).user_id === userId) {
            setPrayedIds((prev) => new Set([...prev, (payload.new as { prayer_id: string }).prayer_id]))
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "amen_actions" },
        (payload) => {
          if ((payload.old as { user_id: string }).user_id === userId) {
            setPrayedIds((prev) => {
              const next = new Set(prev)
              next.delete((payload.old as { prayer_id: string }).prayer_id)
              return next
            })
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  const toggleAmen = async (prayerId: string) => {
    const supabase = createClient()
    if (prayedIds.has(prayerId)) {
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
  }

  return { prayedIds, toggleAmen }
}
