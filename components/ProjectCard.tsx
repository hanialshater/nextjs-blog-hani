'use client'

import Image from '@/components/Image'
import Link from '@/components/Link'
import { Project, getLocalizedProject } from '@/data/projectsData'
import { useLocale } from '@/i18n/LocaleContext'

interface ProjectCardProps {
  project: Project
  postCount?: number
}

export default function ProjectCard({ project, postCount }: ProjectCardProps) {
  const { locale, t, dir } = useLocale()
  const isRTL = dir === 'rtl'
  const localized = getLocalizedProject(project, locale)

  return (
    <div className="md max-w-[544px] p-4 md:w-1/2">
      <div
        className={`h-full overflow-hidden rounded-md border-2 border-gray-200/60 dark:border-gray-700/60 ${isRTL ? 'text-right' : ''}`}
      >
        {project.imgSrc && (
          <Link
            href={`/${locale}/projects/${project.slug}`}
            aria-label={`Link to ${localized.title}`}
          >
            <Image
              alt={localized.title}
              src={project.imgSrc}
              className="object-cover object-center md:h-36 lg:h-48"
              width={544}
              height={306}
            />
          </Link>
        )}
        <div className="p-6">
          <h2 className="mb-3 text-2xl leading-8 font-bold tracking-tight">
            <Link href={`/${locale}/projects/${project.slug}`}>{localized.title}</Link>
          </h2>
          <p className="prose mb-3 max-w-none text-gray-500 dark:text-gray-400">
            {localized.description}
          </p>
          {postCount !== undefined && postCount > 0 && (
            <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
              {postCount} {t('project.posts')}
            </p>
          )}
          <Link
            href={`/${locale}/projects/${project.slug}`}
            className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400 text-base leading-6 font-medium"
            aria-label={`Link to ${localized.title}`}
          >
            {t('blog.viewProject')} &rarr;
          </Link>
        </div>
      </div>
    </div>
  )
}
