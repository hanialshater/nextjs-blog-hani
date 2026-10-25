---
copiedFrom: system3-city skills/hq-page @ 7079c7d
name: hq-page
description: Build a page for a company's HQ (or a template for the city's pages/) from the HQ's contracts only (events, org, dashboard, knowledge, documents), never from the company's files. Use when a company needs a view the starter pages do not have.
---

# HQ page

A page is an ES module that exports `render(ctx)` and returns HTML. The HQ calls it with:

| `ctx` field | What |
|---|---|
| `events` | the v1 event log, up to the replay's moment |
| `org` | the org contract: `[{ id, name?, title, reportsTo, team?, room?, floor? }]` |
| `dashboard` | the dashboard contract: `{ mission, budget, milestones, kpis, links, asks }` |
| `knowledge` | lessons: `[{ topic, kind, text, evidence, belief, scope? }]` |
| `docs` | documents: `[{ n, type, scope, title, status, owner, date, summary, path }]` |
| `company` | the company's city card |
| `esc`, `time`, `pct` | helpers. Always escape text with `esc` |

Rules:
- Read only `ctx`. Never fetch a company's files: the HQ reads companies through their tools.
- No dependencies, no network, no storage. Pages also run in the static build.
- Style with the HQ's classes (`card`, `row`, `stat`, `chip`, `k`, `empty`, `table`). They follow light and dark.
- A page with nothing to show says so (`<div class="empty">…</div>`).

To use a template from the city, copy it into the company and customise the copy:

```sh
node src/city-copy.mjs page asks <company dir>   # (in system3-meta) → hq/asks.js and its entry in hq/pages.json
```

To share one, open a pull request to the city with `pages/<id>/PAGE.md` and `pages/<id>/page.js`.
