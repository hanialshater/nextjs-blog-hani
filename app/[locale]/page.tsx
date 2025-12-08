import { sortPosts, allCoreContent } from 'pliny/utils/contentlayer'
import { allBlogs } from 'contentlayer/generated'
import Main from '../Main'
import { Locale, locales } from '@/i18n/config'

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const sortedPosts = sortPosts(allBlogs)
  const isDev = process.env.NODE_ENV === 'development'
  // Filter posts by language and draft status (show drafts only in dev)
  const filteredPosts = sortedPosts.filter(
    (post) => (post.language || 'en') === locale && (isDev || !post.draft)
  )
  const posts = allCoreContent(filteredPosts)
  return <Main posts={posts} />
}
