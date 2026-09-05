import 'server-only'

import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { allBlogs } from 'contentlayer/generated'
import { sortPosts } from 'pliny/utils/contentlayer'
import { hasDraftAccess } from './access'

export async function requireDraftAccess() {
  // Verify at the data boundary as well as middleware. A rewrite or middleware
  // bypass must never expose a draft's metadata, MDX, or React Server Component payload.
  if (!(await hasDraftAccess((await headers()).get('authorization')))) notFound()
}

export async function getDrafts(locale: string) {
  await requireDraftAccess()
  return sortPosts(allBlogs.filter((post) => post.draft && (post.language || 'en') === locale))
}
