"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase"
import type { Hierarchy } from "@/types/database"

export function useHierarchies() {
  const [hierarchies, setHierarchies] = useState<Hierarchy[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    const fetchHierarchies = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from("hierarchies")
        .select("*")
        .order("level")
        .order("sort_order")

      if (!error && data) {
        setHierarchies(data)
      }
      setLoading(false)
    }

    fetchHierarchies()
  }, [])

  const getHierarchyTree = () => {
    const regions = hierarchies.filter((h) => h.level === "region")
    const subRegions = hierarchies.filter((h) => h.level === "sub_region")
    const groups = hierarchies.filter((h) => h.level === "group")

    return { regions, subRegions, groups }
  }

  return { hierarchies, loading, getHierarchyTree }
}

export function useUserHierarchyIds(profileId?: string) {
  const [ids, setIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    const fetchIds = async () => {
      if (!profileId) {
        setIds([])
        setLoading(true)
        return
      }

      const { data } = await supabase.rpc("get_user_hierarchy_ids", {
        p_profile_id: profileId,
      })

      if (data) {
        setIds(data)
      } else {
        const { data: profile } = await supabase
          .from("profiles")
          .select("hierarchy_id")
          .eq("id", profileId)
          .single()
        setIds(profile?.hierarchy_id ? [profile.hierarchy_id] : [])
      }
      setLoading(false)
    }

    fetchIds()
  }, [profileId])

  return { ids, loading }
}
