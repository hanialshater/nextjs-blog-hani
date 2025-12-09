'use client'

import { useLocale } from '@/i18n/LocaleContext'
import { getTagConfig } from '@/data/tagIcons'

interface TagCloudProps {
  tags: { name: string; count: number }[]
  showCounts?: boolean
  maxTags?: number
}

export default function TagCloud({ tags, showCounts = true, maxTags }: TagCloudProps) {
  const { dir } = useLocale()
  const isRTL = dir === 'rtl'

  const displayTags = maxTags ? tags.slice(0, maxTags) : tags

  // Calculate font sizes based on count (min 0.875rem, max 1.25rem)
  const maxCount = Math.max(...tags.map((t) => t.count), 1)
  const minCount = Math.min(...tags.map((t) => t.count), 1)

  const getFontSize = (count: number) => {
    if (maxCount === minCount) return '1rem'
    const ratio = (count - minCount) / (maxCount - minCount)
    return `${0.875 + ratio * 0.375}rem`
  }

  return (
    <div className={`flex flex-wrap gap-2 ${isRTL ? 'justify-end' : 'justify-start'}`}>
      {displayTags.map(({ name, count }) => {
        const config = getTagConfig(name)
        const colorClass = config?.color || 'text-primary-500'

        return (
          <span
            key={name}
            className={`inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 transition-colors dark:bg-gray-800 ${colorClass}`}
            style={{ fontSize: getFontSize(count) }}
          >
            <span>{name}</span>
            {showCounts && (
              <span className="text-xs text-gray-500 dark:text-gray-400">({count})</span>
            )}
          </span>
        )
      })}
    </div>
  )
}
