import { MetadataRoute } from 'next'
import { allBlogs } from 'contentlayer/generated'
import siteMetadata from '@/data/siteMetadata'
import { locales } from '@/i18n/config'

export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = siteMetadata.siteUrl

  const blogRoutes = allBlogs
    .filter((post) => !post.draft)
    .map((post) => {
      const isFreeWriting = post.path.startsWith('free-writing-blog')
      return {
        url: `${siteUrl}/${post.language || 'en'}/${isFreeWriting ? 'free-writing' : 'blog'}/${
          post.slug
        }`,
        lastModified: post.lastmod || post.date,
        changeFrequency: 'monthly' as const,
        priority: isFreeWriting ? 0.6 : 0.7,
      }
    })

  const staticRoutes = [
    { path: '', priority: 1.0, changeFrequency: 'weekly' as const },
    { path: 'blog', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: 'free-writing', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: 'projects', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: 'tags', priority: 0.5, changeFrequency: 'monthly' as const },
  ]

  const routes = staticRoutes.flatMap((route) =>
    locales.map((locale) => ({
      url: `${siteUrl}/${locale}/${route.path}`.replace(/\/$/, ''),
      lastModified: new Date().toISOString().split('T')[0],
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    }))
  )

  return [...routes, ...blogRoutes]
}
