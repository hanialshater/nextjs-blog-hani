import { notFound } from 'next/navigation'
import { allCoreContent, sortPosts } from 'pliny/utils/contentlayer'
import { allBlogs } from 'contentlayer/generated'
import { Metadata } from 'next'
import { locales, Locale, getTranslation, localeDirection } from '@/i18n/config'
import projectsData, { getLocalizedProject } from '@/data/projectsData'
import siteMetadata from '@/data/siteMetadata'
import TagCloud from '@/components/TagCloud'
import Link from '@/components/Link'
import { formatDate } from 'pliny/utils/formatDate'

interface PageProps {
  params: Promise<{ locale: string; slug: string }>
}

export async function generateStaticParams() {
  const params: { locale: string; slug: string }[] = []

  for (const locale of locales) {
    for (const project of projectsData) {
      params.push({ locale, slug: project.slug })
    }
  }

  return params
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params
  const project = projectsData.find((p) => p.slug === slug)

  if (!project) return {}

  const localized = getLocalizedProject(project, locale)

  return {
    title: localized.title,
    description: localized.description,
    openGraph: {
      title: localized.title,
      description: localized.description,
      url: `${siteMetadata.siteUrl}/${locale}/projects/${slug}`,
      siteName: siteMetadata.title,
      locale: locale === 'ar' ? 'ar_SA' : 'en_US',
      type: 'website',
    },
  }
}

export default async function ProjectPage({ params }: PageProps) {
  const { locale, slug } = await params

  // Find the project
  const project = projectsData.find((p) => p.slug === slug)
  if (!project) {
    return notFound()
  }

  const localized = getLocalizedProject(project, locale)
  const t = (key: string) => getTranslation(locale as Locale, key)
  const isRTL = localeDirection[locale as Locale] === 'rtl'
  const dateLocale = locale === 'ar' ? 'ar-SA' : 'en-US'

  // Get posts for this project
  const isDev = process.env.NODE_ENV === 'development'
  const projectPosts = sortPosts(
    allBlogs.filter(
      (post) =>
        post.project === slug && (post.language || 'en') === locale && (isDev || !post.draft)
    )
  )
  const posts = allCoreContent(projectPosts)

  // Extract unique tags from project posts
  const tagCounts = posts.reduce(
    (acc, post) => {
      post.tags?.forEach((tag) => {
        acc[tag] = (acc[tag] || 0) + 1
      })
      return acc
    },
    {} as Record<string, number>
  )

  const tags = Object.entries(tagCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)

  return (
    <div className={`divide-y divide-gray-200 dark:divide-gray-700 ${isRTL ? 'text-right' : ''}`}>
      {/* Project Header */}
      <div className="space-y-2 pt-6 pb-8 md:space-y-5">
        <h1 className="text-3xl leading-9 font-extrabold tracking-tight text-gray-900 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14 dark:text-gray-100">
          {project.icon && <span className="mr-3">{project.icon}</span>}
          {localized.title}
        </h1>
        <p className="text-lg leading-7 text-gray-500 dark:text-gray-400">
          {localized.description}
        </p>

        {/* Project Tags */}
        {tags.length > 0 && (
          <div className="pt-4">
            <TagCloud tags={tags} showCounts={false} maxTags={10} />
          </div>
        )}
      </div>

      {/* Posts List */}
      <div className="py-8">
        <h2 className="mb-6 text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          {t('blog.relatedPosts')} ({posts.length})
        </h2>

        {posts.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">{t('project.noPostsYet')}</p>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {posts.map((post) => {
              const basePath = post.path?.startsWith('free-writing-blog') ? 'free-writing' : 'blog'
              return (
                <li key={post.slug} className="py-4">
                  <article className={`space-y-2 ${isRTL ? 'text-right' : ''}`}>
                    <div>
                      <h3 className="text-xl leading-8 font-bold tracking-tight">
                        <Link
                          href={`/${locale}/${basePath}/${post.slug}`}
                          className="text-gray-900 dark:text-gray-100"
                        >
                          {post.title}
                        </Link>
                      </h3>
                      <time
                        dateTime={post.date}
                        className="text-sm text-gray-500 dark:text-gray-400"
                      >
                        {formatDate(post.date, dateLocale)}
                      </time>
                    </div>
                    {post.summary && (
                      <p className="prose max-w-none text-gray-500 dark:text-gray-400">
                        {post.summary}
                      </p>
                    )}
                  </article>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
