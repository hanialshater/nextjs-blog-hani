import { Authors, allAuthors } from 'contentlayer/generated'
import { MDXLayoutRenderer } from 'pliny/mdx-components'
import AuthorLayout from '@/layouts/AuthorLayout'
import { coreContent } from 'pliny/utils/contentlayer'
import { genPageMetadata } from 'app/seo'
import { locales } from '@/i18n/config'

export const metadata = genPageMetadata({ title: 'About' })

interface PageProps {
  params: Promise<{ locale: string }>
}

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export default async function Page({ params }: PageProps) {
  const { locale } = await params

  // Find author by slug and language, fallback to default (English)
  const author = (allAuthors.find((p) => p.slug === 'default' && (p.language || 'en') === locale) ||
    allAuthors.find((p) => p.slug === 'default' && (p.language || 'en') === 'en')) as Authors

  const mainContent = coreContent(author)

  return (
    <>
      <AuthorLayout content={mainContent}>
        <MDXLayoutRenderer code={author.body.code} />
      </AuthorLayout>
    </>
  )
}
