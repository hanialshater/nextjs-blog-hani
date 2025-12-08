'use client'

import { createContext, useContext, ReactNode } from 'react'
import { Locale, getTranslation, localeDirection } from './config'

interface LocaleContextType {
  locale: Locale
  t: (key: string) => string
  dir: 'ltr' | 'rtl'
}

const LocaleContext = createContext<LocaleContextType | null>(null)

export function LocaleProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  const value: LocaleContextType = {
    locale,
    t: (key: string) => getTranslation(locale, key),
    dir: localeDirection[locale],
  }

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}

export function useLocale() {
  const context = useContext(LocaleContext)
  if (!context) {
    throw new Error('useLocale must be used within a LocaleProvider')
  }
  return context
}
