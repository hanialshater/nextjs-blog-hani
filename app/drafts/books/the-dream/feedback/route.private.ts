import { createHash } from 'node:crypto'
import { hasBookAccess, bookAccessDenied } from '@/lib/books/access'
import { getBookPart } from '@/lib/books/content'
import { feedbackCategories } from '@/lib/books/types'
import { privateDraftHeaders } from '@/lib/drafts/access'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function result(status: number, code: string) {
  return Response.json({ code }, { status, headers: privateDraftHeaders })
}

export async function POST(request: Request) {
  if (!(await hasBookAccess(request.headers.get('authorization')))) return bookAccessDenied()
  // Next may construct request.url with an internal hostname. Compare the
  // browser origin to the public Host header, using the proxy's scheme.
  const requestURL = new URL(request.url)
  const scheme = request.headers.get('x-forwarded-proto') || requestURL.protocol.slice(0, -1)
  const host = request.headers.get('host') || requestURL.host
  if (
    !['http', 'https'].includes(scheme) ||
    request.headers.get('origin') !== `${scheme}://${host}`
  ) {
    return result(403, 'origin')
  }
  if (!request.headers.get('content-type')?.startsWith('application/json')) {
    return result(415, 'content-type')
  }
  // Limit the actual streamed body, not merely the untrusted Content-Length header.
  const reader = request.body?.getReader()
  if (!reader) return result(400, 'empty')
  const chunks: Uint8Array[] = []
  let size = 0
  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    size += value.byteLength
    if (size > 16000) {
      await reader.cancel()
      return result(413, 'too-large')
    }
    chunks.push(value)
  }
  let body
  try {
    body = JSON.parse(Buffer.concat(chunks).toString('utf8'))
  } catch {
    return result(400, 'invalid')
  }
  if (
    !body ||
    !['ar', 'en'].includes(body.locale) ||
    !Number.isInteger(body.part) ||
    body.part < 1 ||
    body.part > 4 ||
    typeof body.chapter !== 'string' ||
    !/^[a-z0-9-]{1,80}$/.test(body.chapter) ||
    typeof body.passage !== 'string' ||
    !/^[a-z0-9-]{0,100}$/.test(body.passage) ||
    typeof body.revision !== 'string' ||
    !/^[a-f0-9]{16}$/.test(body.revision) ||
    !feedbackCategories.includes(body.category) ||
    typeof body.comment !== 'string' ||
    body.comment.trim().length < 3 ||
    body.comment.length > 4000 ||
    typeof body.quote !== 'string' ||
    body.quote.length > 1200 ||
    typeof body.submission !== 'string' ||
    !/^[a-f0-9-]{36}$/.test(body.submission)
  )
    return result(400, 'invalid')

  try {
    const edition = await getBookPart(body.locale, body.part)
    if (edition.revision !== body.revision) return result(409, 'revision')
    const chapter = edition.chapters.find((c) => c.id === body.chapter)
    if (!chapter || (body.passage && !(body.passage in chapter.passages))) {
      return result(400, 'passage')
    }
    const token = process.env.DREAM_FEEDBACK_TOKEN || process.env.DREAM_GITHUB_TOKEN
    if (!token) return result(503, 'unavailable')
    const requestHeaders = {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
    }
    // GitHub Issues is the durable store. This marker makes retries idempotent
    // in normal use without relying on a serverless instance's memory.
    const marker = createHash('sha256').update(body.submission).digest('hex').slice(0, 24)
    const endpoint = 'https://api.github.com/repos/hanialshater/the-dream/issues'
    const recent = await fetch(`${endpoint}?state=all&sort=created&direction=desc&per_page=100`, {
      headers: requestHeaders,
      cache: 'no-store',
      signal: AbortSignal.timeout(15000),
    })
    if (!recent.ok) return result(503, 'unavailable')
    const issues = await recent.json()
    if (!Array.isArray(issues)) return result(503, 'unavailable')
    if (
      issues.some((issue: { body?: string }) => issue.body?.includes(`dream-feedback:${marker}`))
    ) {
      return result(200, 'saved')
    }
    // Bound accidental bursts across instances using the durable issue log.
    const lastMinute = issues.filter(
      (issue: { created_at: string; body?: string }) =>
        issue.body?.includes('dream-feedback:') && Date.now() - Date.parse(issue.created_at) < 60000
    )
    if (lastMinute.length >= 10) return result(429, 'busy')
    // Keep reader-supplied Markdown inert and prevent accidental @mentions.
    const safe = (s: string) => s.replace(/@/g, '@\u200b').replace(/`/g, 'ˋ')
    const issueBody = [
      `<!-- dream-feedback:${marker} -->`,
      `Revision: ${body.revision}`,
      `Language: ${body.locale}`,
      `Part: ${body.part}`,
      `Chapter: ${chapter.id} — ${chapter.title}`,
      `Passage: ${body.passage || '(chapter)'}`,
      `Category: ${body.category}`,
      '',
      'Selected passage:',
      '```text',
      safe(body.quote || '(No selection)'),
      '```',
      '',
      'Reader note:',
      '```text',
      safe(body.comment.trim()),
      '```',
    ].join('\n')
    const saved = await fetch(endpoint, {
      method: 'POST',
      headers: requestHeaders,
      cache: 'no-store',
      body: JSON.stringify({
        title: `[Book feedback] ${body.locale} / ${chapter.id} / ${body.category}`,
        body: issueBody,
      }),
      signal: AbortSignal.timeout(15000),
    })
    return saved.ok ? result(201, 'saved') : result(503, 'unavailable')
  } catch {
    return result(503, 'unavailable')
  }
}
