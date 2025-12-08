import { redirect } from 'next/navigation'
import { defaultLocale } from '@/i18n/config'

export default async function Page(props: { params: Promise<{ page: string }> }) {
  const params = await props.params
  redirect(`/${defaultLocale}/blog/page/${params.page}`)
}
