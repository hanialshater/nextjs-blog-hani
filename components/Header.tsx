'use client'

import siteMetadata from '@/data/siteMetadata'
import headerNavLinks from '@/data/headerNavLinks'
import Logo from '@/data/logo.svg'
import Link from './Link'
import MobileNav from './MobileNav'
import ThemeSwitch from './ThemeSwitch'
import SearchButton from './SearchButton'
import LanguageSwitcher, { type TranslationPaths } from './LanguageSwitcher'
import { useLocale } from '@/i18n/LocaleContext'
import { navLinkTranslationKeys } from '@/i18n/config'

const Header = ({ translations }: { translations?: TranslationPaths }) => {
  const { locale, t } = useLocale()

  let headerClass = 'flex items-center w-full gap-3 bg-white dark:bg-gray-950 justify-between py-10'
  if (siteMetadata.stickyNav) {
    headerClass += ' sticky top-0 z-50'
  }

  // Prefix links with locale
  const localizeHref = (href: string) => {
    if (href.startsWith('/')) {
      return `/${locale}${href}`
    }
    return href
  }

  // Get translated nav title
  const getNavTitle = (title: string) => {
    const translationKey = navLinkTranslationKeys[title]
    return translationKey ? t(translationKey) : title
  }

  return (
    <header className={headerClass}>
      <Link href={localizeHref('/')} aria-label={t('site.title')} className="shrink-0">
        <div className="flex items-center gap-3">
          <div>
            <Logo />
          </div>
          <div className="hidden text-2xl font-semibold whitespace-nowrap sm:block">
            {t('site.title')}
          </div>
        </div>
      </Link>
      <div className="flex items-center gap-3 sm:gap-4 lg:gap-6">
        <nav
          aria-label={t('nav.primary')}
          className="hidden items-center gap-4 text-base leading-7 lg:flex rtl:text-lg"
        >
          {headerNavLinks
            .filter((link) => link.href !== '/')
            .map((link) => (
              <Link
                key={link.title}
                href={localizeHref(link.href)}
                className="hover:text-primary-500 dark:hover:text-primary-400 py-2 font-medium whitespace-nowrap text-gray-900 dark:text-gray-100"
              >
                {getNavTitle(link.title)}
              </Link>
            ))}
        </nav>
        <SearchButton />
        <LanguageSwitcher translations={translations} />
        <Link
          href="/feed.xml"
          className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          aria-label={t('nav.rss')}
        >
          <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6.18 15.64a2.18 2.18 0 0 1 2.18 2.18C8.36 19 7.38 20 6.18 20C5 20 4 19 4 17.82a2.18 2.18 0 0 1 2.18-2.18M4 4.44A15.56 15.56 0 0 1 19.56 20h-2.83A12.73 12.73 0 0 0 4 7.27V4.44m0 5.66a9.9 9.9 0 0 1 9.9 9.9h-2.83A7.07 7.07 0 0 0 4 12.93V10.1z" />
          </svg>
        </Link>
        <ThemeSwitch />
        <MobileNav />
      </div>
    </header>
  )
}

export default Header
