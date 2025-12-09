import projectsData from '@/data/projectsData'
import Card from '@/components/Card'
import { genPageMetadata } from 'app/seo'
import { locales } from '@/i18n/config'
import ProjectsLayout from '@/layouts/ProjectsLayout'

export const metadata = genPageMetadata({ title: 'Projects' })

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export default function Projects() {
  return (
    <ProjectsLayout>
      {projectsData.map((d) => (
        <Card
          key={d.title}
          title={d.title}
          description={d.description}
          imgSrc={d.imgSrc}
          href={d.href}
        />
      ))}
    </ProjectsLayout>
  )
}
