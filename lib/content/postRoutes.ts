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

// A post and its translations share a key: the original's slug. Originals use
// their own slug; translations point back via `translationOf`.
export function getTranslationKey(post: Pick<Blog, 'slug' | 'translationOf'>) {
  return post.translationOf || post.slug
}

// Find the counterpart of `post` in another locale (e.g. the Arabic version of
// an English post, or the English original of an Arabic translation).
export function findTranslatedPost<
  T extends Pick<Blog, 'slug' | 'translationOf' | 'language' | 'path'>,
>(post: T, posts: T[], targetLocale: string): T | undefined {
  const key = getTranslationKey(post)
  return posts.find(
    (candidate) =>
      candidate !== post &&
      isPostInLocale(candidate, targetLocale) &&
      getTranslationKey(candidate) === key
  )
}
