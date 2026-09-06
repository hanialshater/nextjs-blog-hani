export const BOOK_ROOT = '/drafts/books/the-dream'
export type BookLocale = 'ar' | 'en'

export interface BookChapter {
  id: string
  number: number | null
  title: string
  code: string
  words: number
  passages: Record<string, string>
}

export interface BookPart {
  schema: 1
  revision: string
  locale: BookLocale
  part: number
  title: string
  chapters: BookChapter[]
}

export interface BookManifest {
  schema: 1
  revision: string
  title: Record<BookLocale, string>
  parts: Array<{ number: number; title: Record<BookLocale, string> }>
}

export const feedbackCategories = ['lost', 'example', 'correction', 'compelling', 'other'] as const
export type FeedbackCategory = (typeof feedbackCategories)[number]
