'use client'

import * as React from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface FormFieldProps {
  label: string
  children: React.ReactNode
  error?: string
  className?: string
}

export function FormField({ label, children, error, className }: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label className="text-sm font-medium">{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export function InputField({ label, error, className, ...props }: InputFieldProps) {
  return (
    <FormField label={label} error={error}>
      <Input className={cn(error && "border-destructive", className)} {...props} />
    </FormField>
  )
}

interface TextareaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  error?: string
}

export function TextareaField({ label, error, className, ...props }: TextareaFieldProps) {
  return (
    <FormField label={label} error={error}>
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-destructive",
          className
        )}
        {...props}
      />
    </FormField>
  )
}
