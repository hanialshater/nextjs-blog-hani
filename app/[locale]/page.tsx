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
  // Filter posts by language (default to 'en' if not specified)
  const filteredPosts = sortedPosts.filter((post) => (post.language || 'en') === locale)
  const posts = allCoreContent(filteredPosts)
  return <Main posts={posts} />
}
