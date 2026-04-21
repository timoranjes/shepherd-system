import { useState, useCallback } from 'react'

export type Language = 'zh-Hant' | 'zh-Hans'

export function useLanguage(defaultLang: Language = 'zh-Hant') {
  const [lang, setLang] = useState<Language>(defaultLang)

  const toggle = useCallback(() => {
    setLang((prev) => (prev === 'zh-Hant' ? 'zh-Hans' : 'zh-Hant'))
  }, [])

  return { lang, setLang, toggle }
}