import { genLocalizedPageMetadata } from 'app/seo'
import ListLayout from '@/layouts/ListLayout'
import { type Locale, locales, getTranslation } from '@/i18n/config'
import { notFound, permanentRedirect } from 'next/navigation'
import { getPaginatedPosts, getPaginatedStaticParams } from '@/lib/content/posts'

type Props = { params: Promise<{ locale: string; num: string }> }

export async function generateMetadata({ params }: Props) {
  const { locale, num } = await params
  return genLocalizedPageMetadata({
    title: getTranslation(locale as Locale, 'blog.allPosts'),
    locale,
    path: num === '1' ? 'blog' : `blog/page/${num}`,
  })
}

export function generateStaticParams() {
  return getPaginatedStaticParams('all', locales)
}

export default async function Page({ params }: Props) {
  const { locale, num } = await params
  if (!/^[1-9]\d*$/.test(num)) notFound()
  const pageNumber = Number(num)
  if (!Number.isSafeInteger(pageNumber)) notFound()
  if (pageNumber === 1) permanentRedirect(`/${locale}/blog`)
  const result = getPaginatedPosts('all', locale, pageNumber)
  if (pageNumber > result.pagination.totalPages) notFound()
  return (
    <ListLayout
      {...result}
      title={getTranslation(locale as Locale, 'blog.allPosts')}
      basePath="blog"
    />
  )
}
