import { genLocalizedPageMetadata } from 'app/seo'
import { notFound } from 'next/navigation'
import AlgorithmDemos from '@/components/AlgorithmDemos'
import EvolvedDemos from '@/components/EvolvedDemos'
import Link from '@/components/Link'
import MapElitesDemo from '@/components/MapElitesDemo'
import miniDemosData, { getLocalizedMiniDemo, getMiniDemoBySlug } from '@/data/miniDemosData'
import { Locale, getTranslation, localeDirection, locales } from '@/i18n/config'

const demoComponents = {
  'algorithm-playground': AlgorithmDemos,
  'evolved-ui-demos': EvolvedDemos,
  'map-elites-circle-packing': MapElitesDemo,
}

interface PageProps {
  params: Promise<{ locale: string; slug: string }>
}

export async function generateStaticParams() {
  return locales.flatMap((locale) => miniDemosData.map((demo) => ({ locale, slug: demo.slug })))
}

export async function generateMetadata({ params }: PageProps) {
  const { locale, slug } = await params
  const demo = getMiniDemoBySlug(slug)
  if (!demo) return {}

  const localized = getLocalizedMiniDemo(demo, locale)

  return genLocalizedPageMetadata({
    title: localized.title,
    description: localized.description,
    locale,
    path: `demos/${slug}`,
  })
}

export default async function DemoPage({ params }: PageProps) {
  const { locale, slug } = await params
  const demo = getMiniDemoBySlug(slug)
  const DemoComponent = demoComponents[slug as keyof typeof demoComponents]

  if (!demo || !DemoComponent) {
    return notFound()
  }

  const localized = getLocalizedMiniDemo(demo, locale)
  const t = (key: string) => getTranslation(locale as Locale, key)
  const isRTL = localeDirection[locale as Locale] === 'rtl'

  return (
    <div className={`space-y-8 ${isRTL ? 'text-right' : ''}`}>
      <div className="space-y-4 border-b border-gray-200 pb-8 dark:border-gray-700">
        <Link
          href={`/${locale}/demos`}
          className="text-primary-500 hover:text-primary-600 text-sm font-medium"
        >
          ← {t('demo.backToDemos')}
        </Link>
        <div className={`flex items-start gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <span className="text-5xl" aria-hidden="true">
            {demo.icon}
          </span>
          <div>
            <h1 className="text-3xl leading-9 font-extrabold tracking-tight text-gray-900 sm:text-4xl sm:leading-10 md:text-5xl md:leading-12 dark:text-gray-100">
              {localized.title}
            </h1>
            <p className="mt-3 max-w-3xl text-lg leading-7 text-gray-500 dark:text-gray-400">
              {localized.description}
            </p>
            {demo.relatedPost && (
              <Link
                href={`/${locale}/${demo.relatedPost.section}/${demo.relatedPost.slug}`}
                className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400 mt-4 inline-flex font-medium"
              >
                {t('demo.readRelatedPost')} →
              </Link>
            )}
          </div>
        </div>
      </div>

      <section className="min-h-[60vh] rounded-2xl border border-gray-200 bg-gray-50 p-3 shadow-sm sm:p-6 dark:border-gray-700 dark:bg-gray-900">
        <DemoComponent />
      </section>
    </div>
  )
}
