# The blog as a company

This folder holds the blog's records in the System 3 city's contracts (`hanialshater/system3-meta`,
`docs/product/STARTER.md` §3). The site does not read these files. The city HQ does, through Meta's tools.

| File | What |
|---|---|
| `company.json` | mission, measure, budget lines, links |
| `milestones.json` | the milestones (M0: joined the city; M1: the two drafts through the post flow; M2: *The Dream*, Part 1; M3: snippets; M4: interface parity) |
| `org.json`, `building.json` | the editorial desk: roles, reporting lines, rooms on two floors |
| `asks.json` | what waits on the author |
| `events.jsonl` | the onboarding record. The HQ also reads the git history as activity |
| `hq/city.json` | the blog's city entry: its tools (events from git, documents from posts, the book and `docs/`) |

To publish the blog's snapshot to the city HQ, run from a `system3-meta` checkout beside this repository:
`node hq/build.mjs --city=../nextjs-blog-hani/company/hq/city.json --snapshot=blog --out=hq/snapshots/blog`.
