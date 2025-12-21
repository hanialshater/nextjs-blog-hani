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
      const info = {
        url: `${siteUrl}/${post.language || 'en'}/${isFreeWriting ? 'free-writing' : 'blog'}/${
          post.slug
        }`,
        lastModified: post.lastmod || post.date,
      }
      return info
    })

  const routes = ['', 'blog', 'free-writing', 'projects', 'tags'].flatMap((route) =>
    locales.map((locale) => ({
      url: `${siteUrl}/${locale}/${route}`.replace(/\/$/, ''), // Remove trailing slash if route is empty
      lastModified: new Date().toISOString().split('T')[0],
    }))
  )

  return [...routes, ...blogRoutes]
}
