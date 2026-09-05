import { writeFileSync } from 'fs'
import { escape } from 'pliny/utils/htmlEscaper.js'
import siteMetadata from '../data/siteMetadata.js'
import { allBlogs } from '../.contentlayer/generated/index.mjs'
import { getPostRoutePath } from '../lib/content/postPaths.mjs'

const outputFolder = process.env.EXPORT ? 'out' : 'public'

export function generateRss(config, posts) {
  const published = posts
    .filter((post) => !post.draft)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
  const items = published
    .map((post) => {
      const url = escape(`${config.siteUrl}${getPostRoutePath(post)}`)
      return `<item>
      <guid isPermaLink="true">${url}</guid>
      <title>${escape(post.title)}</title>
      <link>${url}</link>
      ${post.summary ? `<description>${escape(post.summary)}</description>` : ''}
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <author>${escape(`${config.email} (${config.author})`)}</author>
      ${(post.tags || []).map((tag) => `<category>${escape(tag)}</category>`).join('')}
    </item>`
    })
    .join('')
  return `<?xml version="1.0" encoding="UTF-8"?>
    <rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
      <channel>
        <title>${escape(config.title)}</title>
        <link>${escape(config.siteUrl)}/en/blog</link>
        <description>${escape(config.description)}</description>
        <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
        <atom:link href="${escape(config.siteUrl)}/feed.xml" rel="self" type="application/rss+xml"/>
        ${items}
      </channel>
    </rss>`
}

export default function rss() {
  writeFileSync(`${outputFolder}/feed.xml`, generateRss(siteMetadata, allBlogs))
  console.log('RSS feed generated...')
}
