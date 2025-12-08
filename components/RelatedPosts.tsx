import Link from './Link'
import { CoreContent } from 'pliny/utils/contentlayer'
import type { Blog } from 'contentlayer/generated'
import { formatDate } from 'pliny/utils/formatDate'
import siteMetadata from '@/data/siteMetadata'

interface RelatedPostsProps {
  currentSlug: string
  currentTags: string[]
  allPosts: CoreContent<Blog>[]
  maxPosts?: number
}

const RelatedPosts = ({ currentSlug, currentTags, allPosts, maxPosts = 3 }: RelatedPostsProps) => {
  // Find posts with matching tags, excluding current post
  const relatedPosts = allPosts
    .filter((post) => {
      if (post.slug === currentSlug) return false
      if (!post.tags) return false
      return post.tags.some((tag) => currentTags.includes(tag))
    })
    .sort((a, b) => {
      // Sort by number of matching tags
      const aMatches = a.tags?.filter((tag) => currentTags.includes(tag)).length || 0
      const bMatches = b.tags?.filter((tag) => currentTags.includes(tag)).length || 0
      return bMatches - aMatches
    })
    .slice(0, maxPosts)

  if (relatedPosts.length === 0) return null

  return (
    <div className="mt-10 border-t border-gray-200 pt-8 dark:border-gray-700">
      <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
        Related Posts
      </h2>
      <ul className="mt-6 space-y-4">
        {relatedPosts.map((post) => (
          <li key={post.slug} className="group">
            <Link href={`/blog/${post.slug}`} className="block">
              <article className="hover:border-primary-500 dark:hover:border-primary-400 rounded-lg border border-gray-200 p-4 transition-colors dark:border-gray-700">
                <h3 className="group-hover:text-primary-500 dark:group-hover:text-primary-400 text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {post.title}
                </h3>
                <time
                  dateTime={post.date}
                  className="mt-1 block text-sm text-gray-500 dark:text-gray-400"
                >
                  {formatDate(post.date, siteMetadata.locale)}
                </time>
                {post.summary && (
                  <p className="mt-2 line-clamp-2 text-sm text-gray-600 dark:text-gray-300">
                    {post.summary}
                  </p>
                )}
              </article>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default RelatedPosts
