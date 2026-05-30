export interface MiniDemo {
  slug: string
  title: Record<string, string>
  description: Record<string, string>
  icon: string
  tags: string[]
  relatedPost?: {
    section: 'blog' | 'free-writing'
    slug: string
  }
  order: number
}

const miniDemosData: MiniDemo[] = [
  {
    slug: 'algorithm-playground',
    title: {
      en: 'Algorithm Playground',
      ar: 'ملعب الخوارزميات',
    },
    description: {
      en: 'A hands-on merge sort and Count-Min Sketch visualizer that can be opened without reading a post first.',
      ar: 'تجربة تفاعلية لفرز الدمج و Count-Min Sketch يمكن فتحها مباشرة بدون قراءة مقال أولاً.',
    },
    icon: '🧮',
    tags: ['algorithms', 'visualization', 'interactive'],
    relatedPost: {
      section: 'free-writing',
      slug: 'agent-autonomy',
    },
    order: 1,
  },
  {
    slug: 'evolved-ui-demos',
    title: {
      en: 'Evolved UI Demos',
      ar: 'واجهات متطوّرة',
    },
    description: {
      en: 'Standalone versions of the generated demos from the evolutionary UI experiment.',
      ar: 'نسخ مستقلة من العروض الناتجة عن تجربة تطوير الواجهات.',
    },
    icon: '🧬',
    tags: ['ai', 'ui', 'experiments'],
    relatedPost: {
      section: 'free-writing',
      slug: 'agent-autonomy',
    },
    order: 2,
  },
  {
    slug: 'map-elites-circle-packing',
    title: {
      en: 'MAP-Elites Circle Packing',
      ar: 'تعبئة الدوائر مع MAP-Elites',
    },
    description: {
      en: 'Explore a quality-diversity search over circle-packing layouts as a focused mini project.',
      ar: 'استكشف بحث الجودة والتنوع لتخطيطات تعبئة الدوائر كمشروع صغير مستقل.',
    },
    icon: '⚪',
    tags: ['optimization', 'quality-diversity', 'interactive'],
    order: 3,
  },
]

export default miniDemosData

export function getLocalizedMiniDemo(demo: MiniDemo, locale: string) {
  return {
    ...demo,
    title: demo.title[locale] || demo.title.en,
    description: demo.description[locale] || demo.description.en,
  }
}

export function getMiniDemoBySlug(slug: string) {
  return miniDemosData.find((demo) => demo.slug === slug)
}
