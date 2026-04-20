'use client'

import * as React from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface SelectOption {
  value: string
  label: string
}

interface SelectFieldProps {
  label: string
  value: string
  onValueChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  error?: string
  className?: string
}

export function SelectField({
  label,
  value,
  onValueChange,
  options,
  placeholder = "Select...",
  error,
  className,
}: SelectFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label className="text-sm font-medium">{label}</Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className={cn(error && "border-destructive")}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
