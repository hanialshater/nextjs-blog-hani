import { redirect } from 'next/navigation'
import { defaultLocale } from '@/i18n/config'

export default async function Page(props: { params: Promise<{ slug: string[] }> }) {
  const params = await props.params
  const slug = params.slug.join('/')
  redirect(`/${defaultLocale}/blog/${slug}`)
}
