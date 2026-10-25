# Hani's Blog: rules for every session

This blog is a company in the System 3 city (`hanialshater/system3-city`). It is an editorial desk around the
author: the author writes and decides, and agents edit, check, translate, build demos and ship. The org, its flows
and their reasons are in `system3-meta/docs/proposals/2026-10-25-blog-org.md`; the roles are in `.claude/agents/`
and the company's records are in `company/`.

## Start of session

1. Read `company/milestones.json` and `company/asks.json` (what waits on the author).
2. If you were given a role, read `.claude/agents/<role>.md`. If not, you are the managing editor (`chief-of-staff`).

## The flows (one per kind of work)

| Work | Flow |
|---|---|
| **Post**, standalone or part of a series | editor, one warm session: the argument, then the sentences, both as proposals (for a series, continuity with the earlier parts) → fact-checker → **author approves** → Arabic editor → localization lead (both editions on the page: routes, links, RTL) → **author spot-checks** → `yarn check` → release, with the **author's deploy approval** → snippets editor |
| **Demo in a post** | demo designer (learning test cases) → demo builder → demo evaluator (free, then the test cases) → into the post bundle, with the post |
| **Standalone demo** (the `/demos` gallery) | demo designer → demo builder → demo evaluator → localization lead (title and description in both languages in `data/miniDemosData.ts`, interface strings, RTL) → `yarn check` → **author approves** → release |
| **Snippet** | snippets editor, from published posts only, in both languages; the **author approves a batch** |
| **Book chapter** (*The Dream*) | **S3 Press owns the manuscript** and edits and fact-checks it (founder, 2026-10-25). From a release the press tags: hq-engineer updates `data/books/` (the web edition) → Arabic editor (the Arabic edition stays the blog's) → localization lead → **author spot-checks** → `yarn check` → release, with the **author's deploy approval**. Unlisted until the author publishes it. The blog's editors do not edit chapter text |
| **Projects and slides** | managing editor's brief → site engineer → localization lead → `yarn check` → **author approves** → release |
| **Site feature** (newsletter, search, comments, share and follow, reading, tags, drafts, …) | a brief the **author approves** (what and why) → site engineer, on a branch with its Playwright spec → localization lead (every new string in both locales, RTL) → evaluation steward (checks green, no regression) → preview → **author approves** → release |
| **Translation of an existing item** | Arabic editor (prose) or localization lead (interface) → author spot-check → `yarn check` → release |
| **Localization** (interface strings, RTL, SEO by language) | localization lead → `yarn check` → release with the next approved deploy. A **new locale** is the author's decision, with a decision record |

## The principles

The desk follows the city's principles (`system3-meta PRINCIPLES.md`): the defaults that made an org of agents as good as
one strong agent.
- **One warm maker per item, then its independent checks.** No relay of cold editors.
- **Cost targets with a stop rule.** $8 a post and $12 a demo; work over 2× its target pauses for the author.
- **Predictions on every milestone.**
- **Lessons with beliefs** in `company/knowledge/`.
- **One owner per path** (`company/company.json` `owns`).
- **A role with no work in 4 weeks is parked.**

The HQ's Principles page shows the audit.

## Hard rules

- **The voice is the author's.**
  - Edits are proposals.
  - A substantive edit is written up for the author's review (as in `docs/editorial-pass-2026-09-06.md`).
  - The baseline text is never overwritten without the author's yes, and restoring the original is always one step.
- **Every factual or technical claim is checked before publish** by the fact-checker, never by the person who wrote it.
- **Demos are judged by someone who did not build them**, on test cases written before they were built.
- **Nothing ships in one language by accident.**
  - Every user-visible string goes through `i18n` in both locales.
  - Every published item exists in both languages, or says plainly that it does not.
- **Deploys need the author's approval, every time.**
  - Do not merge to `main` or trigger a deploy without it.
  - Work on branches and open a pull request for the author.
- **Objections travel with the work.** When the author overrides an editor, the objection stays in the review note.
- `yarn check` (typecheck, lint, build, Playwright) stays green. Only the evaluation steward changes the checks.

## Before you finish

- `yarn check` if you changed code or content.
- Update `company/milestones.json` and `company/asks.json` if their state changed.
