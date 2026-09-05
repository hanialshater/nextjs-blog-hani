'use client'

import { useEffect, useState } from 'react'
import { useLocale } from '@/i18n/LocaleContext'

interface TocItem {
  value: string
  url: string
  depth: number
}

export default function TableOfContents({ toc = [] }: { toc?: TocItem[] }) {
  const { t } = useLocale()
  const [activeId, setActiveId] = useState('')

  useEffect(() => {
    const headings = Array.from(
      document.querySelectorAll('#article-content h2, #article-content h3')
    )
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setActiveId(entry.target.id)
      },
      { rootMargin: '-5% 0px -75% 0px' }
    )
    headings.forEach((heading) => observer.observe(heading))
    return () => observer.disconnect()
  }, [toc])

  const items = toc.filter((item) => item.depth === 2 || item.depth === 3)
  if (items.length < 2) return null
  const links = (
    <ul className="space-y-1 text-sm">
      {items.map((item) => (
        <li key={item.url} className={item.depth === 3 ? 'ms-3' : ''}>
          <a
            href={item.url}
            aria-current={activeId === item.url.slice(1) ? 'location' : undefined}
            className={`block py-2 ${activeId === item.url.slice(1) ? 'text-primary-600 dark:text-primary-400 font-medium' : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'}`}
          >
            {item.value}
          </a>
        </li>
      ))}
    </ul>
  )

  return (
    <div className="mt-8 text-start">
      <details className="rounded-lg border border-gray-200 px-4 py-3 xl:hidden dark:border-gray-700">
        <summary className="cursor-pointer font-medium">{t('blog.contents')}</summary>
        <nav aria-label={t('blog.contents')} className="mt-3">
          {links}
        </nav>
      </details>
      <nav aria-label={t('blog.contents')} className="hidden xl:block">
        <h2 className="mb-3 text-sm font-semibold">{t('blog.contents')}</h2>
        {links}
      </nav>
    </div>
  )
}
