import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { allBlogs } from '../.contentlayer/generated/index.mjs'

export default function checkDraftOutput() {
  const drafts = allBlogs.filter((post) => post.draft)
  const roots = process.env.EXPORT ? ['out'] : ['public', '.next/static']
  const titles = drafts.flatMap((post) => [post.title, JSON.stringify(post.title).slice(1, -1)])
  function inspect(directory) {
    if (!existsSync(directory)) return
    for (const name of readdirSync(directory)) {
      const file = path.join(directory, name)
      if (statSync(file).isDirectory()) inspect(file)
      else if (/\.(html|txt|json|js)$/.test(file)) {
        const content = readFileSync(file, 'utf8')
        if (titles.some((title) => content.includes(title))) {
          throw new Error(`Draft content found in public output: ${file}`)
        }
      }
    }
  }
  for (const root of roots) inspect(root)
  if (process.env.EXPORT && existsSync('out/drafts')) {
    throw new Error('Private preview routes must not be included in the static export')
  }
  for (const draft of drafts) {
    if (allBlogs.some((post) => post.slug === draft.slug && !post.draft)) continue
    for (const root of roots) {
      for (const directory of ['static/images/posts', 'demos/posts']) {
        if (existsSync(path.join(root, directory, draft.slug))) {
          throw new Error(`Draft-only assets found in public output: ${draft.slug}`)
        }
      }
    }
  }
  console.log('Draft isolation checked: no draft content or draft-only assets in public output.')
}
