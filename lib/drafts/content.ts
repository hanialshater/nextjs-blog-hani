import 'server-only'

import { allBlogs } from 'contentlayer/generated'
import { sortPosts } from 'pliny/utils/contentlayer'

export async function getDrafts(locale: string) {
  return sortPosts(allBlogs.filter((post) => post.draft && (post.language || 'en') === locale))
}
