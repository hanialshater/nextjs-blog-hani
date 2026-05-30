import { genPageMetadata } from 'app/seo'
import ListLayout from '@/layouts/ListLayout'
import { Locale, locales, getTranslation } from '@/i18n/config'
import { notFound } from 'next/navigation'
import { getPaginatedPosts, getPaginatedStaticParams } from '@/lib/content/posts'

export const metadata = genPageMetadata({ title: 'Blog' })

export async function generateStaticParams() {
  return getPaginatedStaticParams('blog', locales)
}

export default async function BlogPageNum({
  params,
}: {
  params: Promise<{ locale: string; num: string }>
}) {
  const { locale, num } = await params
  const pageNumber = parseInt(num)

  if (isNaN(pageNumber) || pageNumber < 1) {
    return notFound()
  }

  const { posts, initialDisplayPosts, pagination } = getPaginatedPosts('blog', locale, pageNumber)
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
      title={t('blog.allPosts')}
      basePath="blog"
    />
  )
}
