import { allCoreContent, sortPosts } from 'pliny/utils/contentlayer'
import { allBlogs } from 'contentlayer/generated'
import { genPageMetadata } from 'app/seo'
import ListLayout from '@/layouts/ListLayout'
import { Locale, locales, getTranslation } from '@/i18n/config'
import { notFound } from 'next/navigation'

const POSTS_PER_PAGE = 5

export const metadata = genPageMetadata({ title: 'Blog' })

export async function generateStaticParams() {
  const params: { locale: string; num: string }[] = []

  for (const locale of locales) {
    const allPosts = sortPosts(allBlogs)
    const filteredPosts = allPosts.filter((post) => (post.language || 'en') === locale)
    const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE)

    for (let i = 1; i <= totalPages; i++) {
      params.push({ locale, num: String(i) })
    }
  }

  return params
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

  const allPosts = sortPosts(allBlogs)
  const isDev = process.env.NODE_ENV === 'development'
  // Filter posts by language and draft status (show drafts only in dev)
  const filteredPosts = allPosts.filter(
    (post) => (post.language || 'en') === locale && (isDev || !post.draft)
  )
  const posts = allCoreContent(filteredPosts)
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
      title={t('blog.allPosts')}
      basePath="blog"
    />
  )
}
