import siteMetadata from '@/data/siteMetadata'
import type { Blog } from 'contentlayer/generated'

export type PostSection = 'blog' | 'free-writing'

const FREE_WRITING_CONTENT_PREFIX = 'free-writing-blog'

export function isFreeWritingPost(post: Pick<Blog, 'path'>) {
  return post.path.startsWith(FREE_WRITING_CONTENT_PREFIX)
}

export function isBlogPost(post: Pick<Blog, 'path'>) {
  return !isFreeWritingPost(post)
}

export function getPostSection(post: Pick<Blog, 'path'>): PostSection {
  return isFreeWritingPost(post) ? 'free-writing' : 'blog'
}

export function getPostRoutePath(post: Pick<Blog, 'path' | 'slug'>, locale: string) {
  return `/${locale}/${getPostSection(post)}/${post.slug}`
}

export function getPostCanonicalUrl(post: Pick<Blog, 'path' | 'slug'>, locale: string) {
  return `${siteMetadata.siteUrl}${getPostRoutePath(post, locale)}`
}

export function isPublishedPost(post: Pick<Blog, 'draft'>, includeDrafts = false) {
  return includeDrafts || !post.draft
}

export function isPostInLocale(post: Pick<Blog, 'language'>, locale: string) {
  return (post.language || 'en') === locale
}
