import { redirect } from 'next/navigation'
import { BOOK_ROOT } from '@/lib/books/types'

export const dynamic = 'force-dynamic'

export default async function Page() {
  redirect(`${BOOK_ROOT}/ar/part-1`)
}
