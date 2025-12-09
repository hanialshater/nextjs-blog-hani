import 'css/prism.css'
import 'katex/dist/katex.css'

import PageTitle from '@/components/PageTitle'
import { components } from '@/components/MDXComponents'
import { MDXLayoutRenderer } from 'pliny/mdx-components'
import { sortPosts, coreContent, allCoreContent } from 'pliny/utils/contentlayer'
import { allBlogs, allAuthors } from 'contentlayer/generated'
import type { Authors, Blog } from 'contentlayer/generated'
import PostSimple from '@/layouts/PostSimple'
import PostLayout from '@/layouts/PostLayout'
import PostBanner from '@/layouts/PostBanner'
import RelatedPosts from '@/components/RelatedPosts'
import { Metadata } from 'next'
import siteMetadata from '@/data/siteMetadata'
import { notFound } from 'next/navigation'
import { locales } from '@/i18n/config'

const defaultLayout = 'PostLayout'
const layouts: Record<string, typeof PostLayout | typeof PostSimple | typeof PostBanner> = {
  PostSimple,
  PostLayout,
  PostBanner,
}

// Filter to only free-writing posts
const freeWritingPosts = allBlogs.filter((p) => p.path.startsWith('free-writing-blog'))

export async function generateMetadata(props: {
  params: Promise<{ locale: string; slug: string[] }>
}): Promise<Metadata | undefined> {
  const params = await props.params
  const slug = decodeURI(params.slug.join('/'))
  const post = freeWritingPosts.find(
    (p) => p.slug === slug && (p.language || 'en') === params.locale
  )
  const authorList = post?.authors || ['default']
  const authorDetails = authorList.map((author) => {
    const authorResults = allAuthors.find((p) => p.slug === author)
    return coreContent(authorResults as Authors)
  })
  if (!post) {
    return
  }

  const publishedAt = new Date(post.date).toISOString()
  const modifiedAt = new Date(post.lastmod || post.date).toISOString()
  const authors = authorDetails.map((author) => author.name)
  let imageList = [siteMetadata.socialBanner]
  if (post.images) {
    imageList = typeof post.images === 'string' ? [post.images] : post.images
  }
  const ogImages = imageList.map((img) => {
    return {
      url: img && img.includes('http') ? img : siteMetadata.siteUrl + img,
    }
  })

  return {
    title: post.title,
    description: post.summary,
    openGraph: {
      title: post.title,
      description: post.summary,
      siteName: siteMetadata.title,
      locale: params.locale === 'ar' ? 'ar_SA' : 'en_US',
      type: 'article',
      publishedTime: publishedAt,
      modifiedTime: modifiedAt,
      url: `${siteMetadata.siteUrl}/${params.locale}/free-writing/${post.slug}`,
      images: ogImages,
      authors: authors.length > 0 ? authors : [siteMetadata.author],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.summary,
      images: imageList,
    },
  }
}

export const generateStaticParams = async () => {
  const params: { locale: string; slug: string[] }[] = []
  for (const locale of locales) {
    for (const post of freeWritingPosts) {
      if ((post.language || 'en') === locale) {
        params.push({
          locale,
          slug: post.slug.split('/').map((name) => decodeURI(name)),
        })
      }
    }
  }
  return params
}

export default async function Page(props: { params: Promise<{ locale: string; slug: string[] }> }) {
  const params = await props.params
  const { locale } = params
  const slug = decodeURI(params.slug.join('/'))

  // Filter posts by locale for navigation (only free-writing posts)
  const allLocalePosts = freeWritingPosts.filter((p) => (p.language || 'en') === locale)
  const sortedCoreContents = allCoreContent(sortPosts(allLocalePosts))
  const postIndex = sortedCoreContents.findIndex((p) => p.slug === slug)

  if (postIndex === -1) {
    return notFound()
  }

  const prev = sortedCoreContents[postIndex + 1]
  const next = sortedCoreContents[postIndex - 1]
  const post = freeWritingPosts.find(
    (p) => p.slug === slug && (p.language || 'en') === locale
  ) as Blog
  const authorList = post?.authors || ['default']
  const authorDetails = authorList.map((author) => {
    const authorResults = allAuthors.find((p) => p.slug === author)
    return coreContent(authorResults as Authors)
  })
  const mainContent = {
    ...coreContent(post),
    translationOf: post.translationOf,
    originalLanguage: post.originalLanguage,
    draft: post.draft,
    project: post.project,
  }
  const jsonLd = post.structuredData
  jsonLd['author'] = authorDetails.map((author) => {
    return {
      '@type': 'Person',
      name: author.name,
    }
  })

  const Layout = layouts[post.layout || defaultLayout]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Layout content={mainContent} authorDetails={authorDetails} next={next} prev={prev}>
        <MDXLayoutRenderer code={post.body.code} components={components} toc={post.toc} />
        {mainContent.tags && (
          <RelatedPosts
            currentSlug={slug}
            currentTags={mainContent.tags}
            allPosts={sortedCoreContents}
          />
        )}
      </Layout>
    </>
  )
}
