import { redirect } from 'next/navigation'
import { defaultLocale } from '@/i18n/config'

export default async function BlogPage() {
  redirect(`/${defaultLocale}/blog`)
}
