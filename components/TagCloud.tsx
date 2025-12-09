'use client'

import { useLocale } from '@/i18n/LocaleContext'
import { getTagConfig, getTagLabel } from '@/data/tagIcons'

interface TagCloudProps {
  tags: { name: string; count: number }[]
  showCounts?: boolean
  maxTags?: number
}

export default function TagCloud({ tags, showCounts = true, maxTags }: TagCloudProps) {
  const { locale, dir } = useLocale()
  const isRTL = dir === 'rtl'

  const displayTags = maxTags ? tags.slice(0, maxTags) : tags

  return (
    <div className={`flex flex-wrap gap-1.5 ${isRTL ? 'justify-end' : 'justify-start'}`}>
      {displayTags.map(({ name, count }) => {
        const config = getTagConfig(name)
        const colorClass = config?.color || 'text-primary-500'

        return (
          <span
            key={name}
            className={`inline-flex items-center gap-1 rounded-md bg-gray-100 px-2 py-0.5 text-sm transition-colors dark:bg-gray-800 ${colorClass}`}
          >
            <span>{getTagLabel(name, locale)}</span>
            {showCounts && (
              <span className="text-xs text-gray-500 dark:text-gray-400">({count})</span>
            )}
          </span>
        )
      })}
    </div>
  )
}
