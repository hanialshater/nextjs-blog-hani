import { allBlogs } from 'contentlayer/generated'
import { allCoreContent, sortPosts } from 'pliny/utils/contentlayer'
import type { Blog } from 'contentlayer/generated'
import type { CoreContent } from 'pliny/utils/contentlayer'
import {
  isBlogPost,
  isFreeWritingPost,
  isPostInLocale,
  isPublishedPost,
  type PostSection,
} from './postRoutes'

export const POSTS_PER_PAGE = 5
export type PostCollection = PostSection | 'all'

export interface PaginationResult {
  currentPage: number
  totalPages: number
}

export interface PaginatedPostsResult {
  posts: CoreContent<Blog>[]
  initialDisplayPosts: CoreContent<Blog>[]
  pagination: PaginationResult
}

const sectionFilters: Record<PostSection, (post: Pick<Blog, 'path'>) => boolean> = {
  blog: isBlogPost,
  'free-writing': isFreeWritingPost,
}

export function shouldIncludeDrafts() {
  // Drafts are only available through authenticated /drafts routes, even locally.
  return false
}

export function getPublishedPostsBySection(
  section: PostCollection,
  locale: string,
  includeDrafts = shouldIncludeDrafts()
) {
  return sortPosts(
    allBlogs.filter(
      (post) =>
        (section === 'all' || sectionFilters[section](post)) &&
        isPostInLocale(post, locale) &&
        isPublishedPost(post, includeDrafts)
    )
  )
}

export function getCorePostsBySection(
  section: PostCollection,
  locale: string,
  includeDrafts = shouldIncludeDrafts()
) {
  return allCoreContent(getPublishedPostsBySection(section, locale, includeDrafts))
}

export function getPaginatedPosts(
  section: PostCollection,
  locale: string,
  pageNumber = 1,
  perPage = POSTS_PER_PAGE,
  includeDrafts = shouldIncludeDrafts()
): PaginatedPostsResult {
  const posts = getCorePostsBySection(section, locale, includeDrafts)
  const totalPages = Math.ceil(posts.length / perPage)
  const startIndex = (pageNumber - 1) * perPage
  const endIndex = startIndex + perPage

  return {
    posts,
    initialDisplayPosts: posts.slice(startIndex, endIndex),
    pagination: {
      currentPage: pageNumber,
      totalPages,
    },
  }
}

export function getPaginatedStaticParams(
  section: PostCollection,
  locales: readonly string[],
  perPage = POSTS_PER_PAGE
) {
  return locales.flatMap((locale) => {
    const totalPages = Math.ceil(
      getPublishedPostsBySection(section, locale, false).length / perPage
    )
    return Array.from({ length: totalPages }, (_, index) => ({
      locale,
      num: String(index + 1),
    }))
  })
}
