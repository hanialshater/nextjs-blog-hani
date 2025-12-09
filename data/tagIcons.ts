// Map tag names to icon/color configurations
// Icons can be heroicon names or custom identifiers

export interface TagIconConfig {
  icon?: string // heroicon name (e.g., 'academic-cap', 'code-bracket')
  color?: string // Tailwind color class (e.g., 'text-purple-500')
}

const tagIcons: Record<string, TagIconConfig> = {
  // Philosophy & thinking
  philosophy: { color: 'text-purple-500' },
  'game-theory': { color: 'text-blue-500' },
  economics: { color: 'text-green-500' },
  politics: { color: 'text-red-500' },

  // Tech
  ai: { color: 'text-cyan-500' },
  'machine-learning': { color: 'text-cyan-500' },
  technology: { color: 'text-gray-500' },

  // Add more tag icons here as needed
}

export default tagIcons

export function getTagConfig(tag: string): TagIconConfig | undefined {
  return tagIcons[tag.toLowerCase()]
}
