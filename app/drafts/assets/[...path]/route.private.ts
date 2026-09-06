import { readFile, realpath } from 'node:fs/promises'
import path from 'node:path'
import { allBlogs } from 'contentlayer/generated'
import { draftHeaders } from '@/lib/drafts/headers'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const mimeTypes: Record<string, string> = {
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.avif': 'image/avif',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.pdf': 'application/pdf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
}

export async function GET(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const segments = (await params).path
  const [slug, folder, ...asset] = segments
  const missing = () => new Response('Not found', { status: 404, headers: draftHeaders })
  if (
    !asset.length ||
    !['images', 'demos'].includes(folder) ||
    segments.some((segment) => !segment || segment.startsWith('.') || /[\\/\0]/.test(segment)) ||
    !allBlogs.some((post) => post.slug === slug)
  )
    return missing()
  const contentType = mimeTypes[path.extname(asset.at(-1)!).toLowerCase()]
  if (!contentType) return missing()
  try {
    const root = await realpath(path.join(process.cwd(), 'data', 'posts', slug, folder))
    const filename = await realpath(path.join(root, ...asset))
    if (!filename.startsWith(root + path.sep)) return missing()
    return new Response(new Uint8Array(await readFile(filename)), {
      headers: {
        ...draftHeaders,
        'Content-Type': contentType,
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'SAMEORIGIN',
      },
    })
  } catch {
    return missing()
  }
}
