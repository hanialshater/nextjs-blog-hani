import { Metadata } from 'next'
import siteMetadata from '@/data/siteMetadata'
import { locales, Locale } from '@/i18n/config'

interface PageSEOProps {
  title: string
  description?: string
  image?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}

interface LocalizedPageSEOProps extends PageSEOProps {
  locale: string
  path?: string
}

export function genPageMetadata({ title, description, image, ...rest }: PageSEOProps): Metadata {
  return {
    title,
    description: description || siteMetadata.description,
    openGraph: {
      title: `${title} | ${siteMetadata.title}`,
      description: description || siteMetadata.description,
      url: siteMetadata.siteUrl,
      siteName: siteMetadata.title,
      images: image ? [image] : [siteMetadata.socialBanner],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      title: `${title} | ${siteMetadata.title}`,
      card: 'summary_large_image',
      images: image ? [image] : [siteMetadata.socialBanner],
    },
    ...rest,
  }
}

export function genLocalizedPageMetadata({
  title,
  description,
  image,
  locale,
  path = '',
  ...rest
}: LocalizedPageSEOProps): Metadata {
  const validLocale = locales.includes(locale as Locale) ? (locale as Locale) : 'en'
  const normalizedPath = path.replace(/^\//, '').replace(/\/$/, '')
  const canonicalUrl = `${siteMetadata.siteUrl}/${validLocale}${normalizedPath ? `/${normalizedPath}` : ''}`
  const languages = Object.fromEntries(
    locales.map((locale) => [
      locale,
      `${siteMetadata.siteUrl}/${locale}${normalizedPath ? `/${normalizedPath}` : ''}`,
    ])
  )

  return {
    title,
    description: description || siteMetadata.description,
    alternates: {
      canonical: canonicalUrl,
      languages,
    },
    openGraph: {
      title: `${title} | ${siteMetadata.title}`,
      description: description || siteMetadata.description,
      url: canonicalUrl,
      siteName: siteMetadata.title,
      images: image ? [image] : [siteMetadata.socialBanner],
      locale: validLocale === 'ar' ? 'ar_SA' : 'en_US',
      type: 'website',
    },
    twitter: {
      title: `${title} | ${siteMetadata.title}`,
      card: 'summary_large_image',
      images: image ? [image] : [siteMetadata.socialBanner],
    },
    ...rest,
  }
}
