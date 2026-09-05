import 'css/prism.css'
import 'katex/dist/katex.css'

import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import { allBlogs, allAuthors, type Blog } from 'contentlayer/generated'
import { allCoreContent, coreContent } from 'pliny/utils/contentlayer'
import { MDXLayoutRenderer } from 'pliny/mdx-components'
import { components } from '@/components/MDXComponents'
import RelatedPosts from '@/components/RelatedPosts'
import siteMetadata from '@/data/siteMetadata'
import { locales, type Locale } from '@/i18n/config'
import { getPublishedPostsBySection, shouldIncludeDrafts } from '@/lib/content/posts'
import {
  findTranslatedPost,
  getPostCanonicalUrl,
  getPostRoutePath,
  getPostSection,
  isPostInLocale,
  isPublishedPost,
  type PostSection,
} from '@/lib/content/postRoutes'
import PostLayout from './PostLayout'
import PostSimple from './PostSimple'
import PostBanner from './PostBanner'

export type ArticleProps = { params: Promise<{ locale: string; slug: string[] }> }

function findPost(locale: string, slug: string[], section: PostSection) {
  const matches = allBlogs.filter(
    (post) =>
      post.slug === slug.join('/') &&
      isPostInLocale(post, locale) &&
      isPublishedPost(post, shouldIncludeDrafts())
  )
  return matches.find((post) => getPostSection(post) === section) || matches[0]
}

function getAuthors(post: Blog, locale: string) {
  return (post.authors || ['default']).flatMap((slug) => {
    const author =
      allAuthors.find((entry) => entry.slug === slug && entry.language === locale) ||
      allAuthors.find((entry) => entry.slug === slug && entry.language === 'en')
    return author ? [coreContent(author)] : []
  })
}

function languageAlternates(post: Blog) {
  const published = allBlogs.filter((candidate) => isPublishedPost(candidate))
  return Object.fromEntries(
    locales.flatMap((locale) => {
      const translated = isPostInLocale(post, locale)
        ? post
        : findTranslatedPost(post, published, locale)
      return translated ? [[locale, getPostCanonicalUrl(translated, locale)]] : []
    })
  )
}

export async function generateArticleMetadata(
  props: ArticleProps,
  section: PostSection
): Promise<Metadata> {
  const { locale, slug } = await props.params
  const post = findPost(locale, slug, section)
  if (!post) return {}
  const canonical = getPostCanonicalUrl(post, locale)
  const images: string[] =
    typeof post.images === 'string'
      ? [post.images]
      : post.images?.length
        ? post.images
        : [siteMetadata.socialBanner]
  const absoluteImages = images.map((image) => new URL(image, siteMetadata.siteUrl).href)
  return {
    title: post.title,
    description: post.summary,
    alternates: { canonical, languages: languageAlternates(post) },
    robots: post.draft ? { index: false, follow: false } : undefined,
    openGraph: {
      title: post.title,
      description: post.summary,
      siteName: siteMetadata.title,
      locale: locale === 'ar' ? 'ar_SA' : 'en_US',
      type: 'article',
      publishedTime: post.date,
      modifiedTime: post.lastmod || post.date,
      url: canonical,
      images: absoluteImages,
      authors: getAuthors(post, locale).map((author) => author.name),
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.summary,
      images: absoluteImages,
    },
  }
}

export function getArticleStaticParams(section: PostSection) {
  // /blog/<slug> also preserves the old shared/RSS links to Free Writing posts.
  return allBlogs
    .filter(
      (post) => isPublishedPost(post) && (section === 'blog' || getPostSection(post) === section)
    )
    .map((post) => ({ locale: post.language || 'en', slug: post.slug.split('/') }))
}

export default async function ArticlePage({
  params,
  section,
}: ArticleProps & { section: PostSection }) {
  const { locale, slug } = await params
  const post = findPost(locale, slug, section)
  if (!post) notFound()
  if (getPostSection(post) !== section) permanentRedirect(getPostRoutePath(post, locale))

  const posts = getPublishedPostsBySection(section, locale)
  const index = posts.findIndex((entry) => entry.slug === post.slug)
  const authorDetails = getAuthors(post, locale)
  const otherLocale: Locale = locale === 'ar' ? 'en' : 'ar'
  const translatedPost = findTranslatedPost(
    post,
    allBlogs.filter((entry) => isPublishedPost(entry)),
    otherLocale
  )
  const translation = translatedPost
    ? { locale: otherLocale, path: getPostRoutePath(translatedPost, otherLocale) }
    : undefined
  const content = coreContent(post)
  const layouts = { PostLayout, PostSimple, PostBanner }
  const Layout = layouts[post.layout as keyof typeof layouts] || PostLayout
  const jsonLd = {
    ...post.structuredData,
    url: getPostCanonicalUrl(post, locale),
    inLanguage: locale,
    author: authorDetails.map((author) => ({ '@type': 'Person', name: author.name })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <Layout
        content={content}
        authorDetails={authorDetails}
        prev={posts[index + 1]}
        next={posts[index - 1]}
        translation={translation}
      >
        <MDXLayoutRenderer code={post.body.code} components={components} toc={post.toc} />
        <RelatedPosts
          currentSlug={post.slug}
          currentTags={post.tags || []}
          allPosts={allCoreContent(posts)}
          locale={locale}
        />
      </Layout>
    </>
  )
}
