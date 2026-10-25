# Hani's Blog: rules for every session

This blog is a company in the System 3 city (`hanialshater/system3-city`). It is an editorial desk around the
author: the author writes and decides, and agents edit, check, translate, build demos and ship. The org, its flows
and their reasons are in `system3-meta/docs/proposals/2026-10-25-blog-org.md`; the roles are in `.claude/agents/`
and the company's records are in `company/`.

## Start of session

1. Read `company/milestones.json` and `company/asks.json` (what waits on the author).
2. If you were given a role, read `.claude/agents/<role>.md`. If not, you are the managing editor (`chief-of-staff`).

## The flows (one per content type)

| Content | Flow |
|---|---|
| Post | developmental editor → fact-checker → line editor → **author approves** → Arabic editor → **author spot-checks** → spark curator → `yarn check` → release, with the **author's deploy approval** |
| Translation | Arabic editor → author spot-check → `yarn check` → release |
| Demo | demo designer (learning test cases) → demo builder → demo evaluator (free, then the test cases) → into the post bundle |
| Book chapter (*The Dream*) | as a post, chapter by chapter; unlisted until the author publishes it |
| Spark | spark curator, from published posts only; the author approves them in batches |

## Hard rules

- **The voice is the author's.**
  - Edits are proposals.
  - A substantive edit is written up for the author's review (as in `docs/editorial-pass-2026-09-06.md`).
  - The baseline text is never overwritten without the author's yes, and restoring the original is always one step.
- **Every factual or technical claim is checked before publish** by the fact-checker, never by the person who wrote it.
- **Demos are judged by someone who did not build them**, on test cases written before they were built.
- **Deploys need the author's approval, every time.**
  - Do not merge to `main` or trigger a deploy without it.
  - Work on branches and open a pull request for the author.
- **Objections travel with the work.** When the author overrides an editor, the objection stays in the review note.
- `yarn check` (typecheck, lint, build, Playwright) stays green. Only the evaluation steward changes the checks.

## Before you finish

- `yarn check` if you changed code or content.
- Update `company/milestones.json` and `company/asks.json` if their state changed.
