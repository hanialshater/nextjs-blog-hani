import { redirect } from 'next/navigation'
import { requireDraftAccess } from '@/lib/drafts/content'

export const dynamic = 'force-dynamic'

export default async function Page() {
  await requireDraftAccess()
  redirect('/drafts/en')
}
