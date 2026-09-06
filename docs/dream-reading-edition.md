# The Dream: unlisted bilingual working edition

Read `/drafts/books/the-dream/ar/part-1` or
`/drafts/books/the-dream/en/part-1`. Four parts in each language contain all 55
chapters, thirteen paired technical explanations, eight new experiments, and the
four existing Part I demos. The book is linked from `/drafts/ar` and `/drafts/en`.

## Access and deployment

The author requested removal of password protection on 6 September 2026. Draft
pages and assets now open without credentials. They remain excluded from public
blog listings, feeds, search, and sitemaps, and return noindex/noarchive and
no-store headers. These are unlisted reading pages, not confidential documents.

The edition is committed in `data/books/the-dream/` and imported only by server
code. Each request sends the selected part to the browser. Reading needs no
Vercel environment changes, external GitHub access token, or reviewer password.
Old `DRAFT_PREVIEW_PASSWORD`, `DREAM_REVIEW_PASSWORD`, `DREAM_EDITION_REF`, and
`DREAM_GITHUB_TOKEN` values no longer govern reading.

The original editorial sources remain in `hanialshater/the-dream`. The bundled
edition is copied from commit `62faf7f8ee84230f1514b9b65564dd61187e8680`, content
revision `bd77f22eea891285`. It is a working draft: English is complete and aligned,
with further prose harmonization still planned. No new cuts or prose edits are
part of this access change.

## Updating the book

Compile the edition in the book repository with `web/build-edition.mjs`, then
copy all eight part JSON files and `manifest.json` to `data/books/the-dream/`.
Commit them together and deploy the blog. Part and manifest revisions must match.
Never edit generated MDX code in response to reader-submitted text.

## Reading position and notes

Reading position and unsent notes stay in the current browser. A language switch
preserves the chapter. Notes include revision, language, part, chapter, passage,
quote, category, and comment.

Without an inbox token, the note form offers **Download this note**. It produces
a JSON file the reader can share and explicitly says the note has not been sent.
There is no network submission or account setup needed for this mode.

Optionally, set `DREAM_FEEDBACK_TOKEN` with Issues read/write access to the book
repository to enable its private review inbox. The form then offers sending and
only reports success after GitHub accepts the note. This optional endpoint accepts
same-origin submissions with size limits, revision/passage checks, and a durable
recent-issue burst check. Reader text is escaped to avoid mentions. Retry markers
are checked against the most recent 100 issues; simultaneous requests can race.
These small-review-group limits are not a general-purpose abuse prevention system.

## Verification

`yarn test` exercises the real bundled book and normal drafts with all access/source
environment variables explicitly empty, including local note download. The separate
`yarn playwright test --config playwright.books.config.mjs` suite uses synthetic
content and a simulated inbox to verify the experiments and feedback without
creating real issues. `DREAM_LOCAL_EDITION_DIR` is an optional local test fixture
source and is ignored on Vercel.

The existing `.private.ts(x)` convention still excludes draft server routes from
the GitHub Pages export. It no longer denotes a password requirement.
