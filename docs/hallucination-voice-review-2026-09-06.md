# Welcome to the Greatest Hallucination: author-voice review

This draft starts from Hani's original English and Arabic at `ec7f39317220b336ba3dcac43e8d4c6709b872e4`. It replaces the earlier editorial rewrite, which cut the argument and changed the voice. These notes supersede the Hallucination entry in the earlier editorial report.

In PR #17, the first commit restored the originals and the second contained the edits against them, so the editing decisions could be reviewed separately from the restoration. Hani approved publication, and that revision is live. The first-pass notes below are retained as a record; the focused follow-up at the end describes the subsequent changes.

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

## Double-greedy reference

The first pass preserved the original double-greedy anecdote while its intended paper remained unidentified. The focused follow-up replaces it with a specifically named, linked example: *Parallel Double Greedy Submodular Maximization*, NIPS 2014. This is an illustrative replacement, not a claim that we identified Hani's intended “best CS paper in a decade.”

The well-known [tight linear-time half-approximation](https://theory.epfl.ch/moranfe/Publications/FOCS2012.pdf) appeared at FOCS 2012. The later [parallel paper](https://proceedings.neurips.cc/paper_files/paper/2014/file/63545404a8d4327e42a3416d73647995-Paper.pdf) studies approximation guarantees and concurrency control, with ML applications. The published argument now concerns how the AI label absorbs the wider computing stack; it makes no claim about why these researchers selected their venue.

## Validation

Contentlayer compiled all 30 documents and TypeScript checking passed. `git diff --check` passed. Both versions retain the original section headings and image paths. The added `lastmod` records this editorial pass; the original publication date remains November 20, 2025.

Only this article's two source files and this review note are changed. PR #17 passed CI and deployment; both live language versions were verified after publication.

## Focused follow-up after the fresh-read evaluation

Hani requested another pass with the voice preserved. This pass keeps the opening, historical stages, Matrix argument, swearing, reload, “Take both,” and final surfing line. The changes concentrate on the identified weak passages:

- The financing loop now runs backwards in a worked hypothetical: missed revenue, a stalled funding round, reduced cloud purchases, and weaker supplier growth. A new connecting paragraph explains why useful models can coexist with a failing financial story. This supports the author's forecast without claiming a mathematical proof of an inevitable crash.
- The LeCun heading becomes “The godfather still has work to do.” The paragraph uses his announced research agenda to examine how scientific authority is borrowed to sell an apparently settled destination. It does not claim that departure proves he was forced out.
- “Scientific Stagnation” becomes “The Breakthrough on the Roadmap.” The paragraph targets the treatment of an uncertain discovery as a scheduled business deliverable. Its place in the collapse argument now follows from the mismatch between research and financing schedules.
- The glitches contrast sweeping launch rhetoric with everyday life. The list targets valuations ahead of customers and investment treated as independent demand, rather than claiming that all AI customers are absent.
- Infrastructure ownership becomes something builders have to establish and contest. The ending no longer assumes a crash automatically transfers control to them.
- Arabic replaces opaque constructions about future prices, cynical distance, sunk costs, and “maintaining the narrative” with concrete meanings. The two languages carry the same argument without imposing the English sentence structure on Arabic.
