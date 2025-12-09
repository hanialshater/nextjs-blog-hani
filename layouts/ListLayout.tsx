'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { formatDate } from 'pliny/utils/formatDate'
import { CoreContent } from 'pliny/utils/contentlayer'
import type { Blog } from 'contentlayer/generated'
import Link from '@/components/Link'
import siteMetadata from '@/data/siteMetadata'
import { useLocale } from '@/i18n/LocaleContext'

interface PaginationProps {
  totalPages: number
  currentPage: number
  t: (key: string) => string
  locale: string
}
interface ListLayoutProps {
  posts: CoreContent<Blog>[]
  title: string
  initialDisplayPosts?: CoreContent<Blog>[]
  pagination?: {
    totalPages: number
    currentPage: number
  }
  basePath?: string
}

function Pagination({ totalPages, currentPage, t, locale }: PaginationProps) {
  const pathname = usePathname()
  const basePath = pathname
    .replace(/^\//, '') // Remove leading slash
    .replace(/\/page\/\d+\/?$/, '') // Remove any trailing /page
    .replace(/\/$/, '') // Remove trailing slash
  const prevPage = currentPage - 1 > 0
  const nextPage = currentPage + 1 <= totalPages

  return (
    <div className="space-y-2 pt-6 pb-8 md:space-y-5">
      <nav className="flex justify-between">
        {!prevPage && (
          <button className="cursor-auto disabled:opacity-50" disabled={!prevPage}>
            {t('common.previous')}
          </button>
        )}
        {prevPage && (
          <Link
            href={currentPage - 1 === 1 ? `/${basePath}/` : `/${basePath}/page/${currentPage - 1}`}
            rel="prev"
          >
            {t('common.previous')}
          </Link>
        )}
        <span>
          {currentPage} / {totalPages}
        </span>
        {!nextPage && (
          <button className="cursor-auto disabled:opacity-50" disabled={!nextPage}>
            {t('common.next')}
          </button>
        )}
        {nextPage && (
          <Link href={`/${basePath}/page/${currentPage + 1}`} rel="next">
            {t('common.next')}
          </Link>
        )}
      </nav>
    </div>
  )
}

export default function ListLayout({
  posts,
  title,
  initialDisplayPosts = [],
  pagination,
  basePath = 'blog',
}: ListLayoutProps) {
  const { locale, t, dir } = useLocale()
  const isRTL = dir === 'rtl'
  const dateLocale = locale === 'ar' ? 'ar-SA' : 'en-US'

  const [searchValue, setSearchValue] = useState('')
  const filteredBlogPosts = posts.filter((post) => {
    const searchContent = post.title + post.summary + post.tags?.join(' ')
    return searchContent.toLowerCase().includes(searchValue.toLowerCase())
  })

  // If initialDisplayPosts exist, display it if no searchValue is specified
  const displayPosts =
    initialDisplayPosts.length > 0 && !searchValue ? initialDisplayPosts : filteredBlogPosts

  return (
    <>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        <div className="space-y-2 pt-6 pb-8 md:space-y-5">
          <h1 className="text-3xl leading-9 font-extrabold tracking-tight text-gray-900 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14 dark:text-gray-100">
            {title}
          </h1>
          <div className="relative max-w-lg">
            <label>
              <span className="sr-only">{t('common.searchArticles')}</span>
              <input
                aria-label={t('common.searchArticles')}
                type="text"
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder={t('common.searchArticles')}
                className={`focus:border-primary-500 focus:ring-primary-500 block w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 dark:border-gray-900 dark:bg-gray-800 dark:text-gray-100 ${isRTL ? 'text-right' : ''}`}
              />
            </label>
            <svg
              className={`absolute top-3 h-5 w-5 text-gray-400 dark:text-gray-300 ${isRTL ? 'left-3' : 'right-3'}`}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
        <ul>
          {!filteredBlogPosts.length && t('blog.noPostsFound')}
          {displayPosts.map((post) => {
            const { slug, date, title, summary, tags } = post
            return (
              <li key={slug} className="py-4">
                <article
                  className={`space-y-2 xl:grid xl:grid-cols-4 xl:items-baseline xl:space-y-0 ${isRTL ? 'text-right' : ''}`}
                >
                  <dl>
                    <dt className="sr-only">{t('blog.publishedOn')}</dt>
                    <dd className="text-base leading-6 font-medium text-gray-500 dark:text-gray-400">
                      <time dateTime={date}>{formatDate(date, dateLocale)}</time>
                    </dd>
                  </dl>
                  <div className="space-y-3 xl:col-span-3">
                    <div>
                      <h3 className="text-2xl leading-8 font-bold tracking-tight">
                        <Link
                          href={`/${locale}/${basePath}/${slug}`}
                          className="text-gray-900 dark:text-gray-100"
                        >
                          {title}
                        </Link>
                      </h3>
                      <div className={`flex flex-wrap ${isRTL ? 'justify-end' : ''}`}>
                        {tags?.map((tag) => (
                          <span
                            key={tag}
                            className={`text-primary-500 hover:text-primary-600 dark:hover:text-primary-400 text-sm font-medium uppercase ${isRTL ? 'ml-3' : 'mr-3'}`}
                          >
                            {tag.split(' ').join('-')}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="prose max-w-none text-gray-500 dark:text-gray-400">
                      {summary}
                    </div>
                  </div>
                </article>
              </li>
            )
          })}
        </ul>
      </div>
      {pagination && pagination.totalPages > 1 && !searchValue && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          t={t}
          locale={locale}
        />
      )}
    </>
  )
}
