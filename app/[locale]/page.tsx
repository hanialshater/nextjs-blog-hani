import fs from 'fs'
import path from 'path'
import Main from '../Main'
import { Locale, locales } from '@/i18n/config'
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

function getRandomSpark(sparks: Spark[]): Spark {
  return sparks[Math.floor(Math.random() * sparks.length)]
}

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params

  // Load sparks and get a random one
  const sparks = loadSparks()
  const randomSpark = getRandomSpark(sparks)
  const localizedSpark = {
    id: randomSpark.id,
    text: randomSpark.text[locale] || randomSpark.text['en'],
    source: randomSpark.source,
  }

  // Get author info
  const author =
    allAuthors.find((a) => a.slug === 'default' && (a.language || 'en') === locale) ||
    allAuthors.find((a) => a.slug === 'default')

  return (
    <Main
      spark={localizedSpark}
      authorName={author?.name || 'Hani Al-Shater'}
      authorOccupation={author?.occupation || 'Technical Leader'}
      authorAvatar={author?.avatar || '/static/images/avatar.png'}
    />
  )
}
