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
- Article search, tags, RSS feed, and SEO metadata (canonical + `hreflang` alternates).

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

`scripts/sync-content.mjs` mirrors each published bundle's `images/` and `demos/` into
`public/` before every dev/build, and the section (`blog` / `free-writing`) is set
in frontmatter. A translation declares its origin in frontmatter:

```yaml
section: 'free-writing'
language: ar
translationOf: my-post # slug of the original post
originalLanguage: en
```

`/en/blog` and `/ar/blog` are complete archives of published articles from both
sections. Article links keep their section-specific URLs. Old `/blog/<slug>`
links redirect to the corresponding Free Writing article when applicable;
invalid pagination returns a 404 instead of an empty archive. Blog is the only public writing archive; the former Free Writing archive redirects to it.

Translation cross-links are resolved in `lib/content/postRoutes.ts` and rendered by
`layouts/PostLayout.tsx`. See `data/posts/README.md` for the full bundle reference.

## Private draft previews

Keep `draft: true` in an article's frontmatter to preview it without publishing it.
Public article URLs, archives, search, RSS and sitemaps exclude drafts, including in
local development. Publishing means changing `draft` to `false` and deploying.

On Vercel, add **DRAFT_PREVIEW_PASSWORD** as a sensitive server environment variable
and redeploy. Generate a strong value with `openssl rand -hex 32`; never put it in
Git or a `NEXT_PUBLIC_` variable. For local development, put it in `.env.local`.
Missing passwords, passwords shorter than 32 characters, or longer than 256
characters leave draft access disabled.

Open `/drafts` (English) or `/drafts/ar` and use the browser's sign-in prompt:
username **hani**, password **your configured value**. Individual previews live at
`/drafts/en/<slug>` and `/drafts/ar/<slug>`. This is HTTP Basic authentication over
HTTPS for a single owner, not an unlisted public URL. The browser remembers access
for its authentication session; use a private browsing window and close it when
finished. Rotating the environment password and redeploying revokes old access.

Authentication is checked in middleware and again where draft data/assets are
read. Draft responses are not cached or indexed, and their reading layout has no
analytics, comments or sharing controls. Draft-only bundle images and demos are
served through the same protected area; they are never copied to `public/`.
Assets shared with a published translation are public by definition.

**Repository privacy is separate:** this repository is public. Any draft committed
here, including its Git history, is still readable on GitHub. The preview password
protects the website, not the source repository. Keep confidential work in private
storage/repositories; do not commit it here expecting website authentication to
hide it. Existing public copies cannot be made secret retrospectively.

GitHub Pages is a public static export and has no authentication server. Files
named `page.private.tsx`, `layout.private.tsx` and `route.private.ts` are only
registered in server builds; draft previews and draft-only assets are excluded
from that export. Use the Vercel domain for authenticated previews.

## Development

```bash
yarn          # install dependencies (Yarn 3.6.1 / Berry)
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
