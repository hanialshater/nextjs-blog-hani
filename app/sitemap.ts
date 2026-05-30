import { MetadataRoute } from 'next'
import { allBlogs } from 'contentlayer/generated'
import miniDemosData from '@/data/miniDemosData'
import siteMetadata from '@/data/siteMetadata'
import { locales } from '@/i18n/config'
import { getPostRoutePath, getPostSection, isPublishedPost } from '@/lib/content/postRoutes'

export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = siteMetadata.siteUrl

  const blogRoutes = allBlogs
    .filter((post) => isPublishedPost(post))
    .map((post) => {
      const section = getPostSection(post)
      return {
        url: `${siteUrl}${getPostRoutePath(post, post.language || 'en')}`,
        lastModified: post.lastmod || post.date,
        changeFrequency: 'monthly' as const,
        priority: section === 'free-writing' ? 0.6 : 0.7,
      }
    })

  const staticRoutes = [
    { path: '', priority: 1.0, changeFrequency: 'weekly' as const },
    { path: 'blog', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: 'free-writing', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: 'projects', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: 'demos', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: 'about', priority: 0.7, changeFrequency: 'monthly' as const },
  ]

  const routes = staticRoutes.flatMap((route) =>
    locales.map((locale) => ({
      url: `${siteUrl}/${locale}/${route.path}`.replace(/\/$/, ''),
      lastModified: new Date().toISOString().split('T')[0],
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    }))
  )

  const demoRoutes = miniDemosData.flatMap((demo) =>
    locales.map((locale) => ({
      url: `${siteUrl}/${locale}/demos/${demo.slug}`,
      lastModified: new Date().toISOString().split('T')[0],
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }))
  )

  return [...routes, ...demoRoutes, ...blogRoutes]
}
