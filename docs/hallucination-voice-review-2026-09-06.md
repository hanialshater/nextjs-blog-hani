# Welcome to the Greatest Hallucination: author-voice review

This draft starts from Hani's original English and Arabic at `ec7f39317220b336ba3dcac43e8d4c6709b872e4`. It replaces the earlier editorial rewrite, which cut the argument and changed the voice. These notes supersede the Hallucination entry in the earlier editorial report.

The first commit restores the originals. The second contains the proposed edits against those originals, so the actual editing decisions can be reviewed separately from the restoration. This is a review draft, not a deployment.

## What the draft preserves

The LinkedIn opening and IKEA analogy; the historical stages; the struggle between narrators and builders; the Matrix emerging from collective participation; golden handcuffs; the glitches; the collapse and reload; open source and democracy of infrastructure; and “Take both.” The English reload section and most of the closing argument return verbatim. The Arabic retains the swearing, satire, and deliberate contradictions.

English edits address grammar, transitions, and specific claims. Arabic edits also repair literal constructions and shifts between incompatible dialects. Technical names and intentional English phrases remain where they serve the voice. This is not a rule to replace every English word or formal Arabic term.

## Changes that affect the argument

These are editorial proposals, not merely corrections to spelling. The factual issue and the proposed response should be judged separately.

| Passage | Original claim | Proposed treatment and reason |
| --- | --- | --- |
| Nobel | The committee validated narrative weight rather than technical claims; “AI won over real science!” | Keep the criticism of institutional prestige, but aim it at turning particular achievements into an industry-wide victory. The official [physics](https://www.nobelprize.org/prizes/physics/2024/press-release/) and [chemistry](https://www.nobelprize.org/prizes/chemistry/2024/press-release/) citations identify scientific contributions; they do not establish the committee's alleged motive. This changes the target of the criticism. |
| LeCun | Scientists were pushed out while narrators were promoted. | Name his November 2025 departure announcement and preserve the question of room for dissent. His [own announcement](https://www.linkedin.com/posts/yann-lecun_as-many-of-you-have-heard-through-rumors-activity-7397020300451749888-2lhA) says Meta would remain a partner. It does not establish that he was pushed out. The draft's interpretation remains the author's argument, not something proved by the announcement. |
| Economic concentration | A 45% market-cap share creates a mathematical ceiling; another doubling would require absorbing the physical economy. | Replace that reasoning with dependence on the same growth bet, continuing financing, paying customers, and physical costs. The original percentage lacks a defined denominator and date; market capitalization is not a fixed pool of cash. The replacement is a proposed supporting mechanism for the collapse argument. |
| Scientific stagnation | Gains are flattening according to a logarithmic reality; the field has already hit the wall. | Keep the criticism of selling scale as discovery, but make the wall conditional. This narrows the claim: the original provided no specified measurement establishing an industry-wide limit. The draft still argues for an eventual correction; it does not prove its timing or inevitability. |
| Automation | Automation necessarily destroys its customer base. | Add the condition that savings accrue to owners while displaced workers lose income. Keep the original question of who pays and the product eating its market. |

## Specific factual and language repairs

- Date Ng's course to 2011 and distinguish enrollment from completion. Describe DQN as learning to play Atari, rather than mastering every game.
- Separate GPT-2's stated release rationale from the author's judgment of its marketing effect. Remove the unsupported exact GPT-3 training bill.
- Start the ChatGPT stage in 2022. Label the 100-million figure as an estimate of monthly active users. Date investment commitments and Stargate's four-year plan instead of presenting them as current figures or completed spending.
- Keep the investment-loop example, but distinguish funding, valuation, and revenue for delivered services. The [FTC's findings](https://www.ftc.gov/policy/advocacy-research/tech-at-ftc/2025/01/behind-ftcs-6b-report-large-ai-partnerships-investments) support the cloud-spending mechanism. The round $500 million is illustrative. This does not establish that all cloud revenue is circular or that AI has no paying customers.
- Retain the narrator-power argument around Nvidia without claiming that its actual chip sales do not exist or matter.

## One reference still needs Hani's identification

The original double-greedy paragraph remains in the draft. Which paper does it mean?

The well-known [tight linear-time half-approximation](https://theory.epfl.ch/moranfe/Publications/FOCS2012.pdf) appeared at FOCS 2012. A later [parallel double-greedy paper](https://proceedings.neurips.cc/paper_files/paper/2014/file/63545404a8d4327e42a3416d73647995-Paper.pdf) appeared at NIPS 2014. Neither should silently be substituted for Hani's intended reference. The venue statement is unresolved; publication at an ML conference alone also does not establish the authors' funding motives.

## Validation

Contentlayer compiled all 30 documents and TypeScript checking passed. `git diff --check` passed. Both versions retain the original section headings and image paths. The added `lastmod` records this editorial pass; the original publication date remains November 20, 2025.

Only this article's two source files and this review note are changed. No new build or browser run was needed for the prose-only change. The double-greedy citation remains open for review.
