'use client'

import Link from '@/components/Link'
import siteMetadata from '@/data/siteMetadata'
import { useLocale } from '@/i18n/LocaleContext'

/**
 * End-of-post invitation to keep reading: LinkedIn (where Coffee & Commute lives) and RSS.
 * Kept link-based on purpose: no email provider is wired up yet, so nothing here can fail.
 */
export default function FollowAlong() {
  const { t, dir } = useLocale()
  const basePath = process.env.BASE_PATH || ''

  return (
    <aside
      dir={dir}
      aria-labelledby="follow-along-title"
      className="my-6 rounded-lg border border-gray-200 bg-gray-50 px-5 py-5 dark:border-gray-700 dark:bg-gray-800/40"
    >
      <h2
        id="follow-along-title"
        className="text-lg font-bold tracking-tight text-gray-900 dark:text-gray-100"
      >
        {t('follow.title')}
      </h2>
      <p className="mt-2 text-base leading-relaxed text-gray-600 dark:text-gray-300">
        {t('follow.body')}
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        {siteMetadata.linkedin && (
          <Link
            href={siteMetadata.linkedin}
            className="bg-primary-500 hover:bg-primary-600 rounded-md px-4 py-2 text-sm font-medium text-white transition-colors"
          >
            {t('follow.linkedin')}
          </Link>
        )}
        <Link
          href={`${basePath}/feed.xml`}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-gray-400 hover:text-gray-900 dark:border-gray-600 dark:text-gray-200 dark:hover:border-gray-500 dark:hover:text-white"
        >
          {t('follow.rss')}
        </Link>
      </div>
    </aside>
  )
}
