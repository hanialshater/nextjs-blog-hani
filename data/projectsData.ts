export interface Project {
  slug: string
  title: Record<string, string>
  description: Record<string, string>
  icon?: string
  imgSrc?: string
  featured?: boolean
  order?: number
}

const projectsData: Project[] = [
  {
    slug: 'philosophy',
    title: {
      en: 'The Ferrari with Bicycle Brakes',
      ar: 'الفيراري بفرامل دراجة',
    },
    description: {
      en: 'How advanced technology meets outdated human systems. Can AI complexity transcend modern and postmodern philosophy?',
      ar: 'كيف تلتقي التكنولوجيا المتقدمة بالأنظمة البشرية العتيقة. هل يمكن لتعقيد الذكاء الاصطناعي أن يتجاوز الفلسفة الحديثة وما بعد الحداثة؟',
    },
    icon: '🏎️',
    imgSrc: '/static/images/projects/philosophy.png',
    featured: true,
    order: 1,
  },
]

export default projectsData

// Helper function to get localized project data
export function getLocalizedProject(project: Project, locale: string) {
  return {
    ...project,
    title: project.title[locale] || project.title['en'],
    description: project.description[locale] || project.description['en'],
  }
}

// Helper to find project by slug
export function getProjectBySlug(slug: string): Project | undefined {
  return projectsData.find((p) => p.slug === slug)
}
