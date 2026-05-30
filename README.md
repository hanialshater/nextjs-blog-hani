# Hani's Blog

Personal blog of Hani Al-Shater — technical insights on machine learning, product
management, and leadership, plus a "Free Writing" section and a few interactive demos.

Built with [Next.js](https://nextjs.org/) (App Router), [Tailwind CSS](https://tailwindcss.com/),
and [Contentlayer](https://www.contentlayer.dev/) for MDX content. It started from the
[Tailwind Nextjs Starter Blog](https://github.com/timlrx/tailwind-nextjs-starter-blog).

## Features

- **Bilingual (English / Arabic)** with locale-prefixed routes (`/en/...`, `/ar/...`),
  RTL support, and cross-links between a post and its translation.
- **Content sections**: Blog, Free Writing, Projects, and standalone Demos.
- MDX posts with math (KaTeX), code highlighting, citations, and a table of contents.
- Full-text search, tags, RSS feed, and SEO metadata (canonical + `hreflang` alternates).

## Content structure

Each post is a **self-contained bundle** — its text, translations, images, and
interactive demos all live in one folder, so a post can be added independently
while the app stays shared:

```
data/posts/<slug>/
  index.mdx          # English (original)
  index.ar.mdx       # Arabic translation
  images/            # → /static/images/posts/<slug>/
  demos/             # → /demos/posts/<slug>/   (self-contained .html)
  authors/           # (site authors, under data/authors/)
```

`scripts/sync-content.mjs` mirrors each bundle's `images/` and `demos/` into
`public/` before every dev/build, and the section (`blog` / `free-writing`) is set
in frontmatter. A translation declares its origin in frontmatter:

```yaml
section: 'free-writing'
language: ar
translationOf: my-post   # slug of the original post
originalLanguage: en
```

Translation cross-links are resolved in `lib/content/postRoutes.ts` and rendered by
`layouts/PostLayout.tsx`. See `data/posts/README.md` for the full bundle reference.

## Development

```bash
yarn          # install dependencies (Yarn 4 / Berry)
yarn dev      # start the dev server at http://localhost:3000
yarn build    # production build (+ RSS generation)
yarn start    # serve the production build
```

Quality checks:

```bash
yarn typecheck   # contentlayer build + tsc --noEmit
yarn lint        # eslint
yarn test        # playwright end-to-end tests
yarn check       # typecheck + lint + build + test
```

## Configuration

- `data/siteMetadata.js` — site title, author, URLs, analytics, comments.
- `data/headerNavLinks.ts` — navigation links.
- `i18n/config.ts` — locales and UI string translations.
- `next.config.js` — security headers / CSP.

## Deployment

The site deploys to Vercel (`vercel.json`). A `Dockerfile` and `docker-compose.yml`
are also provided for self-hosting.

## License

[MIT](./LICENSE)
