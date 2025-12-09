import { allCoreContent, sortPosts } from 'pliny/utils/contentlayer'
import { allBlogs } from 'contentlayer/generated'
import { genPageMetadata } from 'app/seo'
import ListLayout from '@/layouts/ListLayout'
import { Locale, locales, getTranslation } from '@/i18n/config'
import { notFound } from 'next/navigation'

const POSTS_PER_PAGE = 5

export const metadata = genPageMetadata({ title: 'Free Writing' })

export async function generateStaticParams() {
  const params: { locale: string; num: string }[] = []

  for (const locale of locales) {
    const freeWritingPosts = allBlogs.filter(
      (post) => post.path.startsWith('free-writing-blog') && (post.language || 'en') === locale
    )
    const totalPages = Math.ceil(freeWritingPosts.length / POSTS_PER_PAGE)

    for (let i = 1; i <= totalPages; i++) {
      params.push({ locale, num: String(i) })
    }
  }

  return params
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

  const isDev = process.env.NODE_ENV === 'development'
  const freeWritingPosts = allBlogs.filter(
    (post) =>
      post.path.startsWith('free-writing-blog') &&
      (post.language || 'en') === locale &&
      (isDev || !post.draft)
  )
  const posts = allCoreContent(sortPosts(freeWritingPosts))
  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE)

  if (pageNumber > totalPages) {
    return notFound()
  }

  const startIndex = (pageNumber - 1) * POSTS_PER_PAGE
  const endIndex = startIndex + POSTS_PER_PAGE
  const initialDisplayPosts = posts.slice(startIndex, endIndex)
  const pagination = {
    currentPage: pageNumber,
    totalPages: totalPages,
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
