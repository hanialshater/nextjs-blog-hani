// Map tag names to icon/color configurations and translations
// Icons can be heroicon names or custom identifiers

export interface TagIconConfig {
  icon?: string // heroicon name (e.g., 'academic-cap', 'code-bracket')
  color?: string // Tailwind color class (e.g., 'text-purple-500')
}

export interface TagConfig extends TagIconConfig {
  translations?: Record<string, string>
}

const tagConfigs: Record<string, TagConfig> = {
  // Philosophy & thinking
  philosophy: {
    color: 'text-purple-500',
    translations: { ar: 'فلسفة' },
  },
  'game-theory': {
    color: 'text-blue-500',
    translations: { ar: 'نظرية الألعاب' },
  },
  economics: {
    color: 'text-green-500',
    translations: { ar: 'اقتصاد' },
  },
  politics: {
    color: 'text-red-500',
    translations: { ar: 'سياسة' },
  },
  baudrillard: {
    color: 'text-purple-400',
    translations: { ar: 'بودريار' },
  },

  // Tech & AI
  ai: {
    color: 'text-cyan-500',
    translations: { ar: 'ذكاء اصطناعي' },
  },
  agi: {
    color: 'text-cyan-600',
    translations: { ar: 'ذكاء اصطناعي عام' },
  },
  llm: {
    color: 'text-cyan-400',
    translations: { ar: 'نماذج لغوية' },
  },
  'machine-learning': {
    color: 'text-cyan-500',
    translations: { ar: 'تعلم آلي' },
  },
  technology: {
    color: 'text-gray-500',
    translations: { ar: 'تكنولوجيا' },
  },
  'tech-industry': {
    color: 'text-gray-600',
    translations: { ar: 'صناعة التقنية' },
  },
  'vision-models': {
    color: 'text-indigo-500',
    translations: { ar: 'نماذج الرؤية' },
  },
  optimization: {
    color: 'text-orange-500',
    translations: { ar: 'تحسين' },
  },
  'cost-reduction': {
    color: 'text-green-600',
    translations: { ar: 'خفض التكاليف' },
  },
  'data-science': {
    color: 'text-blue-600',
    translations: { ar: 'علم البيانات' },
  },
  'bayesian-modeling': {
    color: 'text-indigo-600',
    translations: { ar: 'نمذجة بايزية' },
  },

  // Leadership & Psychology
  leadership: {
    color: 'text-amber-500',
    translations: { ar: 'قيادة' },
  },
  psychology: {
    color: 'text-pink-500',
    translations: { ar: 'علم نفس' },
  },
  'team-management': {
    color: 'text-amber-600',
    translations: { ar: 'إدارة الفريق' },
  },
  resilience: {
    color: 'text-emerald-500',
    translations: { ar: 'مرونة' },
  },
  'option-b': {
    color: 'text-emerald-600',
    translations: { ar: 'الخيار ب' },
  },

  // General
  opinion: {
    color: 'text-slate-500',
    translations: { ar: 'رأي' },
  },
}

export default tagConfigs

export function getTagConfig(tag: string): TagConfig | undefined {
  return tagConfigs[tag.toLowerCase()]
}

export function getTagLabel(tag: string, locale: string): string {
  const config = tagConfigs[tag.toLowerCase()]
  if (config?.translations?.[locale]) {
    return config.translations[locale]
  }
  return tag
}
