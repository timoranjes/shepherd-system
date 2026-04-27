"use client"

import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase"
import type { Hierarchy } from "@/types/database"

export function useHierarchies() {
  const query = useQuery({
    queryKey: ["hierarchies"],
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("hierarchies")
        .select("*")
        .order("level")
        .order("sort_order")

      if (error) throw error
      return data as Hierarchy[]
    },
  })

  const getHierarchyTree = () => {
    const hierarchies = query.data || []
    return {
      regions: hierarchies.filter((h) => h.level === "region"),
      subRegions: hierarchies.filter((h) => h.level === "sub_region"),
      groups: hierarchies.filter((h) => h.level === "group"),
    }
  }

  return {
    hierarchies: query.data || [],
    loading: query.isLoading,
    getHierarchyTree,
  }
}

export function useUserHierarchyIds(profileId?: string) {
  return useQuery({
    queryKey: ["userHierarchyIds", profileId],
    queryFn: async () => {
      if (!profileId) return []

      const supabase = createClient()
      const { data } = await supabase.rpc("get_user_hierarchy_ids", {
        p_profile_id: profileId,
      })

      if (data) return data

      const { data: profile } = await supabase
        .from("profiles")
        .select("hierarchy_id")
        .eq("id", profileId)
        .single()

      return profile?.hierarchy_id ? [profile.hierarchy_id] : []
    },
    enabled: !!profileId,
  })
}