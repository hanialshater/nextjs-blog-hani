'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { locales, localeNames, Locale } from '@/i18n/config'
import { useLocale } from '@/i18n/LocaleContext'

export type TranslationPaths = Record<string, Partial<Record<Locale, string>>>

export default function LanguageSwitcher({
  translations = {},
}: {
  translations?: TranslationPaths
}) {
  const pathname = usePathname()
  const { locale: currentLocale } = useLocale()

  const getLocalePath = (newLocale: Locale) => {
    if (newLocale === currentLocale) return pathname
    if (translations[pathname]) return translations[pathname][newLocale] || `/${newLocale}/blog`
    // Archive page counts can differ by language; switch to the first page.
    if (/\/(blog|free-writing)\/page\//.test(pathname)) {
      return `/${newLocale}/${pathname.split('/')[2]}`
    }
    // Remove current locale from pathname and add new one
    const segments = pathname.split('/')
    segments[1] = newLocale
    return segments.join('/')
  }

  return (
    <div className="flex items-center gap-2">
      {locales.map((locale) => (
        <Link
          key={locale}
          href={getLocalePath(locale)}
          className={`text-sm transition-colors ${
            locale === currentLocale
              ? 'text-primary-500 font-medium'
              : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
          }`}
          aria-label={`Switch to ${localeNames[locale]}`}
          hrefLang={locale}
          lang={locale}
        >
          {locale === 'ar' ? 'ع' : 'EN'}
        </Link>
      ))}
    </div>
  )
}
