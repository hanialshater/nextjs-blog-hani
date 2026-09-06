import { notFound, redirect } from 'next/navigation'
import BookReader from '@/components/books/BookReader'
import { getBookManifest, getBookPart } from '@/lib/books/content'
import { BOOK_ROOT } from '@/lib/books/types'

export const dynamic = 'force-dynamic'

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; slug?: string[] }>
}) {
  const { locale, slug } = await params
  if (locale !== 'ar' && locale !== 'en') notFound()
  if (!slug?.length) redirect(`${BOOK_ROOT}/${locale}/part-1`)
  if (slug.length !== 1 || !/^part-[1-4]$/.test(slug[0])) notFound()
  const [manifest, part] = await Promise.all([
    getBookManifest(),
    getBookPart(locale, Number(slug[0].slice(-1))),
  ])
  if (manifest.revision !== part.revision) throw new Error('Book revisions do not match')
  // Passage text is needed only by the feedback endpoint; keep the client payload smaller.
  const readerPart = { ...part, chapters: part.chapters.map(({ passages: _passages, ...c }) => c) }
  return (
    <BookReader
      manifest={manifest}
      edition={readerPart}
      feedbackEnabled={!!process.env.DREAM_FEEDBACK_TOKEN}
    />
  )
}
