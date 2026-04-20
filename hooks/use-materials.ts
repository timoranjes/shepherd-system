"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase"
import type { Material } from "@/types/database"

export function useMaterials(category?: string) {
  const [materials, setMaterials] = useState<Material[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    const fetchMaterials = async () => {
      setLoading(true)
      let query = supabase
        .from("materials")
        .select(`
          *,
          uploader:profiles!materials_uploaded_by_fkey(id, name, avatar_url)
        `)
        .order("created_at", { ascending: false })

      if (category && category !== "all") {
        query = query.eq("category", category)
      }

      const { data, error } = await query
      if (!error && data) {
        setMaterials(data)
      }
      setLoading(false)
    }

    fetchMaterials()
  }, [category])

  return { materials, loading }
}

export function useUploadMaterial() {
  const [uploading, setUploading] = useState(false)

  const uploadMaterial = async (file: File, metadata: {
    title_zh_hant: string
    title_zh_hans: string
    category: string
    type: string
    suitable_for?: string
    cover_color?: string
  }) => {
    const supabase = createClient()
    setUploading(true)
    try {
      const fileExt = file.name.split(".").pop()
      const fileName = `${crypto.randomUUID()}.${fileExt}`
      const filePath = `materials/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from("materials")
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from("materials")
        .getPublicUrl(filePath)

      const { data: { user } } = await supabase.auth.getUser()

      const { error: insertError } = await supabase
        .from("materials")
        .insert({
          ...metadata,
          file_url: publicUrl,
          uploaded_by: user?.id,
        })

      if (insertError) throw insertError

      return { success: true }
    } catch (error) {
      return { success: false, error }
    } finally {
      setUploading(false)
    }
  }

  return { uploadMaterial, uploading }
}
