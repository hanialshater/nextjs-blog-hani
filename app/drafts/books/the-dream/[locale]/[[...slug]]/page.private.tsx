import { notFound, redirect } from 'next/navigation'
import BookReader from '@/components/books/BookReader'
import {
  editionConfigured,
  getBookManifest,
  getBookPart,
  requireBookAccess,
} from '@/lib/books/content'
import { BOOK_ROOT } from '@/lib/books/types'

export const dynamic = 'force-dynamic'

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; slug?: string[] }>
}) {
  await requireBookAccess()
  const { locale, slug } = await params
  if (locale !== 'ar' && locale !== 'en') notFound()
  if (!slug?.length) redirect(`${BOOK_ROOT}/${locale}/part-1`)
  if (slug.length !== 1 || !/^part-[1-4]$/.test(slug[0])) notFound()
  if (!editionConfigured()) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-20">
        <h1>{locale === 'ar' ? 'الطبعة قيد التجهيز' : 'This edition is being prepared'}</h1>
        <p>
          {locale === 'ar'
            ? 'رابط القراءة صحيح. النص لسه مش متاح؛ جرّب مرة ثانية لاحقاً.'
            : 'Your reading link is valid. The text is not available yet; please try again later.'}
        </p>
      </main>
    )
  }
  const [manifest, part] = await Promise.all([
    getBookManifest(),
    getBookPart(locale, Number(slug[0].slice(-1))),
  ])
  if (manifest.revision !== part.revision) throw new Error('Book revisions do not match')
  // Passage text is needed only by the feedback endpoint; keep the client payload smaller.
  const readerPart = { ...part, chapters: part.chapters.map(({ passages: _passages, ...c }) => c) }
  return <BookReader manifest={manifest} edition={readerPart} />
}
