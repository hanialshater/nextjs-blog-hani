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
  // Themes
  philosophy: {
    color: 'text-purple-500',
    translations: { ar: 'فلسفة' },
  },
  'machine-learning': {
    color: 'text-cyan-500',
    translations: { ar: 'تعلم آلي' },
  },
  agents: {
    color: 'text-sky-500',
    translations: { ar: 'وكلاء ذكيون' },
  },
  'decision-making': {
    color: 'text-blue-500',
    translations: { ar: 'اتخاذ القرار' },
  },
  leadership: {
    color: 'text-amber-500',
    translations: { ar: 'قيادة' },
  },
  psychology: {
    color: 'text-pink-500',
    translations: { ar: 'علم نفس' },
  },

  // Formats
  interactive: {
    color: 'text-emerald-500',
    translations: { ar: 'تفاعلي' },
  },
  stories: {
    color: 'text-rose-500',
    translations: { ar: 'قصص' },
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
