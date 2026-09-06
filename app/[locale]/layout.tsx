import 'css/tailwind.css'
import 'pliny/search/algolia.css'
import 'remark-github-blockquote-alert/alert.css'

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
import { Analytics as VercelAnalytics } from '@vercel/analytics/react'
import { allBlogs } from 'contentlayer/generated'
import {
  findTranslatedPost,
  getPostRoutePath,
  isPostInLocale,
  isPublishedPost,
} from '@/lib/content/postRoutes'
import { getTranslation } from '@/i18n/config'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { readingFonts } from '../fonts'

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
    types: {
      'application/rss+xml': `${siteMetadata.siteUrl}/feed.xml`,
    },
  },
  verification: {
    google: siteMetadata.googleSiteVerification,
  },
  keywords: siteMetadata.keywords,
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
  if (!locales.includes(locale as Locale)) notFound()
  const validLocale = locale as Locale
  const dir = localeDirection[validLocale]
  const basePath = process.env.BASE_PATH || ''
  const posts = allBlogs.filter((post) => isPublishedPost(post))
  const translations = Object.fromEntries(
    posts.map((post) => [
      getPostRoutePath(post),
      Object.fromEntries(
        locales.flatMap((language) => {
          const counterpart = isPostInLocale(post, language)
            ? post
            : findTranslatedPost(post, posts, language)
          return counterpart ? [[language, getPostRoutePath(counterpart, language)]] : []
        })
      ),
    ])
  )

  return (
    <html
      lang={validLocale}
      dir={dir}
      className={`scroll-smooth ${readingFonts}`}
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
          dir === 'rtl' ? 'font-[family-name:var(--font-noto-arabic)]' : ''
        }`}
      >
        <ThemeProviders>
          <LocaleProvider locale={validLocale}>
            <Link
              href="#main-content"
              className="sr-only focus:not-sr-only focus:fixed focus:start-2 focus:top-2 focus:z-50 focus:rounded focus:bg-white focus:p-3 focus:text-black"
            >
              {getTranslation(validLocale, 'common.skipToContent')}
            </Link>
            <Analytics analyticsConfig={siteMetadata.analytics as AnalyticsConfig} />
            <SectionContainer>
              <LocalizedSearchProvider>
                <Header translations={translations} />
                <main id="main-content" className="mb-auto">
                  {children}
                </main>
              </LocalizedSearchProvider>
              <Footer />
            </SectionContainer>
            <VercelAnalytics />
          </LocaleProvider>
        </ThemeProviders>
      </body>
    </html>
  )
}
