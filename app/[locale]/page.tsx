import fs from 'fs'
import path from 'path'
import Main from '../Main'
import { locales } from '@/i18n/config'
import { allAuthors } from 'contentlayer/generated'

interface Spark {
  id: string
  text: Record<string, string>
  source?: string
}

function loadSparks(): Spark[] {
  const sparksDir = path.join(process.cwd(), 'content-sparks')
  const files = fs.readdirSync(sparksDir).filter((f) => f.endsWith('.json'))

  return files.map((file) => {
    const content = fs.readFileSync(path.join(sparksDir, file), 'utf-8')
    return JSON.parse(content) as Spark
  })
}

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params

  // Load all sparks and localize them
  const sparks = loadSparks()
  const localizedSparks = sparks.map((spark) => ({
    id: spark.id,
    text: spark.text[locale] || spark.text['en'],
    source: spark.source,
  }))

  // Get author info
  const author =
    allAuthors.find((a) => a.slug === 'default' && (a.language || 'en') === locale) ||
    allAuthors.find((a) => a.slug === 'default')

  return (
    <Main
      sparks={localizedSparks}
      authorName={author?.name || 'Hani Al-Shater'}
      authorOccupation={author?.occupation || 'Technical Leader'}
      authorAvatar={author?.avatar || '/static/images/avatar.png'}
    />
  )
}
