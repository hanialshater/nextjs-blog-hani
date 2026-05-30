import siteMetadata from '@/data/siteMetadata'
import type { Blog } from 'contentlayer/generated'

export type PostSection = 'blog' | 'free-writing'

const FREE_WRITING_CONTENT_PREFIX = 'free-writing-blog'
const BLOG_CONTENT_PREFIX = 'blog'

// Accepts either a full post or just the fields needed to resolve its section.
type SectionInput = Pick<Blog, 'path'> & Partial<Pick<Blog, 'section'>>

export function getPostSection(post: SectionInput): PostSection {
  // Legacy layout encodes the section in the top-level content folder.
  if (post.path.startsWith(FREE_WRITING_CONTENT_PREFIX)) return 'free-writing'
  if (post.path.startsWith(BLOG_CONTENT_PREFIX)) return 'blog'
  // Co-located bundles (data/posts/<slug>/) declare their section in frontmatter.
  return post.section === 'free-writing' ? 'free-writing' : 'blog'
}

export function isFreeWritingPost(post: SectionInput) {
  return getPostSection(post) === 'free-writing'
}

export function isBlogPost(post: SectionInput) {
  return getPostSection(post) === 'blog'
}

export function getPostRoutePath(post: SectionInput & Pick<Blog, 'slug'>, locale: string) {
  return `/${locale}/${getPostSection(post)}/${post.slug}`
}

export function getPostCanonicalUrl(post: SectionInput & Pick<Blog, 'slug'>, locale: string) {
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
