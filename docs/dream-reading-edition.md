# The Dream: private bilingual reading edition

The reader lives at `/drafts/books/the-dream/ar/part-1` and
`/drafts/books/the-dream/en/part-1`, with four parts in each language.

The manuscript and compiled edition remain in the **private**
`hanialshater/the-dream` repository. This public repository contains the reading
interface and generic mathematical experiments. Do not copy book prose into
`data/posts`, `public`, test fixtures, or a `NEXT_PUBLIC_*` environment variable.

## Server configuration

Configure these in the Vercel project that serves the blog, then redeploy:

| Variable | Value and purpose |
|---|---|
| `DREAM_EDITION_REF` | A full 40-character commit SHA in the private book repository containing `web/edition/manifest.json` and all eight part JSON files. Pin a commit, not a moving branch. |
| `DREAM_GITHUB_TOKEN` | A fine-grained GitHub token restricted to the private book repository, with Contents read permission. It is used only on the server. |
| `DREAM_REVIEW_PASSWORD` | A randomly generated password, 32–256 characters. Book reviewers sign in with username `dream`. |
| `DREAM_FEEDBACK_TOKEN` | A token restricted to the same private repository, with Issues read/write permission. If omitted, feedback uses `DREAM_GITHUB_TOKEN`, which then also needs Issues read/write. |

The existing owner credential (`hani` / `DRAFT_PREVIEW_PASSWORD`) also opens the
book. The `dream` credential **does not** open the owner's other drafts or their
assets. Share the book credential through an appropriate private channel; never
put it in a URL, issue, PR, or this repository.

Both the middleware and the server data boundary authenticate requests. Pages
and feedback responses use private/no-store and noindex headers. The reading
layout has no analytics or public comments. The private routes use the existing
`.private.ts(x)` convention and are omitted from the GitHub Pages static export.

## Edition updates

1. Edit and compile content in the private book repository using its
   `web/build-edition.mjs` instructions.
2. Commit the complete edition there. Each part and manifest share a content
   revision identifier; the reader rejects mismatched revisions.
3. Set `DREAM_EDITION_REF` to that commit and redeploy this reader.
4. Check an Arabic and English part as a book reviewer, then verify that an
   unrelated owner draft still rejects the same credential.

The reader downloads only the requested part. Public Part I images and demos are
reused at their existing public paths. New experiments are React components with
generic explanatory labels; the longer worked explanations remain private.

## Feedback and reading position

Select a passage and choose **Leave a note**. A submission records the edition
revision, language, part, stable chapter ID, content-derived passage ID, selected
quote, category, and comment. It becomes an issue in the private book repository.
No issue URL or repository credential is returned to a reviewer.

Unsent notes and reading position remain in that browser's local storage. They
are not synchronized between devices. Switching languages preserves the chapter;
the two transcreated texts need not have matching paragraph boundaries. Reading
position within one language uses a passage ID where possible and falls back to
the chapter after a content revision.

The form reports success only after the server accepts a save. Failures retain
the unsent note. Stale editions receive a distinct message so the reader can copy
the note before reloading. Normal retries use a submission marker checked against
the latest 100 private issues. A durable recent-issue check also limits ordinary
bursts. This is a small review-group workflow, not a transactional queue: simultaneous
identical requests can race, and retries after the latest-100 window can duplicate.

## Local verification

Install dependencies with the repository's pinned Yarn version, then:

```sh
yarn build
node node_modules/@playwright/test/cli.js install chromium
node node_modules/@playwright/test/cli.js test --config playwright.books.config.mjs
```

Public CI tests generate synthetic text outside the repository and replace
GitHub only in the test server process. No test creates a real GitHub issue.
To check the real book locally, point `DREAM_LOCAL_EDITION_DIR` to the private
checkout's `web/edition` directory before running the same tests. This filesystem
source is disabled on Vercel. If using an already installed Chromium binary,
set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` for the test runner.

The tests cover all eight reading pages, chapter/language position, book-only
authorization, RSC requests, passage feedback and failed saves, all eight
experiments, Arabic mobile overflow, and feedback request validation.

## Launch state

The implementation is prepared for review. A successful local test does not
configure Vercel secrets or publish the live draft. Deployment requires the
correct Vercel account/project connection and the server variables above.
