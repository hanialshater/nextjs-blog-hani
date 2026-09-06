import 'css/tailwind.css'
import 'css/prism.css'
import 'katex/dist/katex.css'
import 'remark-github-blockquote-alert/alert.css'

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ThemeProviders } from '../../theme-providers'
import { LocaleProvider } from '@/i18n/LocaleContext'
import { locales, type Locale, localeDirection } from '@/i18n/config'
import { requireDraftAccess } from '@/lib/drafts/content'
import { readingFonts } from '../../fonts'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = {
  title: 'Private drafts',
  robots: { index: false, follow: false, noarchive: true },
  referrer: 'no-referrer',
}

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  await requireDraftAccess()
  const { locale } = await params
  if (!locales.includes(locale as Locale)) notFound()
  return (
    <html
      lang={locale}
      dir={localeDirection[locale as Locale]}
      className={readingFonts}
      suppressHydrationWarning
    >
      <body className="bg-white text-gray-900 antialiased dark:bg-gray-950 dark:text-gray-100">
        <ThemeProviders>
          <LocaleProvider locale={locale as Locale}>{children}</LocaleProvider>
        </ThemeProviders>
      </body>
    </html>
  )
}
