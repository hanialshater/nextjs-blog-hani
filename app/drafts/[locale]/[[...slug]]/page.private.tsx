import { notFound } from 'next/navigation'
import { getDrafts } from '@/lib/drafts/content'
import { findTranslatedPost, getPostRoutePath } from '@/lib/content/postRoutes'
import { allBlogs } from 'contentlayer/generated'
import DraftContent from '@/components/DraftContent'
import TableOfContents from '@/components/TableOfContents'

export const dynamic = 'force-dynamic'

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; slug?: string[] }>
}) {
  const { locale, slug } = await params
  const drafts = await getDrafts(locale)
  const post = slug ? drafts.find((draft) => draft.slug === slug.join('/')) : undefined
  if (slug && !post) notFound()
  const arabic = locale === 'ar'
  const otherLocale = arabic ? 'en' : 'ar'
  const counterpart = post ? findTranslatedPost(post, allBlogs, otherLocale) : undefined
  const otherPath = counterpart
    ? counterpart.draft
      ? `/drafts/${otherLocale}/${counterpart.slug}`
      : getPostRoutePath(counterpart, otherLocale)
    : `/drafts/${otherLocale}`

  return (
    <main className="mx-auto max-w-5xl px-5 py-8 sm:px-8">
      <nav
        aria-label={arabic ? 'المسودات' : 'Drafts'}
        className="mb-10 flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 pb-5 dark:border-gray-700"
      >
        <a href={`/drafts/${locale}`} className="font-semibold">
          {arabic ? 'مسوداتي' : 'My drafts'}
        </a>
        <div className="flex gap-5 text-sm">
          <a href={otherPath} lang={otherLocale}>
            {arabic ? 'English' : 'العربية'}
          </a>
          <a href={`/${locale}/blog`}>{arabic ? 'المدونة العامة' : 'Public blog'}</a>
        </div>
      </nav>
      <p className="mb-5 inline-block rounded-md bg-amber-100 px-3 py-1 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-200">
        {arabic ? 'معاينة خاصة — غير منشورة' : 'Private preview — unpublished'}
      </p>
      {post ? (
        <article>
          <h1 className="article-title mb-4 text-4xl leading-tight font-bold">{post.title}</h1>
          <p className="mb-8 text-sm text-gray-500 dark:text-gray-400">
            {Math.ceil(post.readingTime.minutes)} {arabic ? 'دقائق قراءة' : 'min read'}
          </p>
          <div className="xl:grid xl:grid-cols-[14rem_1fr] xl:gap-10">
            <aside>
              <TableOfContents toc={post.toc} />
            </aside>
            <div id="article-content" className="reading-prose prose dark:prose-invert max-w-none">
              <DraftContent code={post.body.code} toc={post.toc} />
            </div>
          </div>
        </article>
      ) : (
        <>
          <h1 className="mb-8 text-4xl font-bold">{arabic ? 'مسوداتي' : 'My drafts'}</h1>
          {!drafts.length && (
            <p>{arabic ? 'لا توجد مسودات بهذه اللغة.' : 'No drafts in this language.'}</p>
          )}
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {drafts.map((draft) => (
              <li key={draft.slug} className="py-6">
                <a
                  href={`/drafts/${locale}/${draft.slug}`}
                  className="text-2xl font-semibold hover:underline"
                >
                  {draft.title}
                </a>
                {draft.summary && (
                  <p className="mt-3 text-gray-600 dark:text-gray-300">{draft.summary}</p>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  )
}
