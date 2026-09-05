import { genLocalizedPageMetadata } from 'app/seo'
import ListLayout from '@/layouts/ListLayout'
import { type Locale, locales, getTranslation } from '@/i18n/config'
import { notFound, permanentRedirect } from 'next/navigation'
import { getPaginatedPosts, getPaginatedStaticParams } from '@/lib/content/posts'

type Props = { params: Promise<{ locale: string; num: string }> }

export async function generateMetadata({ params }: Props) {
  const { locale, num } = await params
  return genLocalizedPageMetadata({
    title: getTranslation(locale as Locale, 'nav.freeWriting'),
    locale,
    path: num === '1' ? 'free-writing' : `free-writing/page/${num}`,
  })
}

export function generateStaticParams() {
  return getPaginatedStaticParams('free-writing', locales)
}

export default async function Page({ params }: Props) {
  const { locale, num } = await params
  if (!/^[1-9]\d*$/.test(num)) notFound()
  const pageNumber = Number(num)
  if (!Number.isSafeInteger(pageNumber)) notFound()
  if (pageNumber === 1) permanentRedirect(`/${locale}/free-writing`)
  const result = getPaginatedPosts('free-writing', locale, pageNumber)
  if (pageNumber > result.pagination.totalPages) notFound()
  return (
    <ListLayout
      {...result}
      title={getTranslation(locale as Locale, 'nav.freeWriting')}
      basePath="free-writing"
    />
  )
}
