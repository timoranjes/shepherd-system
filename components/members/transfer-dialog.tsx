'use client'

import { useState, useEffect } from "react"
import { FormDialog } from "@/components/ui/form-dialog"
import { SelectField } from "@/components/ui/select-field"
import { createClient } from "@/lib/supabase"
import type { Member, Hierarchy } from "@/types/database"

interface TransferDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  member: Member | null
  onSuccess?: () => void
}

export function TransferDialog({
  open,
  onOpenChange,
  member,
  onSuccess,
}: TransferDialogProps) {
  const [loading, setLoading] = useState(false)
  const [hierarchies, setHierarchies] = useState<Hierarchy[]>([])
  const [selectedHierarchyId, setSelectedHierarchyId] = useState("")

  useEffect(() => {
    const fetchHierarchies = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from("hierarchies")
        .select("*")
        .eq("level", "group")
        .order("sort_order")

      if (data) {
        setHierarchies(data)
      }
    }

    if (open) {
      fetchHierarchies()
      setSelectedHierarchyId("")
    }
  }, [open])

  const handleSubmit = async () => {
    if (!member || !selectedHierarchyId) return

    setLoading(true)

    try {
      const supabase = createClient()
      await supabase
        .from("members")
        .update({ hierarchy_id: selectedHierarchyId })
        .eq("id", member.id)

      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      console.error("Failed to transfer member:", error)
    } finally {
      setLoading(false)
    }
  }

  const hierarchyOptions = hierarchies.map((h) => ({
    value: h.id,
    label: h.name_zh_hant,
  }))

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="轉交/轉排"
      description={`將 ${member?.name_zh_hant} 轉移到其他小排`}
      onSubmit={handleSubmit}
      submitLabel="確認轉移"
      loading={loading}
    >
      <SelectField
        label="選擇小排"
        value={selectedHierarchyId}
        onValueChange={setSelectedHierarchyId}
        options={hierarchyOptions}
        placeholder="選擇目標小排"
      />
    </FormDialog>
  )
}
