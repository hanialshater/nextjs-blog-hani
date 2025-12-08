'use client'

import { ReactNode } from 'react'
import { CoreContent } from 'pliny/utils/contentlayer'
import type { Blog, Authors } from 'contentlayer/generated'
import Comments from '@/components/Comments'
import Link from '@/components/Link'
import PageTitle from '@/components/PageTitle'
import SectionContainer from '@/components/SectionContainer'
import Image from '@/components/Image'
import siteMetadata from '@/data/siteMetadata'
import ScrollTopAndComment from '@/components/ScrollTopAndComment'
import ReadingProgressBar from '@/components/ReadingProgressBar'
import ShareButtons from '@/components/ShareButtons'
import { useLocale } from '@/i18n/LocaleContext'

const postDateTemplate: Intl.DateTimeFormatOptions = {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
}

interface LayoutProps {
  content: CoreContent<Blog>
  authorDetails: CoreContent<Authors>[]
  next?: { path: string; title: string; slug: string }
  prev?: { path: string; title: string; slug: string }
  children: ReactNode
}

export default function PostLayout({ content, authorDetails, next, prev, children }: LayoutProps) {
  const { locale, t, dir } = useLocale()
  const isRTL = dir === 'rtl'

  const { path, slug, date, title, tags, readingTime, translationOf, originalLanguage, draft } =
    content
  const basePath = path.split('/')[0]
  const postUrl = `${siteMetadata.siteUrl}/${locale}/blog/${slug}`

  // Get locale for date formatting
  const dateLocale = locale === 'ar' ? 'ar-SA' : 'en-US'

  // Prefix links with locale
  const localizeHref = (href: string) => {
    if (href.startsWith('/')) {
      return `/${locale}${href}`
    }
    return href
  }

  return (
    <SectionContainer>
      <ReadingProgressBar />
      <ScrollTopAndComment />
      <article>
        <div className="xl:divide-y xl:divide-gray-200 xl:dark:divide-gray-700">
          <header className="pt-6 xl:pb-6">
            <div className="space-y-1 text-center">
              <dl className="space-y-10">
                <div>
                  <dt className="sr-only">{t('blog.publishedOn')}</dt>
                  <dd className="text-base leading-6 font-medium text-gray-500 dark:text-gray-400">
                    <time dateTime={date}>
                      {new Date(date).toLocaleDateString(dateLocale, postDateTemplate)}
                    </time>
                    {readingTime && <span className="mx-2">·</span>}
                    {readingTime && (
                      <span>
                        {Math.ceil(readingTime.minutes)} {t('blog.minRead')}
                      </span>
                    )}
                  </dd>
                </div>
              </dl>
              <div>
                <PageTitle>{title}</PageTitle>
              </div>
              {draft && (
                <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800 dark:bg-red-900/30 dark:text-red-200">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <span>{t('blog.draft')}</span>
                </div>
              )}
              {translationOf && (
                <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                    />
                  </svg>
                  <span>{t('blog.autoTranslated')}</span>
                  <span className="mx-1">·</span>
                  <Link
                    href={`/${originalLanguage || 'en'}/blog/${translationOf}`}
                    className="font-medium underline hover:no-underline"
                  >
                    {t('blog.viewOriginal')}
                  </Link>
                </div>
              )}
            </div>
          </header>
          <div
            className={`grid-rows-[auto_1fr] divide-y divide-gray-200 pb-8 xl:grid xl:grid-cols-4 xl:gap-x-6 xl:divide-y-0 dark:divide-gray-700 ${isRTL ? 'xl:direction-rtl' : ''}`}
          >
            <dl
              className={`pt-6 pb-10 xl:border-b xl:border-gray-200 xl:pt-11 xl:dark:border-gray-700 ${isRTL ? 'xl:col-start-4' : ''}`}
            >
              <dt className="sr-only">Authors</dt>
              <dd>
                <ul
                  className={`flex flex-wrap justify-center gap-4 sm:gap-x-12 xl:block xl:space-y-8 ${isRTL ? 'xl:text-right' : ''}`}
                >
                  {authorDetails.map((author) => (
                    <li
                      className={`flex items-center gap-x-2 ${isRTL ? 'flex-row-reverse' : ''}`}
                      key={author.name}
                    >
                      {author.avatar && (
                        <Image
                          src={author.avatar}
                          width={38}
                          height={38}
                          alt={`Avatar of ${author.name}`}
                          className="h-10 w-10 rounded-full"
                        />
                      )}
                      <dl
                        className={`text-sm leading-5 font-medium whitespace-nowrap ${isRTL ? 'text-right' : ''}`}
                      >
                        <dt className="sr-only">Name</dt>
                        <dd className="text-gray-900 dark:text-gray-100">{author.name}</dd>
                        <dt className="sr-only">Twitter</dt>
                        <dd>
                          {author.twitter && (
                            <Link
                              href={author.twitter}
                              className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
                            >
                              {author.twitter
                                .replace('https://twitter.com/', '@')
                                .replace('https://x.com/', '@')}
                            </Link>
                          )}
                        </dd>
                      </dl>
                    </li>
                  ))}
                </ul>
              </dd>
            </dl>
            <div
              className={`divide-y divide-gray-200 xl:col-span-3 xl:row-span-2 xl:pb-0 dark:divide-gray-700 ${isRTL ? 'xl:col-start-1 xl:col-end-4' : ''}`}
            >
              <div className="prose dark:prose-invert max-w-none pt-10 pb-8">{children}</div>
              <div className={`flex pt-6 pb-6 ${isRTL ? 'justify-start' : 'justify-end'}`}>
                <ShareButtons url={postUrl} title={title} />
              </div>
              {siteMetadata.comments && (
                <div
                  className="pt-6 pb-6 text-center text-gray-700 dark:text-gray-300"
                  id="comment"
                >
                  <Comments slug={slug} />
                </div>
              )}
            </div>
            <footer className={isRTL ? 'xl:col-start-4 xl:row-start-2' : ''}>
              <div className="divide-gray-200 text-sm leading-5 font-medium xl:divide-y dark:divide-gray-700">
                {tags && (
                  <div className={`py-4 xl:py-8 ${isRTL ? 'text-right' : ''}`}>
                    <h2 className="text-xs tracking-wide text-gray-500 uppercase dark:text-gray-400">
                      {t('blog.tags')}
                    </h2>
                    <div className={`flex flex-wrap ${isRTL ? 'justify-end' : ''}`}>
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className={`text-primary-500 hover:text-primary-600 dark:hover:text-primary-400 text-sm font-medium uppercase ${isRTL ? 'ml-3' : 'mr-3'}`}
                        >
                          {tag.split(' ').join('-')}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {(next || prev) && (
                  <div
                    className={`flex justify-between py-4 xl:block xl:space-y-8 xl:py-8 ${isRTL ? 'flex-row-reverse text-right' : ''}`}
                  >
                    {prev && prev.slug && (
                      <div>
                        <h2 className="text-xs tracking-wide text-gray-500 uppercase dark:text-gray-400">
                          {t('blog.previousArticle')}
                        </h2>
                        <div className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400">
                          <Link href={localizeHref(`/blog/${prev.slug}`)}>{prev.title}</Link>
                        </div>
                      </div>
                    )}
                    {next && next.slug && (
                      <div>
                        <h2 className="text-xs tracking-wide text-gray-500 uppercase dark:text-gray-400">
                          {t('blog.nextArticle')}
                        </h2>
                        <div className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400">
                          <Link href={localizeHref(`/blog/${next.slug}`)}>{next.title}</Link>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className={`pt-4 xl:pt-8 ${isRTL ? 'text-right' : ''}`}>
                <Link
                  href={localizeHref(`/${basePath}`)}
                  className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
                  aria-label={t('blog.backToBlog')}
                >
                  {isRTL ? <>{t('blog.backToBlog')} &rarr;</> : <>&larr; {t('blog.backToBlog')}</>}
                </Link>
              </div>
            </footer>
          </div>
        </div>
      </article>
    </SectionContainer>
  )
}
