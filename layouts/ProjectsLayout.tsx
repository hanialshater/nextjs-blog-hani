'use client'

import { ReactNode } from 'react'
import { useLocale } from '@/i18n/LocaleContext'

interface Props {
  children: ReactNode
}

export default function ProjectsLayout({ children }: Props) {
  const { t } = useLocale()

  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      <div className="space-y-2 pt-6 pb-8 md:space-y-5">
        <h1 className="text-3xl leading-9 font-extrabold tracking-tight text-gray-900 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14 dark:text-gray-100">
          {t('page.projects')}
        </h1>
        <p className="text-lg leading-7 text-gray-500 dark:text-gray-400">
          {t('page.projects.description')}
        </p>
      </div>
      <div className="container py-12">
        <div className="-m-4 flex flex-wrap">{children}</div>
      </div>
    </div>
  )
}
