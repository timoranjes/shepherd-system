"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase"
import type { Material } from "@/types/database"

export function useMaterials(category?: string) {
  return useQuery({
    queryKey: ["materials", category],
    queryFn: async () => {
      const supabase = createClient()
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
      if (error) throw error
      return data as Material[]
    },
  })
}

export function useUploadMaterial() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async ({
      file,
      metadata,
    }: {
      file: File
      metadata: {
        title_zh_hant: string
        title_zh_hans: string
        category: string
        type: string
        suitable_for?: string
        cover_color?: string
      }
    }) => {
      const supabase = createClient()
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
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["materials"] })
    },
  })

  return {
    uploadMaterial: mutation.mutateAsync,
    uploading: mutation.isPending,
  }
}