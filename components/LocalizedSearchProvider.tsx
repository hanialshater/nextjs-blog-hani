'use client'

import { KBarSearchProvider } from 'pliny/search/KBar'
import { useRouter } from 'next/navigation'
import { CoreContent } from 'pliny/utils/contentlayer'
import { Blog } from 'contentlayer/generated'
import { useLocale } from '@/i18n/LocaleContext'
import { ReactNode } from 'react'

interface Props {
  children: ReactNode
}

export default function LocalizedSearchProvider({ children }: Props) {
  const router = useRouter()
  const { locale, t } = useLocale()

  return (
    <KBarSearchProvider
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
            (post: CoreContent<Blog> & { language?: string }) => (post.language || 'en') === locale
          )
          return filteredPosts.map((post: CoreContent<Blog>) => ({
            id: post.path,
            name: post.title,
            keywords: post?.summary || '',
            section: t('nav.blog'),
            subtitle: post.tags?.join(', ') || '',
            perform: () => {
              const basePath = post.path?.startsWith('free-writing-blog') ? 'free-writing' : 'blog'
              router.push(`/${locale}/${basePath}/${post.slug}`)
            },
          }))
        },
      }}
    >
      {children}
    </KBarSearchProvider>
  )
}
