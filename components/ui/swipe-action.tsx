"use client"

import { useState, useRef, useCallback, useEffect } from "react"

const SWIPE_THRESHOLD = 80
const ACTION_WIDTH = 96

interface SwipeActionProps {
  children: React.ReactNode
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onActionClick?: () => void
  actionIcon?: React.ReactNode
  actionLabel?: string
}

export function SwipeAction({
  children,
  isOpen,
  onOpenChange,
  onActionClick,
  actionIcon,
  actionLabel,
}: SwipeActionProps) {
  const [translateX, setTranslateX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const startXRef = useRef(0)
  const currentXRef = useRef(0)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isDragging) {
      if (isOpen) {
        setTranslateX(-ACTION_WIDTH)
      } else {
        setTranslateX(0)
      }
    }
  }, [isOpen, isDragging])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX
    currentXRef.current = e.touches[0].clientX
    setIsDragging(true)
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging) return

    const currentX = e.touches[0].clientX
    currentXRef.current = currentX
    const diff = currentX - startXRef.current

    if (isOpen) {
      const newTranslate = Math.min(0, -ACTION_WIDTH + diff)
      setTranslateX(newTranslate)
    } else {
      const newTranslate = Math.max(-ACTION_WIDTH, Math.min(0, diff))
      setTranslateX(newTranslate)
    }
  }, [isDragging, isOpen])

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false)
    const diff = currentXRef.current - startXRef.current

    if (isOpen) {
      if (diff > SWIPE_THRESHOLD / 2) {
        onOpenChange(false)
      } else {
        setTranslateX(-ACTION_WIDTH)
      }
    } else {
      if (diff < -SWIPE_THRESHOLD / 2) {
        onOpenChange(true)
      } else {
        setTranslateX(0)
      }
    }
  }, [isOpen, onOpenChange])

  const handleActionClick = useCallback(() => {
    onOpenChange(false)
    onActionClick?.()
  }, [onOpenChange, onActionClick])

  const handleClickOutside = useCallback((e: Event) => {
    if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
      if (isOpen) {
        onOpenChange(false)
      }
    }
  }, [isOpen, onOpenChange])

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("click", handleClickOutside)
      document.addEventListener("touchstart", handleClickOutside)
    }
    return () => {
      document.removeEventListener("click", handleClickOutside)
      document.removeEventListener("touchstart", handleClickOutside)
    }
  }, [isOpen, handleClickOutside])

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden rounded-xl"
    >
      <div
        className="absolute right-0 top-0 bottom-0 w-24 bg-primary flex items-center justify-center rounded-r-xl cursor-pointer"
        onClick={handleActionClick}
      >
        <div className="flex flex-col items-center gap-1 text-primary-foreground">
          {actionIcon}
          {actionLabel && <span className="text-xs font-medium">{actionLabel}</span>}
        </div>
      </div>

      <div
        className="relative transition-transform"
        style={{
          transform: `translateX(${translateX}px)`,
          transitionDuration: isDragging ? "0ms" : "200ms",
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  )
}