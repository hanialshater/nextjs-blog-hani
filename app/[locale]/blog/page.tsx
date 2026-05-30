import { genLocalizedPageMetadata } from 'app/seo'
import ListLayout from '@/layouts/ListLayout'
import { Locale, locales, getTranslation } from '@/i18n/config'
import { getPaginatedPosts } from '@/lib/content/posts'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  return genLocalizedPageMetadata({ title: 'Blog', locale, path: 'blog' })
}

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ page: string }>
}) {
  const { locale } = await params
  const { posts, initialDisplayPosts, pagination } = getPaginatedPosts('blog', locale)

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
