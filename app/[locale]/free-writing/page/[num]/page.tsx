import { genPageMetadata } from 'app/seo'
import ListLayout from '@/layouts/ListLayout'
import { Locale, locales, getTranslation } from '@/i18n/config'
import { notFound } from 'next/navigation'
import { getPaginatedPosts, getPaginatedStaticParams } from '@/lib/content/posts'

export const metadata = genPageMetadata({ title: 'Free Writing' })

export async function generateStaticParams() {
  return getPaginatedStaticParams('free-writing', locales)
}

export default async function FreeWritingPageNum({
  params,
}: {
  params: Promise<{ locale: string; num: string }>
}) {
  const { locale, num } = await params
  const pageNumber = parseInt(num)

  if (isNaN(pageNumber) || pageNumber < 1) {
    return notFound()
  }

  const { posts, initialDisplayPosts, pagination } = getPaginatedPosts(
    'free-writing',
    locale,
    pageNumber
  )
  const { totalPages } = pagination

  if (pageNumber > totalPages) {
    return notFound()
  }

  const t = (key: string) => getTranslation(locale as Locale, key)

  return (
    <ListLayout
      posts={posts}
      initialDisplayPosts={initialDisplayPosts}
      pagination={pagination}
      title={t('nav.freeWriting')}
      basePath="free-writing"
    />
  )
}
