import 'css/tailwind.css'
import 'css/prism.css'
import 'css/book-reader.css'
import 'katex/dist/katex.css'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ThemeProviders } from '../../../../theme-providers'
import { readingFonts } from '../../../../fonts'
import { LocaleProvider } from '@/i18n/LocaleContext'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = {
  title: 'The Dream · Working draft',
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
  const { locale } = await params
  if (locale !== 'ar' && locale !== 'en') notFound()
  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'} className={readingFonts}>
      <body className="bg-white text-gray-900 antialiased dark:bg-gray-950 dark:text-gray-100">
        <ThemeProviders>
          <LocaleProvider locale={locale}>{children}</LocaleProvider>
        </ThemeProviders>
      </body>
    </html>
  )
}
