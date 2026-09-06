import { redirect } from 'next/navigation'
import { requireBookAccess } from '@/lib/books/content'
import { BOOK_ROOT } from '@/lib/books/types'

export const dynamic = 'force-dynamic'

export default async function Page() {
  await requireBookAccess()
  redirect(`${BOOK_ROOT}/ar/part-1`)
}
