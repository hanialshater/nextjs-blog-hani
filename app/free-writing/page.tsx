import { allCoreContent, sortPosts } from 'pliny/utils/contentlayer'
import { allBlogs } from 'contentlayer/generated' // Changed from allFreeWritingBlogs
import { genPageMetadata } from 'app/seo'
import ListLayout from '@/layouts/ListLayout'

const POSTS_PER_PAGE = 5

export const metadata = genPageMetadata({ title: 'Free Writing' })

export default async function FreeWritingPage(props: { searchParams: Promise<{ page: string }> }) {
  const freeWritingPosts = allBlogs.filter((post) => post.path.startsWith('free-writing-blog'))
  const posts = allCoreContent(sortPosts(freeWritingPosts)) // Use filtered posts
  const pageNumber = 1
  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE)
  const initialDisplayPosts = posts.slice(0, POSTS_PER_PAGE * pageNumber)
  const pagination = {
    currentPage: pageNumber,
    totalPages: totalPages,
  }

  return (
    <ListLayout
      posts={posts}
      initialDisplayPosts={initialDisplayPosts}
      pagination={pagination}
      title="Free Writing" // Adjusted title
    />
  )
}
