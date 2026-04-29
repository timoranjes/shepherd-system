'use client'

import { useState, useRef } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SelectField } from "@/components/ui/select-field"
import { useUploadMaterial } from "@/hooks/use-materials"

interface UploadMaterialDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

const categoryOptions = [
  { value: "gospel", label: "福音單張" },
  { value: "new_believer", label: "初信造就" },
  { value: "life_course", label: "生命課程" },
  { value: "hymns", label: "詩歌分享" },
]

const typeOptions = [
  { value: "pdf", label: "PDF" },
  { value: "article", label: "文章" },
  { value: "video", label: "影片" },
  { value: "audio", label: "音訊" },
]

export function UploadMaterialDialog({
  open,
  onOpenChange,
  onSuccess,
}: UploadMaterialDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title_zh_hant: "",
    title_zh_hans: "",
    category: "gospel",
    type: "pdf",
    suitable_for: "",
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const { uploadMaterial } = useUploadMaterial()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleSubmit = async () => {
    if (!selectedFile || !form.title_zh_hant.trim()) return

    setLoading(true)

    try {
      await uploadMaterial({
        file: selectedFile,
        metadata: {
          title_zh_hant: form.title_zh_hant,
          title_zh_hans: form.title_zh_hans || form.title_zh_hant,
          category: form.category,
          type: form.type,
          suitable_for: form.suitable_for || undefined,
        },
      })

      setForm({
        title_zh_hant: "",
        title_zh_hans: "",
        category: "gospel",
        type: "pdf",
        suitable_for: "",
      })
      setSelectedFile(null)
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      console.error("Failed to upload material:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setForm({
        title_zh_hant: "",
        title_zh_hans: "",
        category: "gospel",
        type: "pdf",
        suitable_for: "",
      })
      setSelectedFile(null)
    }
    onOpenChange(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>上傳資源</DialogTitle>
          <DialogDescription>上傳福音材料或屬靈資源</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>標題（繁體）</Label>
            <Input
              value={form.title_zh_hant}
              onChange={(e) => setForm({ ...form, title_zh_hant: e.target.value })}
              placeholder="請輸入標題"
            />
          </div>

          <div className="space-y-2">
            <Label>標題（簡體）</Label>
            <Input
              value={form.title_zh_hans}
              onChange={(e) => setForm({ ...form, title_zh_hans: e.target.value })}
              placeholder="請輸入標題"
            />
          </div>

          <SelectField
            label="分類"
            value={form.category}
            onValueChange={(v) => setForm({ ...form, category: v })}
            options={categoryOptions}
          />

          <SelectField
            label="資源類型"
            value={form.type}
            onValueChange={(v) => setForm({ ...form, type: v })}
            options={typeOptions}
          />

          <div className="space-y-2">
            <Label>適合對象</Label>
            <Input
              value={form.suitable_for}
              onChange={(e) => setForm({ ...form, suitable_for: e.target.value })}
              placeholder="例如：初信者、福音朋友"
            />
          </div>

          <div className="space-y-2">
            <Label>選擇檔案</Label>
            <Input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.mp3,.mp4"
            />
            {selectedFile && (
              <p className="text-xs text-muted-foreground">已選擇：{selectedFile.name}</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={loading}
          >
            取消
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !selectedFile || !form.title_zh_hant.trim()}
          >
            {loading ? "上傳中..." : "上傳"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
