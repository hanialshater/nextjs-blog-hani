import { allCoreContent, sortPosts } from 'pliny/utils/contentlayer'
import { allBlogs } from 'contentlayer/generated'
import { genPageMetadata } from 'app/seo'
import ListLayout from '@/layouts/ListLayout'
import { Locale, locales, getTranslation } from '@/i18n/config'

const POSTS_PER_PAGE = 5

export const metadata = genPageMetadata({ title: 'Free Writing' })

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export default async function FreeWritingPage({
  params,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ page: string }>
}) {
  const { locale } = await params
  const isDev = process.env.NODE_ENV === 'development'
  const freeWritingPosts = allBlogs.filter(
    (post) =>
      post.path.startsWith('free-writing-blog') &&
      (post.language || 'en') === locale &&
      (isDev || !post.draft)
  )
  const posts = allCoreContent(sortPosts(freeWritingPosts))
  const pageNumber = 1
  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE)
  const initialDisplayPosts = posts.slice(0, POSTS_PER_PAGE * pageNumber)
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
