import React, { createContext, useContext, useState, useEffect } from 'react'

export type Language = 'en' | 'hi'

type LanguageContextValue = {
  language: Language
  setLanguage: (l: Language) => void
}

const STORAGE_KEY = 'civicai_language'

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined)

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en')

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY)
      if (saved === 'en' || saved === 'hi') {
        setLanguageState(saved)
      }
    } catch {
      // ignore
    }
  }, [])

  const setLanguage = (l: Language) => {
    setLanguageState(l)
    try {
      sessionStorage.setItem(STORAGE_KEY, l)
    } catch {
      // ignore
    }
  }

  return <LanguageContext.Provider value={{ language, setLanguage }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}
