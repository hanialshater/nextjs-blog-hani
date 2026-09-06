'use client'

import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react'
import { Fragment, useState, useEffect } from 'react'
import Link from './Link'
import headerNavLinks from '@/data/headerNavLinks'
import { useLocale } from '@/i18n/LocaleContext'
import { navLinkTranslationKeys } from '@/i18n/config'

const MobileNav = () => {
  const [navShow, setNavShow] = useState(false)
  const { locale, t, dir } = useLocale()
  const isRTL = dir === 'rtl'

  // Dialog manages focus and scroll locking. Close it when desktop navigation appears.
  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 1024px)')
    const closeOnDesktop = () => {
      if (desktop.matches) setNavShow(false)
    }
    desktop.addEventListener('change', closeOnDesktop)
    return () => desktop.removeEventListener('change', closeOnDesktop)
  }, [])

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
    <>
      <button
        type="button"
        aria-label={t('nav.openMenu')}
        aria-expanded={navShow}
        aria-controls="mobile-navigation"
        onClick={() => setNavShow(true)}
        className="flex h-10 w-10 items-center justify-center lg:hidden"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="hover:text-primary-500 dark:hover:text-primary-400 h-8 w-8 text-gray-900 dark:text-gray-100"
        >
          <path
            fillRule="evenodd"
            d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      <Transition appear show={navShow} as={Fragment} unmount={false}>
        <Dialog
          as="div"
          className="fixed inset-0 z-60"
          dir={dir}
          aria-label={t('nav.primary')}
          onClose={() => setNavShow(false)}
          unmount={false}
        >
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            unmount={false}
          >
            <div className="fixed inset-0 z-60 bg-black/25" />
          </TransitionChild>

          <TransitionChild
            as={Fragment}
            enter="transition ease-in-out duration-300 transform"
            enterFrom={isRTL ? '-translate-x-full opacity-0' : 'translate-x-full opacity-0'}
            enterTo="translate-x-0 opacity-100"
            leave="transition ease-in duration-200 transform"
            leaveFrom="translate-x-0 opacity-100"
            leaveTo={isRTL ? '-translate-x-full opacity-0' : 'translate-x-full opacity-0'}
            unmount={false}
          >
            <DialogPanel className="fixed inset-0 z-70 flex h-dvh flex-col bg-white dark:bg-gray-950">
              <nav
                id="mobile-navigation"
                aria-label={t('nav.primary')}
                className="flex min-h-0 flex-1 flex-col items-start gap-2 overflow-y-auto px-8 pt-24 pb-8 text-start sm:px-12"
              >
                {headerNavLinks.map((link) => (
                  <Link
                    key={link.title}
                    href={localizeHref(link.href)}
                    className="hover:text-primary-500 dark:hover:text-primary-400 rounded-sm py-2 pe-4 text-2xl leading-relaxed font-bold tracking-normal text-gray-900 dark:text-gray-100"
                    onClick={() => setNavShow(false)}
                  >
                    {getNavTitle(link.title)}
                  </Link>
                ))}
              </nav>

              <button
                type="button"
                className="hover:text-primary-500 dark:hover:text-primary-400 absolute end-4 top-4 h-14 w-14 p-3 text-gray-900 dark:text-gray-100"
                aria-label={t('nav.closeMenu')}
                onClick={() => setNavShow(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </DialogPanel>
          </TransitionChild>
        </Dialog>
      </Transition>
    </>
  )
}

export default MobileNav
