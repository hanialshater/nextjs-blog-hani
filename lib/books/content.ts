import 'server-only'
import { notFound } from 'next/navigation'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import type { BookLocale, BookManifest, BookPart } from './types'

const bundledFiles: Record<string, () => Promise<{ default: unknown }>> = {
  'manifest.json': () => import('@/data/books/the-dream/manifest.json'),
  'part-1.ar.json': () => import('@/data/books/the-dream/part-1.ar.json'),
  'part-2.ar.json': () => import('@/data/books/the-dream/part-2.ar.json'),
  'part-3.ar.json': () => import('@/data/books/the-dream/part-3.ar.json'),
  'part-4.ar.json': () => import('@/data/books/the-dream/part-4.ar.json'),
  'part-1.en.json': () => import('@/data/books/the-dream/part-1.en.json'),
  'part-2.en.json': () => import('@/data/books/the-dream/part-2.en.json'),
  'part-3.en.json': () => import('@/data/books/the-dream/part-3.en.json'),
  'part-4.en.json': () => import('@/data/books/the-dream/part-4.en.json'),
}

async function readEditionFile(filename: string): Promise<unknown> {
  if (!Object.hasOwn(bundledFiles, filename)) notFound()
  // Local fixtures are available only outside Vercel. Deployed reading uses
  // the edition committed with the blog and needs no external token or password.
  const localDirectory = process.env.DREAM_LOCAL_EDITION_DIR
  if (localDirectory && !process.env.VERCEL) {
    return JSON.parse(await readFile(path.join(localDirectory, filename), 'utf8'))
  }
  return (await bundledFiles[filename]()).default
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
