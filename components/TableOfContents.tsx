'use client'

import { useEffect, useState } from 'react'

interface TocItem {
  value: string
  url: string
  depth: number
}

interface TableOfContentsProps {
  toc: TocItem[]
}

const TableOfContents = ({ toc }: TableOfContentsProps) => {
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      { rootMargin: '-80px 0px -80% 0px' }
    )

    const headings = document.querySelectorAll('h2, h3')
    headings.forEach((heading) => observer.observe(heading))

    return () => {
      headings.forEach((heading) => observer.unobserve(heading))
    }
  }, [])

  if (!toc || toc.length === 0) return null

  return (
    <nav className="hidden xl:block">
      <div className="sticky top-24">
        <h2 className="mb-4 text-sm font-semibold tracking-wide text-gray-900 uppercase dark:text-gray-100">
          On this page
        </h2>
        <ul className="space-y-2 text-sm">
          {toc.map((item) => (
            <li key={item.url} className={`${item.depth === 3 ? 'ml-4' : ''}`}>
              <a
                href={item.url}
                className={`block py-1 transition-colors ${
                  activeId === item.url.slice(1)
                    ? 'text-primary-500 font-medium'
                    : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
                }`}
              >
                {item.value}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}

export default TableOfContents
