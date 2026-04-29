"use client"

import { createContext, useContext, useEffect, useState } from "react"

export type Language = "zh-Hant" | "zh-Hans"

interface LanguageContextValue {
  language: Language
  setLanguage: (language: Language) => void
}

const STORAGE_KEY = "shepherd-language"

const LanguageContext = createContext<LanguageContextValue>({
  language: "zh-Hant",
  setLanguage: () => {},
})

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("zh-Hant")

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === "zh-Hant" || stored === "zh-Hans") {
      setLanguageState(stored)
    }
  }, [])

  // Persist to localStorage when changed
  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage)
    localStorage.setItem(STORAGE_KEY, newLanguage)
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}