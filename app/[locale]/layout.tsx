import 'css/tailwind.css'
import 'pliny/search/algolia.css'
import 'remark-github-blockquote-alert/alert.css'

import { Space_Grotesk, Noto_Sans_Arabic } from 'next/font/google'
import { Analytics, AnalyticsConfig } from 'pliny/analytics'
import LocalizedSearchProvider from '@/components/LocalizedSearchProvider'
import Header from '@/components/Header'
import SectionContainer from '@/components/SectionContainer'
import Footer from '@/components/Footer'
import siteMetadata from '@/data/siteMetadata'
import { ThemeProviders } from '../theme-providers'
import { Metadata } from 'next'
import { locales, Locale, localeDirection } from '@/i18n/config'
import { LocaleProvider } from '@/i18n/LocaleContext'

const space_grotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-space-grotesk',
})

const noto_arabic = Noto_Sans_Arabic({
  subsets: ['arabic'],
  display: 'swap',
  variable: '--font-noto-arabic',
})

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export const metadata: Metadata = {
  metadataBase: new URL(siteMetadata.siteUrl),
  title: {
    default: siteMetadata.title,
    template: `%s | ${siteMetadata.title}`,
  },
  description: siteMetadata.description,
  openGraph: {
    title: siteMetadata.title,
    description: siteMetadata.description,
    url: './',
    siteName: siteMetadata.title,
    images: [siteMetadata.socialBanner],
    locale: 'en_US',
    type: 'website',
  },
  alternates: {
    canonical: './',
    types: {
      'application/rss+xml': `${siteMetadata.siteUrl}/feed.xml`,
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  twitter: {
    title: siteMetadata.title,
    card: 'summary_large_image',
    images: [siteMetadata.socialBanner],
  },
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const validLocale = locales.includes(locale as Locale) ? (locale as Locale) : 'en'
  const dir = localeDirection[validLocale]
  const basePath = process.env.BASE_PATH || ''

  return (
    <html
      lang={validLocale}
      dir={dir}
      className={`${space_grotesk.variable} ${noto_arabic.variable} scroll-smooth`}
      suppressHydrationWarning
    >
      <link
        rel="apple-touch-icon"
        sizes="76x76"
        href={`${basePath}/static/favicons/apple-touch-icon.png`}
      />
      <link
        rel="icon"
        type="image/png"
        sizes="32x32"
        href={`${basePath}/static/favicons/favicon-32x32.png`}
      />
      <link
        rel="icon"
        type="image/png"
        sizes="16x16"
        href={`${basePath}/static/favicons/favicon-16x16.png`}
      />
      <link rel="manifest" href={`${basePath}/static/favicons/site.webmanifest`} />
      <link
        rel="mask-icon"
        href={`${basePath}/static/favicons/safari-pinned-tab.svg`}
        color="#5bbad5"
      />
      <meta name="msapplication-TileColor" content="#000000" />
      <meta name="theme-color" media="(prefers-color-scheme: light)" content="#fff" />
      <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#000" />
      <link rel="alternate" type="application/rss+xml" href={`${basePath}/feed.xml`} />
      <body
        className={`bg-white pl-[calc(100vw-100%)] text-black antialiased dark:bg-gray-950 dark:text-white ${
          dir === 'rtl' ? 'font-[var(--font-noto-arabic)]' : ''
        }`}
      >
        <ThemeProviders>
          <LocaleProvider locale={validLocale}>
            <Analytics analyticsConfig={siteMetadata.analytics as AnalyticsConfig} />
            <SectionContainer>
              <LocalizedSearchProvider>
                <Header />
                <main className="mb-auto">{children}</main>
              </LocalizedSearchProvider>
              <Footer />
            </SectionContainer>
          </LocaleProvider>
        </ThemeProviders>
      </body>
    </html>
  )
}
