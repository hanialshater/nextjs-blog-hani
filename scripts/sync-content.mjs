// Mirrors co-located post-bundle assets into /public so Next.js can serve them.
//
//   data/posts/<slug>/images/* -> public/static/images/posts/<slug>/*
//   data/posts/<slug>/demos/*  -> public/demos/posts/<slug>/*
//
// The two target directories are owned entirely by this script (they are
// git-ignored and rebuilt from scratch each run), so a removed bundle never
// leaves stale files behind. Run automatically before dev/build/typecheck.
import { existsSync, rmSync, mkdirSync, cpSync, readdirSync, statSync } from 'fs'
import path from 'path'

const root = process.cwd()
const POSTS_DIR = path.join(root, 'data', 'posts')
const IMAGE_TARGET = path.join(root, 'public', 'static', 'images', 'posts')
const DEMO_TARGET = path.join(root, 'public', 'demos', 'posts')

function resetDir(dir) {
  rmSync(dir, { recursive: true, force: true })
  mkdirSync(dir, { recursive: true })
}

function syncBundleAssets() {
  if (!existsSync(POSTS_DIR)) {
    console.log('[sync-content] no data/posts directory found — nothing to sync')
    return
  }

  resetDir(IMAGE_TARGET)
  resetDir(DEMO_TARGET)

  const slugs = readdirSync(POSTS_DIR).filter((name) =>
    statSync(path.join(POSTS_DIR, name)).isDirectory()
  )

  let imageBundles = 0
  let demoBundles = 0
  for (const slug of slugs) {
    const imagesSrc = path.join(POSTS_DIR, slug, 'images')
    if (existsSync(imagesSrc)) {
      cpSync(imagesSrc, path.join(IMAGE_TARGET, slug), { recursive: true })
      imageBundles += 1
    }
    const demosSrc = path.join(POSTS_DIR, slug, 'demos')
    if (existsSync(demosSrc)) {
      cpSync(demosSrc, path.join(DEMO_TARGET, slug), { recursive: true })
      demoBundles += 1
    }
  }

  console.log(
    `[sync-content] synced ${slugs.length} bundle(s): ` +
      `${imageBundles} with images, ${demoBundles} with demos`
  )
}

syncBundleAssets()
