export const locales = ['en', 'ar'] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = 'en'

export const localeNames: Record<Locale, string> = {
  en: 'English',
  ar: 'العربية',
}

export const localeDirection: Record<Locale, 'ltr' | 'rtl'> = {
  en: 'ltr',
  ar: 'rtl',
}

// UI translations
export const translations: Record<Locale, Record<string, string>> = {
  en: {
    'nav.home': 'Home',
    'nav.blog': 'Blog',
    'nav.tags': 'Tags',
    'nav.projects': 'Projects',
    'nav.about': 'About',
    'blog.readMore': 'Read more',
    'blog.minRead': 'min read',
    'blog.publishedOn': 'Published on',
    'blog.tags': 'Tags',
    'blog.previousArticle': 'Previous Article',
    'blog.nextArticle': 'Next Article',
    'blog.backToBlog': 'Back to the blog',
    'blog.relatedPosts': 'Related Posts',
    'blog.allPosts': 'All Posts',
    'blog.noPostsFound': 'No posts found',
    'common.search': 'Search',
    'common.language': 'Language',
    'comments.loadComments': 'Load Comments',
  },
  ar: {
    'nav.home': 'الرئيسية',
    'nav.blog': 'المدونة',
    'nav.tags': 'الوسوم',
    'nav.projects': 'المشاريع',
    'nav.about': 'عني',
    'blog.readMore': 'اقرأ المزيد',
    'blog.minRead': 'دقيقة للقراءة',
    'blog.publishedOn': 'نُشر في',
    'blog.tags': 'الوسوم',
    'blog.previousArticle': 'المقال السابق',
    'blog.nextArticle': 'المقال التالي',
    'blog.backToBlog': 'العودة للمدونة',
    'blog.relatedPosts': 'مقالات ذات صلة',
    'blog.allPosts': 'جميع المقالات',
    'blog.noPostsFound': 'لا توجد مقالات',
    'common.search': 'بحث',
    'common.language': 'اللغة',
    'comments.loadComments': 'تحميل التعليقات',
  },
}

export function getTranslation(locale: Locale, key: string): string {
  return translations[locale][key] || translations.en[key] || key
}
