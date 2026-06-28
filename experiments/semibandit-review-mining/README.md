# Semi-Bandit Review Mining — Live Run on Real Reviews

This directory contains a **real, reproduced run** of the Part III runbook
(*From Pairwise Judgment to Scalable Top-K*): Bradley–Terry calibrates pairwise
judgments into item-level scores, and a semi-bandit allocates a scarce judging
budget across a large candidate pool. It was executed as a **dynamic workflow of
many cooperating agents** (29 agents in this run), not a single prompt.

> **The thesis, applied:** pairwise judgment is reliable but expensive → Bradley–Terry
> makes it calibrated → the semi-bandit makes it scalable → constraints make the slate usable.

## Data

- **Source:** a real customer-review dataset (Trustpilot-style store reviews, the
  archive supplied for this task — a superset/sibling of the linked `amazon_reviews.csv`).
- **Sample:** 100 reviews, stratified across 1–5★ ratings and countries, drawn
  deterministically from 15,719 eligible reviews (120–1400 chars). See
  [`reviews_sample.json`](./reviews_sample.json).
- Nothing here is synthetic. Every snippet below is a verbatim quote from a real review.

## The dynamic multi-agent workflow

The orchestration ([`workflow.js`](./workflow.js)) runs three phases. The deterministic
math (Bradley–Terry SGD, UCB, constrained selection, convergence) lives in plain JS;
every act of *judgment* is delegated to an agent.

```
Phase 1 — EXTRACT   8 parallel agents, each mines a batch of real reviews
                    for the single most noteworthy snippet → typed candidate pool
                          │
Phase 2 — SEMIBANDIT dynamic rounds (sequential; each depends on the last):
                      ├─ JS: UCB score = BT + c·√(log(t+1)/(n+1))
                      ├─ JS: constrained slate (≤4 per type) + scale anchors
                      ├─ 2 judge agents rank the slate listwise (noteworthy + shopper lens)
                      ├─ JS: rankings → weighted pairwise (w = 1/√#pairs)
                      └─ JS: refit Bradley–Terry on all pairs, update pulls
                         loop until top-10 stabilises (min 6, max 10 rounds)
                          │
Phase 3 — SYNTHESIZE 1 agent writes the editorial 'Most Noteworthy' module
```

