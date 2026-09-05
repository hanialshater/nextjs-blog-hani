'use client'

import { KBarSearchProvider } from 'pliny/search/KBar'
import { useRouter } from 'next/navigation'
import { CoreContent } from 'pliny/utils/contentlayer'
import { Blog } from 'contentlayer/generated'
import { useLocale } from '@/i18n/LocaleContext'
import { ReactNode } from 'react'
import { getPostRoutePath, getPostSection, isPublishedPost } from '@/lib/content/postRoutes'

interface Props {
  children: ReactNode
}

export default function LocalizedSearchProvider({ children }: Props) {
  const router = useRouter()
  const { locale, t } = useLocale()

  return (
    <KBarSearchProvider
      key={locale}
      kbarConfig={{
        searchDocumentsPath: 'search.json',
        defaultActions: [
          {
            id: 'homepage',
            name: t('nav.home'),
            keywords: '',
            shortcut: ['h', 'h'],
            section: t('nav.home'),
            perform: () => router.push(`/${locale}`),
          },
          {
            id: 'blog',
            name: t('nav.blog'),
            keywords: '',
            shortcut: ['b'],
            section: t('nav.home'),
            perform: () => router.push(`/${locale}/blog`),
          },
          {
            id: 'free-writing',
            name: t('nav.freeWriting'),
            keywords: '',
            shortcut: ['f'],
            section: t('nav.home'),
            perform: () => router.push(`/${locale}/free-writing`),
          },
          {
            id: 'projects',
            name: t('nav.projects'),
            keywords: '',
            shortcut: ['p'],
            section: t('nav.home'),
            perform: () => router.push(`/${locale}/projects`),
          },
          {
            id: 'about',
            name: t('nav.about'),
            keywords: '',
            shortcut: ['a'],
            section: t('nav.home'),
            perform: () => router.push(`/${locale}/about`),
          },
        ],
        onSearchDocumentsLoad(json) {
          // Filter posts by current locale
          const filteredPosts = json.filter(
            (post: CoreContent<Blog>) => (post.language || 'en') === locale && isPublishedPost(post)
          )
          return filteredPosts.map((post: CoreContent<Blog>) => ({
            id: post.path,
            name: post.title,
            keywords: post?.summary || '',
            section: t(getPostSection(post) === 'free-writing' ? 'nav.freeWriting' : 'nav.blog'),
            subtitle: post.tags?.join(', ') || '',
            perform: () => {
              router.push(getPostRoutePath(post, locale))
            },
          }))
        },
      }}
    >
      {children}
    </KBarSearchProvider>
  )
}
