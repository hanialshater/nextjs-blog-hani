import { allBlogs } from 'contentlayer/generated'
import { genPageMetadata } from 'app/seo'
import { locales } from '@/i18n/config'
import projectsData from '@/data/projectsData'
import ProjectCard from '@/components/ProjectCard'
import ProjectsLayout from '@/layouts/ProjectsLayout'

export const metadata = genPageMetadata({ title: 'Projects' })

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

interface PageProps {
  params: Promise<{ locale: string }>
}

export default async function Projects({ params }: PageProps) {
  const { locale } = await params

  // Calculate post counts per project
  const postCounts = projectsData.reduce(
    (acc, project) => {
      const count = allBlogs.filter(
        (post) => post.project === project.slug && (post.language || 'en') === locale
      ).length
      acc[project.slug] = count
      return acc
    },
    {} as Record<string, number>
  )

  // Filter to featured projects or all if none featured, then sort by order
  const displayProjects = projectsData
    .filter((p) => p.featured || !projectsData.some((proj) => proj.featured))
    .sort((a, b) => (a.order || 99) - (b.order || 99))

  return (
    <ProjectsLayout>
      {displayProjects.map((project) => (
        <ProjectCard key={project.slug} project={project} postCount={postCounts[project.slug]} />
      ))}
    </ProjectsLayout>
  )
}
