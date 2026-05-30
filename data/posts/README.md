# Co-located post bundles

Each post in `data/posts/` is a **self-contained bundle**: its text, translations,
images, and interactive demos all live in one folder, so a post can be added (or
removed) independently while the blog app stays shared across all of them.

```
data/posts/<slug>/
  index.mdx          # English original
  index.ar.mdx       # Arabic translation (optional)
  images/            # post images
  demos/             # standalone HTML demos (optional)
```

`<slug>` is the URL slug and the folder name — that's the only place it's defined.

## How assets are wired

Next.js only serves files from `public/`, so `scripts/sync-content.mjs` mirrors each
bundle's assets there before every `dev`, `build`, and `typecheck`:

| In the bundle                       | Served at                              |
| ----------------------------------- | -------------------------------------- |
| `data/posts/<slug>/images/foo.png`  | `/static/images/posts/<slug>/foo.png`  |
| `data/posts/<slug>/demos/bar.html`  | `/demos/posts/<slug>/bar.html`         |

Those two `public/` directories are generated and git-ignored — never edit them by
hand. Run the sync manually with `yarn content:sync` if needed.

## Frontmatter

Same fields as legacy posts, plus `section` (since the folder no longer encodes it):

```yaml
---
title: 'My Post'
date: '2026-01-01'
section: 'free-writing' # or 'blog'
summary: '...'
authors: ['default']
tags: ['...']
images: ['/static/images/posts/my-post/cover.png']
# translations only:
language: ar
translationOf: my-post # slug of the English original
originalLanguage: en
---
```

## Images and demos in the body

Reference images by their synced public path:

```md
![Alt text](/static/images/posts/my-post/cover.png)
```

Embed a self-contained HTML demo with the `<Demo />` component:

```mdx
<Demo src="/demos/posts/my-post/widget.html" title="My widget" height={320} />
```

## Adding a post

1. Create `data/posts/<slug>/` with `index.mdx` (and `index.ar.mdx` for Arabic).
2. Drop any images in `images/` and any demos in `demos/`.
3. Set `section` in the frontmatter.
4. `yarn dev` — the sync runs automatically and the post appears under its section.

See `hello-bundle/` for a complete working reference (English + Arabic, a
co-located image, and a portable `<Demo />`). It ships as `draft: true` so it
stays out of the live site — flip `draft` to `false` in both `index.mdx` files to
view it locally at `/en/free-writing/hello-bundle`.

## Legacy posts

Existing posts under `data/free-writing-blog/` (and `data/blog/`) still work
unchanged — their section comes from the folder name. New posts should use this
bundle layout; old ones can be migrated by moving them into `data/posts/<slug>/`,
relocating their assets, and adding `section` to the frontmatter.