**Why agents, not one call?** A single LLM call cannot honestly score 82 snippets on a
stable 1–10 scale — the scale drifts (the runbook's calibration problem). So each agent
only makes *local* listwise comparisons; Bradley–Terry recovers a shared latent scale from
those local wins, and the semi-bandit decides which snippets the next (expensive) judges
should look at. The judges are the budget; the bandit spends it.

## Run summary

| Metric | Value |
|---|---:|
| Reviews sampled | 100 |
| Candidate snippets extracted | 82 |
| Semi-bandit rounds | 10 |
| Pairwise constraints accumulated | 1,744 |
| Agents spawned | 29 (8 extract + 20 judge + 1 synth) |
| Slate size K | 12 (+ up to 3 anchors) |
| Exploration c | 1.0 |

## Table 1 — Best current candidates (sort by Bradley–Terry score)

*What currently looks best.* These are the snippets the calibrated scale ranks highest.

| # | BT | pulls | type | ★ | snippet |
|--:|--:|--:|---|--:|---|
| 1 | +2.17 | 10 | complaint | 1 | I ordered an Apple Magic keyboard, received a wooden picture frame. |
| 2 | +1.54 | 3 | story | 1 | They only gave me a refund for one pair and not the other. They said they didnt receive the 2nd pair and finally after 4 |
| 3 | +1.50 | 8 | complaint | 4 | Trainers for my adult son arrived with NO packaging at all, just in their shoe box which was not even taped down. The li |
| 4 | +1.47 | 3 | story | 1 | So at the moment, having to order a second unit due to low stock, I am now over £640 out of pocket and have no unit. Why |
| 5 | +1.16 | 2 | complaint | 2 | Tried to file for a return immediately and received intimation that i would have to take it into a Pitboss service cente |
| 6 | +1.09 | 8 | story | 1 | Delivery driver called me to say he was on my street so I waited outside for 15 minutes, only to get a notification that |
| 7 | +1.05 | 7 | story | 1 | I ordered birthday gifts for a special needs little girl and paid extra to have them delivered quickly! You guessed it…t |
| 8 | +1.01 | 6 | complaint | 1 | Amazon customer service then said that even though their system did not acknowledge any fault by Amazon they would give  |
| 9 | +0.93 | 1 | service | 5 | I have issues with Bezos' oligarch status in modern American society but this company is a Rockstar... Amazon fixed it i |
| 10 | +0.92 | 5 | warning | 3 | a solar panel of 10 by 20 cm can never be 50wp as an example. Solarchargers of type mppt that are not that type at all,  |
| 11 | +0.88 | 3 | complaint | 1 | Don't offer me 10% off of a fire stick remote when YOU deemed it defective! Purchased six month ago and it's defective.. |
| 12 | +0.85 | 6 | story | 1 | Amazon told me my parcel would be delivered, driver turned up no parcel, I phoned Amazon and was told parcel on its way, |

The runaway winner — *“I ordered an Apple Magic keyboard, received a wooden picture
frame.”* — was selected in **all 10 rounds** (pulls = 10) and pulled away to BT ≈ +2.17.
That is the system spending its budget on a confirmed winner.

## Table 2 — Most worth testing next (sort by UCB)

*Where the next judging budget should go* — high score **or** high uncertainty.
Note the never-pulled candidates (`pulls = 0`) riding the exploration bonus into contention.

| UCB | BT | pulls | type | snippet |
|--:|--:|--:|---|---|
| +2.64 | +2.17 | 10 | complaint | I ordered an Apple Magic keyboard, received a wooden picture frame. |
| +2.32 | +1.54 | 3 | story | They only gave me a refund for one pair and not the other. They said they didnt receive th |
| +2.24 | +1.47 | 3 | story | So at the moment, having to order a second unit due to low stock, I am now over £640 out o |
| +2.05 | +1.16 | 2 | complaint | Tried to file for a return immediately and received intimation that i would have to take i |
| +2.02 | +0.93 | 1 | service | I have issues with Bezos' oligarch status in modern American society but this company is a |
| +2.01 | +1.50 | 8 | complaint | Trainers for my adult son arrived with NO packaging at all, just in their shoe box which w |
| +1.73 | +0.18 | 0 | complaint | I'm cancelling subscription because I seldom get shipping times stated on their products.  |
| +1.73 | +0.18 | 0 | complaint | They often run over my lawn putting ruts in it. They sometimes run over my driveway marker |
| +1.73 | +0.18 | 0 | complaint | They would be nice at first but by the end, they would just randomly disconnect. |
| +1.73 | +0.18 | 0 | complaint | Amazon won't let me post a review with the issues I had and rejected my review stating the |

## Table 3 — Uncertain but promising

*High upside:* at/above median BT but barely judged (low pulls, high uncertainty).
These are the candidates a greedy ranker would ignore and a semi-bandit keeps alive.

| BT | uncertainty | pulls | type | snippet |
|--:|--:|--:|---|---|
| +0.18 | 1.00 | 0 | complaint | I'm cancelling subscription because I seldom get shipping times stated on their products.  |
| +0.18 | 1.00 | 0 | complaint | They often run over my lawn putting ruts in it. They sometimes run over my driveway marker |
| +0.18 | 1.00 | 0 | complaint | They would be nice at first but by the end, they would just randomly disconnect. |
| +0.18 | 1.00 | 0 | complaint | Amazon won't let me post a review with the issues I had and rejected my review stating the |
| +0.18 | 1.00 | 0 | complaint | If I search for "Asus" why is the first page filled with your "sponsored" stuff that is no |
| +0.18 | 1.00 | 0 | complaint | To say that it's annoying is an understatement. Clearly they really need to improve on thi |
| +0.18 | 1.00 | 0 | complaint | I cannot tell whether my items were stolen or they were not delivered at all equals a scam |
| +0.18 | 1.00 | 0 | complaint | Try to place an order and they tell me they will get back with me in 24 hours. Been a week |

## The usable slate (constrained top-K)

Top by BT under a diversity constraint (≤3 per type) — this is what you'd actually surface.
A naive top-K would have been all `complaint`/`story`; the constraint pulls in `service`,
`warning` and `praise` so the module reads as a balanced page, not a pile-on.

| # | type | ★ | BT | snippet |
|--:|---|--:|--:|---|
| 1 | complaint | 1 | +2.17 | I ordered an Apple Magic keyboard, received a wooden picture frame. |
| 2 | story | 1 | +1.54 | They only gave me a refund for one pair and not the other. They said they didnt receive the 2nd pair and final |
| 3 | complaint | 4 | +1.50 | Trainers for my adult son arrived with NO packaging at all, just in their shoe box which was not even taped do |
| 4 | story | 1 | +1.47 | So at the moment, having to order a second unit due to low stock, I am now over £640 out of pocket and have no |
| 5 | complaint | 2 | +1.16 | Tried to file for a return immediately and received intimation that i would have to take it into a Pitboss ser |
| 6 | story | 1 | +1.09 | Delivery driver called me to say he was on my street so I waited outside for 15 minutes, only to get a notific |
| 7 | service | 5 | +0.93 | I have issues with Bezos' oligarch status in modern American society but this company is a Rockstar... Amazon  |
| 8 | warning | 3 | +0.92 | a solar panel of 10 by 20 cm can never be 50wp as an example. Solarchargers of type mppt that are not that typ |
| 9 | praise | 4 | +0.78 | I've placed literally hundreds of orders through Amazon, and 98% of the time, I've been satisfied either with  |
| 10 | praise | 4 | +0.72 | I bought a Fire TV from them for Black Friday and it has been pretty darn good! I do really, REALLY, recommend |

## Convergence

Top-3 by BT after each round. The #1 snippet locks in at round 1 and never moves; the
tail keeps reshuffling as the bandit explores, which is why the loop ran the full 10 rounds
rather than early-stopping — the *head* converged long before the *order of the tail* did.

| round | slate | cumulative pairs | top-3 (by BT) |
|--:|--:|--:|---|
| 1 | 12 | 132 | cand_007, cand_002, cand_006 |
| 2 | 14 | 314 | cand_007, cand_002, cand_006 |
| 3 | 14 | 496 | cand_007, cand_054, cand_006 |
| 4 | 14 | 678 | cand_007, cand_054, cand_006 |
| 5 | 14 | 860 | cand_007, cand_054, cand_006 |
| 6 | 14 | 1,042 | cand_007, cand_054, cand_006 |
| 7 | 14 | 1,224 | cand_007, cand_054, cand_006 |
| 8 | 13 | 1,380 | cand_007, cand_064, cand_028 |
| 9 | 14 | 1,562 | cand_007, cand_028, cand_030 |
| 10 | 14 | 1,744 | cand_007, cand_028, cand_054 |

## Editorial module (Phase 3 synthesis agent)

Most Noteworthy Reviews

A pipeline of real customer reviews surfaced these as the most telling signals, for better and worse.

- "I ordered an Apple Magic keyboard, received a wooden picture frame." — The fulfillment mix-up so absurd it writes its own headline.
- "They said they didnt receive the 2nd pair and finally after 4 weeks found it but said it was damaged and charged me for it." — A four-week refund saga that ends with the customer billed for the seller's own mishandling.
- "Trainers... arrived with NO packaging at all... The lid was actually open." — Four stars despite shoes shipped one rainstorm away from ruin; goodwill stretched thin.
- "I am now over £640 out of pocket and have no unit. Why they could not just send a filter pack is beyond reason." — When rigid policy turns a small part into a costly ordeal.
- "Amazon fixed it in the first three minutes of my raising it to their attention." — Proof that fast, no-drama service still earns five stars, oligarchs aside.

## Files

| File | Contents |
|---|---|
| [`workflow.js`](./workflow.js) | The full dynamic multi-agent workflow (reviews embedded; BT + UCB + constraints in JS, judgment in agents). |
| [`reviews_sample.json`](./reviews_sample.json) | The 100 real reviews used as input. |
| [`candidates.json`](./candidates.json) | The 82 extracted snippets with final BT score, pulls, uncertainty, UCB. |
| [`results.json`](./results.json) | Full run output: candidates, all three tables, convergence trace, editorial. |

### Reproduce

The run is deterministic (seeded PRNG; no `Math.random`/`Date.now`). Re-running
`workflow.js` reproduces the same allocation given the same judge decisions. Extraction and
judging are LLM agents, so their text may vary slightly between runs; the BT/UCB/constraint
machinery does not.
