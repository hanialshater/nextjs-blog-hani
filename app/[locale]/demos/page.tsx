import { genLocalizedPageMetadata } from 'app/seo'
import Link from '@/components/Link'
import miniDemosData, { getLocalizedMiniDemo } from '@/data/miniDemosData'
import { Locale, getTranslation, localeDirection, locales } from '@/i18n/config'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  return genLocalizedPageMetadata({ title: 'Demos', locale, path: 'demos' })
}

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export default async function DemosPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = (key: string) => getTranslation(locale as Locale, key)
  const isRTL = localeDirection[locale as Locale] === 'rtl'
  const demos = [...miniDemosData].sort((a, b) => a.order - b.order)

  return (
    <div className={`divide-y divide-gray-200 dark:divide-gray-700 ${isRTL ? 'text-right' : ''}`}>
      <div className="space-y-2 pt-6 pb-8 md:space-y-5">
        <h1 className="text-3xl leading-9 font-extrabold tracking-tight text-gray-900 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14 dark:text-gray-100">
          {t('page.demos')}
        </h1>
        <p className="max-w-3xl text-lg leading-7 text-gray-500 dark:text-gray-400">
          {t('page.demos.description')}
        </p>
      </div>

      <div className="grid gap-6 py-12 md:grid-cols-2">
        {demos.map((demo) => {
          const localized = getLocalizedMiniDemo(demo, locale)
          return (
            <article
              key={demo.slug}
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-gray-700 dark:bg-gray-900"
            >
              <div className={`flex items-start gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span className="text-4xl" aria-hidden="true">
                  {demo.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                    <Link href={`/${locale}/demos/${demo.slug}`}>{localized.title}</Link>
                  </h2>
                  <p className="mt-3 text-gray-500 dark:text-gray-400">{localized.description}</p>
                  <div className={`mt-4 flex flex-wrap gap-2 ${isRTL ? 'justify-end' : ''}`}>
                    {demo.tags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 rounded-full px-3 py-1 text-xs font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <Link
                    href={`/${locale}/demos/${demo.slug}`}
                    className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400 mt-5 inline-flex font-medium"
                  >
                    {t('demo.openDemo')} →
                  </Link>
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}
