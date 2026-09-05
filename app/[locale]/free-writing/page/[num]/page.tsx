import { locales } from '@/i18n/config'
import { notFound, permanentRedirect } from 'next/navigation'
import { getPaginatedPosts, getPaginatedStaticParams } from '@/lib/content/posts'

export function generateStaticParams() {
  return getPaginatedStaticParams('all', locales)
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; num: string }>
}) {
  const { locale, num } = await params
  if (!/^[1-9]\d*$/.test(num)) notFound()
  const page = Number(num)
  if (!Number.isSafeInteger(page)) notFound()
  if (page > getPaginatedPosts('all', locale).pagination.totalPages) notFound()
  permanentRedirect(page === 1 ? `/${locale}/blog` : `/${locale}/blog/page/${page}`)
}
