// Shared by the app, Contentlayer, and RSS generation. Content paths are not URLs.
/** @param {{ path: string, section?: string }} post */
export function getPostSection(post) {
  if (post.path.startsWith('free-writing-blog/')) return 'free-writing'
  if (post.path.startsWith('blog/')) return 'blog'
  return post.section === 'free-writing' ? 'free-writing' : 'blog'
}

/** @param {{ path: string, section?: string, slug: string, language?: string }} post */
export function getPostRoutePath(post, locale = post.language || 'en') {
  return `/${locale}/${getPostSection(post)}/${post.slug}`
}
