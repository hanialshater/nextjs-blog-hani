'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from '@/components/Link'
import Image from '@/components/Image'
import { useLocale } from '@/i18n/LocaleContext'
import Card from '@/components/Card'
import { CoreContent } from 'pliny/utils/contentlayer'
import { Blog } from 'contentlayer/generated'

interface Spark {
  id: string
  text: string
  source?: string
}

interface HomeProps {
  sparks: Spark[]
  authorName: string
  authorOccupation: string
  authorAvatar: string
  featuredPosts: CoreContent<Blog>[]
}

export default function Home({
  sparks,
  authorName,
  authorOccupation,
  authorAvatar,
  featuredPosts,
}: HomeProps) {
  const { locale, t, dir } = useLocale()
  const isRTL = dir === 'rtl'
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  // Randomize starting spark on page load
  useEffect(() => {
    if (sparks.length > 1) {
      setCurrentIndex(Math.floor(Math.random() * sparks.length))
    }
    setIsInitialized(true)
  }, [sparks.length])

  const goToNext = useCallback(() => {
    if (isAnimating || sparks.length <= 1) return
    setIsAnimating(true)
    setCurrentIndex((prev) => (prev + 1) % sparks.length)
    setTimeout(() => setIsAnimating(false), 500)
  }, [isAnimating, sparks.length])

  const goToPrev = useCallback(() => {
    if (isAnimating || sparks.length <= 1) return
    setIsAnimating(true)
    setCurrentIndex((prev) => (prev - 1 + sparks.length) % sparks.length)
    setTimeout(() => setIsAnimating(false), 500)
  }, [isAnimating, sparks.length])

  // Auto-advance every 8 seconds
  useEffect(() => {
    if (sparks.length <= 1) return
    const interval = setInterval(goToNext, 8000)
    return () => clearInterval(interval)
  }, [goToNext, sparks.length])

  const currentSpark = sparks[currentIndex]

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center">
      {/* Hero Section */}
      <div className="flex w-full max-w-xl flex-col items-center px-4">
        <Image
          src={authorAvatar}
          alt={authorName}
          width={100}
          height={100}
          className="mb-4 h-[100px] w-[100px] rounded-full object-cover"
        />
        <h1 className="mb-1 text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          {authorName}
        </h1>
        <p className="mb-6 text-base text-gray-500 dark:text-gray-400">{authorOccupation}</p>

        {/* Navigation Links */}
        <nav className="mb-10 flex flex-wrap justify-center gap-5 text-sm">
          <Link
            href={`/${locale}/blog`}
            className="text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          >
            {t('nav.blog')}
          </Link>
          <Link
            href={`/${locale}/free-writing`}
            className="text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          >
            {t('nav.freeWriting')}
          </Link>
          <Link
            href={`/${locale}/projects`}
            className="text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          >
            {t('nav.projects')}
          </Link>
          <Link
            href={`/${locale}/about`}
            className="text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          >
            {t('nav.about')}
          </Link>
        </nav>

        {/* Spark Carousel */}
        {sparks.length > 0 && isInitialized && (
          <div className="w-full">
            <div className="relative">
              {/* Navigation arrows */}
              {sparks.length > 1 && (
                <>
                  <button
                    onClick={isRTL ? goToNext : goToPrev}
                    className={`absolute top-1/2 -translate-y-1/2 p-2 text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-300 ${isRTL ? 'right-0' : 'left-0'}`}
                    aria-label="Previous"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d={isRTL ? 'M9 5l7 7-7 7' : 'M15 19l-7-7 7-7'}
                      />
                    </svg>
                  </button>
                  <button
                    onClick={isRTL ? goToPrev : goToNext}
                    className={`absolute top-1/2 -translate-y-1/2 p-2 text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-300 ${isRTL ? 'left-0' : 'right-0'}`}
                    aria-label="Next"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d={isRTL ? 'M15 19l-7-7 7-7' : 'M9 5l7 7-7 7'}
                      />
                    </svg>
                  </button>
                </>
              )}

              {/* Quote */}
              <div className="px-10" dir={dir}>
                <blockquote
                  className={`transition-opacity duration-500 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}
                >
                  <p
                    className={`text-lg leading-relaxed text-gray-600 dark:text-gray-300 ${isRTL ? 'text-right' : 'text-left'}`}
                  >
                    "{currentSpark.text}"
                  </p>
                  {currentSpark.source && (
                    <footer className={`mt-3 ${isRTL ? 'text-right' : 'text-left'}`}>
                      <Link
                        href={`/${locale}/free-writing/${currentSpark.source}`}
                        className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400 text-sm"
                      >
                        {t('home.readMore')} →
                      </Link>
                    </footer>
                  )}
                </blockquote>
              </div>
            </div>

            {/* Dots indicator */}
            {sparks.length > 1 && (
              <div className="mt-6 flex justify-center gap-2">
                {sparks.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      if (!isAnimating) {
                        setIsAnimating(true)
                        setCurrentIndex(index)
                        setTimeout(() => setIsAnimating(false), 500)
                      }
                    }}
                    className={`h-1.5 rounded-full transition-all ${
                      index === currentIndex
                        ? 'bg-primary-500 w-4'
                        : 'w-1.5 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500'
                    }`}
                    aria-label={`Go to spark ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Featured Posts */}
      {featuredPosts.length > 0 && (
        <div className="container mx-auto px-4 py-12">
          <h2 className="mb-8 text-center text-3xl leading-9 font-extrabold tracking-tight text-gray-900 sm:text-4xl sm:leading-10 md:text-5xl md:leading-14 dark:text-gray-100">
            {t('home.featured')}
          </h2>
          <div className="flex flex-wrap justify-center gap-8">
            {featuredPosts.map((post) => (
              <Card
                key={post.title}
                title={post.title}
                description={post.summary || ''}
                imgSrc={post.images && post.images[0]}
                href={`/${locale}/blog/${post.slug}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
