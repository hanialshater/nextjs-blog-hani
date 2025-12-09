'use client'

import Link from '@/components/Link'
import Image from '@/components/Image'
import { useLocale } from '@/i18n/LocaleContext'

interface Spark {
  id: string
  text: string
  source?: string
}

interface HomeProps {
  spark: Spark
  authorName: string
  authorOccupation: string
  authorAvatar: string
}

export default function Home({ spark, authorName, authorOccupation, authorAvatar }: HomeProps) {
  const { locale, t, dir } = useLocale()
  const isRTL = dir === 'rtl'

  return (
    <div className={`flex flex-col items-center ${isRTL ? 'text-right' : 'text-left'}`}>
      {/* Hero Section */}
      <div className="flex w-full max-w-2xl flex-col items-center py-12 md:py-16">
        <Image
          src={authorAvatar}
          alt={authorName}
          width={120}
          height={120}
          className="mb-6 rounded-full"
        />
        <h1 className="mb-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          {authorName}
        </h1>
        <p className="mb-8 text-lg text-gray-600 dark:text-gray-400">{authorOccupation}</p>

        {/* Navigation Links */}
        <nav className="mb-12 flex flex-wrap justify-center gap-6 text-base">
          <Link
            href={`/${locale}/blog`}
            className="text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          >
            {t('nav.blog')}
          </Link>
          <Link
            href={`/${locale}/free-writing`}
            className="text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          >
            {t('nav.freeWriting')}
          </Link>
          <Link
            href={`/${locale}/projects`}
            className="text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          >
            {t('nav.projects')}
          </Link>
          <Link
            href={`/${locale}/about`}
            className="text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          >
            {t('nav.about')}
          </Link>
        </nav>
      </div>

      {/* Spark/Quote Section */}
      <div className="w-full max-w-2xl border-t border-gray-200 py-12 dark:border-gray-700">
        <blockquote
          className={`relative ${isRTL ? 'pr-8 text-right' : 'pl-8 text-left'}`}
          dir={dir}
        >
          <span
            className={`absolute top-0 text-6xl leading-none text-gray-300 dark:text-gray-600 ${isRTL ? 'right-0' : 'left-0'}`}
          >
            &ldquo;
          </span>
          <p className="text-xl leading-relaxed text-gray-700 italic dark:text-gray-300">
            {spark.text}
          </p>
          {spark.source && (
            <footer className="mt-4">
              <Link
                href={`/${locale}/free-writing/${spark.source}`}
                className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400 text-sm"
              >
                {t('home.readMore')} &rarr;
              </Link>
            </footer>
          )}
        </blockquote>
      </div>
    </div>
  )
}
