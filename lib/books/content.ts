import 'server-only'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { hasBookAccess } from './access'
import type { BookLocale, BookManifest, BookPart } from './types'

export async function requireBookAccess() {
  if (!(await hasBookAccess((await headers()).get('authorization')))) notFound()
}

export function editionConfigured() {
  return !!(
    (process.env.DREAM_LOCAL_EDITION_DIR && !process.env.VERCEL) ||
    (process.env.DREAM_GITHUB_TOKEN && /^[a-f0-9]{40}$/.test(process.env.DREAM_EDITION_REF || ''))
  )
}

async function readEditionFile(filename: string): Promise<unknown> {
  // Repeat authentication at the data boundary, including direct RSC requests.
  await requireBookAccess()
  if (!/^(manifest|part-[1-4]\.(ar|en))\.json$/.test(filename)) notFound()
  const localDirectory = process.env.DREAM_LOCAL_EDITION_DIR
  if (localDirectory && !process.env.VERCEL) {
    return JSON.parse(await readFile(path.join(localDirectory, filename), 'utf8'))
  }
  const ref = process.env.DREAM_EDITION_REF || ''
  if (!/^[a-f0-9]{40}$/.test(ref) || !process.env.DREAM_GITHUB_TOKEN) {
    throw new Error('Book edition is not configured')
  }
  const response = await fetch(
    `https://api.github.com/repos/hanialshater/the-dream/contents/web/edition/${filename}?ref=${ref}`,
    {
      headers: {
        Accept: 'application/vnd.github.raw+json',
        Authorization: `Bearer ${process.env.DREAM_GITHUB_TOKEN}`,
        'X-GitHub-Api-Version': '2022-11-28',
      },
      cache: 'no-store',
      signal: AbortSignal.timeout(15000),
    }
  )
  if (!response.ok) throw new Error(`Private book source unavailable (${response.status})`)
  return response.json()
}

export async function getBookManifest(): Promise<BookManifest> {
  const manifest = (await readEditionFile('manifest.json')) as BookManifest
  if (manifest.schema !== 1 || !/^[a-f0-9]{16}$/.test(manifest.revision)) {
    throw new Error('Unsupported book manifest')
  }
  return manifest
}

export async function getBookPart(locale: BookLocale, part: number): Promise<BookPart> {
  if (!['ar', 'en'].includes(locale) || !Number.isInteger(part) || part < 1 || part > 4) notFound()
  const edition = (await readEditionFile(`part-${part}.${locale}.json`)) as BookPart
  if (
    edition.schema !== 1 ||
    edition.locale !== locale ||
    edition.part !== part ||
    !Array.isArray(edition.chapters) ||
    !/^[a-f0-9]{16}$/.test(edition.revision)
  ) {
    throw new Error('Unsupported book edition')
  }
  return edition
}
