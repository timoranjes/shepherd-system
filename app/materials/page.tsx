"use client"

import { useState } from "react"
import {
  Upload,
  Share2,
  FileText,
  Music,
  Video,
  BookOpen,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Header } from "@/components/layout/Header"
import { BottomNavigation } from "@/components/layout/BottomNavigation"
import { useMaterials } from "@/hooks/use-materials"
import { UploadMaterialDialog } from "@/components/materials/upload-dialog"
import { useLanguage } from "@/contexts/language-context"
import type { Material } from "@/types/database"

const translations = {
  "zh-Hant": {
    title: "屬靈資源",
    upload: "上傳資源",
    uploadedBy: "上傳",
    suitableFor: "適合",
    share: "分享發送",
    all: "全部",
    gospel: "福音單張",
    newBeliever: "初信造就",
    lifeCourse: "生命課程",
    hymns: "詩歌分享",
    noMaterials: "暫無資源",
  },
  "zh-Hans": {
    title: "属灵资源",
    upload: "上传资源",
    uploadedBy: "上传",
    suitableFor: "适合",
    share: "分享发送",
    all: "全部",
    gospel: "福音单张",
    newBeliever: "初信造就",
    lifeCourse: "生命课程",
    hymns: "诗歌分享",
    noMaterials: "暂无资源",
  },
}

const categoryConfig: Record<string, { label: Record<"zh-Hant" | "zh-Hans", string> }> = {
  gospel: { label: { "zh-Hant": "福音單張", "zh-Hans": "福音单张" } },
  new_believer: { label: { "zh-Hant": "初信造就", "zh-Hans": "初信造就" } },
  life_course: { label: { "zh-Hant": "生命課程", "zh-Hans": "生命课程" } },
  hymns: { label: { "zh-Hant": "詩歌分享", "zh-Hans": "诗歌分享" } },
}

const resourceTypeConfig: Record<string, { icon: typeof FileText; color: string; label: Record<"zh-Hant" | "zh-Hans", string> }> = {
  pdf: { icon: FileText, color: "bg-red-500 text-white", label: { "zh-Hant": "PDF", "zh-Hans": "PDF" } },
  article: { icon: FileText, color: "bg-blue-500 text-white", label: { "zh-Hant": "文章", "zh-Hans": "文章" } },
  video: { icon: Video, color: "bg-purple-500 text-white", label: { "zh-Hant": "影片", "zh-Hans": "视频" } },
  audio: { icon: Music, color: "bg-orange-500 text-white", label: { "zh-Hant": "音訊", "zh-Hans": "音频" } },
}

function CoverIcon({ type }: { type: string }) {
  switch (type) {
    case "book":
      return (
        <svg className="w-12 h-12 text-white/90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
    case "scroll":
      return (
        <svg className="w-12 h-12 text-white/90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    case "sun":
      return (
        <svg className="w-12 h-12 text-white/90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    case "music":
      return (
        <svg className="w-12 h-12 text-white/90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
        </svg>
      )
    case "play":
      return (
        <svg className="w-12 h-12 text-white/90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    case "help":
      return (
        <svg className="w-12 h-12 text-white/90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    default:
      return <BookOpen className="w-12 h-12 text-white/90" />
  }
}

const coverIcons: Record<string, string> = {
  gospel: "book",
  new_believer: "scroll",
  life_course: "sun",
  hymns: "music",
}

const coverGradients: Record<string, string> = {
  gospel: "from-emerald-400 to-teal-500",
  new_believer: "from-blue-400 to-indigo-500",
  life_course: "from-amber-400 to-orange-500",
  hymns: "from-pink-400 to-rose-500",
}

export default function MaterialsPage() {
  const { language } = useLanguage()
  const [activeCategory, setActiveCategory] = useState("all")
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)

  const { data: materials = [], isLoading: loading } = useMaterials(activeCategory)

  const t = translations[language]

  const categories = [
    { id: "all", label: t.all },
    { id: "gospel", label: t.gospel },
    { id: "new_believer", label: t.newBeliever },
    { id: "life_course", label: t.lifeCourse },
    { id: "hymns", label: t.hymns },
  ]

  const handleShare = async (material: Material) => {
    const title = language === "zh-Hant" ? material.title_zh_hant : material.title_zh_hans
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: `${language === "zh-Hant" ? "分享屬靈資源" : "分享属灵资源"}：${title}`,
          url: material.file_url || window.location.href,
        })
      } catch {
        // User cancelled or share failed
      }
    } else if (material.file_url) {
      window.open(material.file_url, "_blank")
    }
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header />

      {/* Action Bar */}
      <div className="sticky top-[57px] z-40 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-lg font-semibold text-foreground">{t.title}</h1>
          <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1" onClick={() => setUploadDialogOpen(true)}>
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">{t.upload}</span>
          </Button>
        </div>
      </div>

      <main className="px-4 py-4 space-y-4">
        {/* Category Filters */}
        <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
          <div className="flex gap-2 pb-1">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeCategory === category.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/50"
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="bg-card border-border shadow-sm overflow-hidden flex flex-col">
                <Skeleton className="h-28 w-full rounded-none" />
                <CardContent className="p-3 flex flex-col flex-1">
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-4 w-3/4 mb-3" />
                  <Skeleton className="h-3 w-16 mb-3" />
                  <Skeleton className="h-9 w-full rounded-md mt-auto" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : materials.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            {t.noMaterials}
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {materials.map((material) => {
              const typeConfig = resourceTypeConfig[material.type]
              const TypeIcon = typeConfig?.icon || FileText

              return (
                <Card
                  key={material.id}
                  className="bg-card border-border shadow-sm overflow-hidden flex flex-col"
                >
                  <div className={`relative h-28 bg-gradient-to-br ${coverGradients[material.category] || "from-gray-400 to-gray-500"} flex items-center justify-center`}>
                    <CoverIcon type={coverIcons[material.category] || "book"} />

                    <Badge className={`absolute top-2 right-2 text-xs font-medium ${typeConfig?.color || "bg-gray-500 text-white"}`}>
                      <TypeIcon className="w-3 h-3 mr-1" />
                      {typeConfig?.label[language] || material.type.toUpperCase()}
                    </Badge>
                  </div>

                  <CardContent className="p-3 flex flex-col flex-1">
                    <h3 className="font-semibold text-sm text-foreground line-clamp-2 mb-1">
                      {language === "zh-Hant" ? material.title_zh_hant : material.title_zh_hans}
                    </h3>

                    <div className="text-xs text-muted-foreground space-y-0.5 mb-3">
                      <p>{material.uploader?.name || t.uploadedBy}</p>
                      {material.suitable_for && (
                        <p>{t.suitableFor}：{material.suitable_for}</p>
                      )}
                    </div>

                    <Button
                      variant="default"
                      size="sm"
                      className="w-full mt-auto bg-primary/90 hover:bg-primary text-primary-foreground gap-1.5 h-9"
                      onClick={() => handleShare(material)}
                    >
                      <Share2 className="w-4 h-4" />
                      {t.share}
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </main>

      <BottomNavigation />

      <UploadMaterialDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
      />
    </div>
  )
}