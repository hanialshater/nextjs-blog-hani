# Scaled Run — 2,000 Reviews with a Haiku Pre-Filter

Same machinery as the [parent experiment](../README.md), scaled 20x and fronted with a
**cheap Haiku quality filter** so the expensive Bradley-Terry + semi-bandit judging never
wastes a comparison on junk. This is the runbook's budget discipline taken one layer earlier:
filter cheaply, *then* allocate the expensive judge.

## Pipeline

```
2000 real reviews
   |  Phase 0 FILTER  - 25 Haiku agents (model: haiku), 80 reviews each, read their batch file,
   |                    drop generic/empty/boilerplate, keep only noteworthy-potential reviews
   v
1206 survivors  (720 high / 486 med potential)
   |  cap -> 280 survivors (high-potential first)
   |  Phase 1 EXTRACT - Haiku agents re-read batches, pull 1 noteworthy snippet per survivor
   v
160-candidate pool  (capped)
   |  Phase 2 SEMIBANDIT - UCB slate (K=18, <=5/type, anchors) -> 2-lens judge panel ->
   |                       weighted pairwise -> BT refit.  14 rounds, 5,246 pairwise constraints
   v  Phase 3 SYNTHESIZE - editorial module
```

| Metric | Value |
|---|---:|
| Reviews in | 2,000 |
| Kept by Haiku filter | 1206 (60%) - 720 high potential |
| Sent to extraction (capped) | 280 |
| Candidate pool (capped) | 160 |
| Semi-bandit rounds | 14 |
| Pairwise constraints | 5,246 |
| Agents spawned | 66 (25 filter + ~26 extract + 28 judge + 1 synth) |
| Subagent tokens | ~1.15M |

## Table 1 - Best by Bradley-Terry score

| # | BT | pulls | type | star | snippet |
|--:|--:|--:|---|--:|---|
| 1 | +3.02 | 7 | complaint | 1 | I purchased 4 black leggings that bled all over my white LV bag and the stains will not come out. All Amazon offered was |
| 2 | +1.75 | 13 | warning | 1 | I ordered Hoverboards for my grandchildren that had already been shipped out and recalled for safety reasons—I've exhaus |
| 3 | +1.62 | 14 | warning | 1 | Whilst connecting a smart TV to the 'in built' Amazon Prime, I was directed to another page which asked me to call 08003 |
| 4 | +1.62 | 13 | warning | 1 | The Amazon driver took a photo of the delivered parcel on the doorstep and then was caught walking away with the parcel, |
| 5 | +1.57 | 12 | complaint | 1 | My Fiji bottles arrived with holes in the bottom, leaking into the box. I sent several images showing the damage, but re |
| 6 | +1.46 | 4 | warning | 1 | The delivery driver can be seen on my ring doorbell reading the notice saying not to leave parcels in the bin, then lift |
| 7 | +1.42 | 11 | complaint | 1 | Last three things I bought from Amazon were counterfeit. A holographic sight. Protein powder and even vitamins were coun |
| 8 | +1.31 | 13 | complaint | 1 | Delivery driver literally threw my package, from waist high onto my concrete porch. I asked her why she threw the packag |
| 9 | +1.17 | 8 | warning | 1 | My friend sent a Christmas present through Amazon. They delivered it and left it in full view on my front door step, so  |
| 10 | +0.91 | 6 | complaint | 1 | I wasn't in when my parcel arrived. The delivery driver can be seen on my ring doorbell reading the notice on my bin whi |
| 11 | +0.88 | 7 | complaint | 1 | I recently bought a $300 item that broke just after the return time. I notified the seller and got no help, so I reached |
| 12 | +0.87 | 1 | warning | 1 | Delivery driver stole my parcel. Marked it as delivered and I was in the house watching the tracking, but he did not sho |
| 13 | +0.78 | 6 | warning | 1 | Amazon 'Limited' my account after I updated my credit card information. They need a picture of my drivers license, a ban |
| 14 | +0.73 | 4 | complaint | 1 | If I could score zero I would. Whilst at home waiting for the delivery of a Christmas gift (bottle of alcohol), I was wa |
| 15 | +0.66 | 3 | warning | 1 | When returning multiple items in one parcel, you will not be refunded for all of them - I was initially refunded but the |

The winner - *"4 black leggings that bled all over my white LV bag"* - pulled away to BT **+3.02**,
a full 1.3 above second place. It was judged 7 times; the bandit kept confirming it rather than
re-litigating the obvious.

## Table 2 - Most worth testing next (UCB)

| UCB | BT | pulls | type | snippet |
|--:|--:|--:|---|---|
| +3.60 | +3.02 | 7 | complaint | I purchased 4 black leggings that bled all over my white LV bag and the stains will n |
| +2.20 | +1.46 | 4 | warning | The delivery driver can be seen on my ring doorbell reading the notice saying not to  |
| +2.19 | +1.75 | 13 | warning | I ordered Hoverboards for my grandchildren that had already been shipped out and reca |
| +2.06 | +1.62 | 13 | warning | The Amazon driver took a photo of the delivered parcel on the doorstep and then was c |
| +2.05 | +1.62 | 14 | warning | Whilst connecting a smart TV to the 'in built' Amazon Prime, I was directed to anothe |
| +2.04 | +0.87 | 1 | warning | Delivery driver stole my parcel. Marked it as delivered and I was in the house watchi |
| +2.03 | +1.57 | 12 | complaint | My Fiji bottles arrived with holes in the bottom, leaking into the box. I sent severa |
| +1.89 | +1.42 | 11 | complaint | Last three things I bought from Amazon were counterfeit. A holographic sight. Protein |
| +1.78 | +0.13 | 0 | complaint | Delivery driver was too lazy to walk up stairs and threw my parcel at me. Absolutely  |
| +1.78 | +0.13 | 0 | complaint | Can't even place an Amazon order unless you're a Prime member—when you say no, a litt |

## Table 3 - Uncertain but promising (at/above median BT, <=2 pulls)

| BT | uncertainty | pulls | type | snippet |
|--:|--:|--:|---|---|
| +0.13 | 1.00 | 0 | complaint | Delivery driver was too lazy to walk up stairs and threw my parcel at me. Absolutely  |
| +0.13 | 1.00 | 0 | complaint | Can't even place an Amazon order unless you're a Prime member—when you say no, a litt |
| +0.13 | 1.00 | 0 | complaint | Amazon double charged me and their response was far from swift—I had to rely on my ba |
| +0.13 | 1.00 | 0 | complaint | Charged postage and VAT despite spending over £25 and meeting free delivery requireme |
| +0.13 | 1.00 | 0 | complaint | Amazon has not given me my refund even though they received the returned item over 2  |
| +0.13 | 1.00 | 0 | complaint | My poster arrived damaged and I requested a return, but when I tried to leave a negat |
| +0.13 | 1.00 | 0 | complaint | They charged me £95 for a Prime subscription I never requested and the items weren't  |
| +0.13 | 1.00 | 0 | complaint | Amazon introduced a separate £2.99 monthly payment for Prime Video to remove ads, bre |

## Usable slate (top by BT, <=3 per type)

| # | type | star | BT | snippet |
|--:|---|--:|--:|---|
| 1 | complaint | 1 | +3.02 | I purchased 4 black leggings that bled all over my white LV bag and the stains will not come out. All Ama |
| 2 | warning | 1 | +1.75 | I ordered Hoverboards for my grandchildren that had already been shipped out and recalled for safety reas |
| 3 | warning | 1 | +1.62 | Whilst connecting a smart TV to the 'in built' Amazon Prime, I was directed to another page which asked m |
| 4 | warning | 1 | +1.62 | The Amazon driver took a photo of the delivered parcel on the doorstep and then was caught walking away w |
| 5 | complaint | 1 | +1.57 | My Fiji bottles arrived with holes in the bottom, leaking into the box. I sent several images showing the |
| 6 | complaint | 1 | +1.42 | Last three things I bought from Amazon were counterfeit. A holographic sight. Protein powder and even vit |
| 7 | regret | 1 | +0.18 | After being a prime member for years, Amazon has randomly decided to close my account this week. They say |
| 8 | service | 1 | -0.41 | When I contacted the seller about the smashed plastic tub, she became abusive. I contacted Amazon and com |
| 9 | durability | 1 | -0.51 | Since Amazon began making their own in-house deliveries, in over 12 months every delivery has been late o |
| 10 | regret | 1 | -0.99 | I have been hacked twice and spent an hour on the phone trying to get into Prime Video, then discovered a |
| 11 | regret | 1 | -1.00 | They locked me out of my account and asked for bank statements with confidential info which they have no  |

## Convergence

| round | slate | cumulative pairs | top-3 by BT |
|--:|--:|--:|---|
| 1 | 18 | 306 | cand_006, cand_017, cand_007 |
| 2 | 20 | 686 | cand_085, cand_006, cand_091 |
| 3 | 20 | 1,066 | cand_006, cand_013, cand_096 |
| 4 | 20 | 1,446 | cand_006, cand_016, cand_013 |
| 5 | 20 | 1,826 | cand_006, cand_016, cand_091 |
| 6 | 20 | 2,206 | cand_006, cand_016, cand_085 |
| 7 | 20 | 2,586 | cand_006, cand_085, cand_091 |
| 8 | 20 | 2,966 | cand_027, cand_006, cand_096 |
| 9 | 20 | 3,346 | cand_027, cand_085, cand_096 |
| 10 | 20 | 3,726 | cand_027, cand_085, cand_096 |
| 11 | 20 | 4,106 | cand_027, cand_085, cand_006 |
| 12 | 20 | 4,486 | cand_027, cand_085, cand_091 |
| 13 | 20 | 4,866 | cand_027, cand_085, cand_091 |
| 14 | 20 | 5,246 | cand_027, cand_085, cand_006 |

Unlike the 100-review run (where #1 locked at round 1), here the lead changed hands: cand_006
led early, then the leggings snippet (cand_027) overtook it from round 8 once it had been
compared enough times. The loop ran the full 14 rounds - the tail never fully froze.

## An honest caveat about pool composition

The capped pool skewed hard: **{'complaint': 132, 'regret': 4, 'warning': 22, 'durability': 1, 'service': 1}**. Two reasons:

1. This 2k sample is ~45% 1-star and the dataset is overwhelmingly store/delivery complaints, so
   the raw material is negative.
2. The Haiku filter (keep high-potential first) and extractor both pushed toward dramatic
   complaints/warnings, and the high-potential cap then crowded out the rarer joke / praise /
   story / use_case types.

The consequence: the type-diversity constraint can only diversify across types that **survive into
the pool**. With almost no jokes or praise left, the "diverse" slate is really
complaint-vs-warning-vs-regret. If the goal were a balanced module, the fix is upstream -
stratify the filter by candidate_type (reserve quota for praise/joke), not at the slate stage.
That is something the run *revealed* rather than hid.

## Editorial module (synthesis agent)

Most Noteworthy Reviews

What 2,000 customers wanted you to know — the good, the bad, and the truly alarming.

- **The leggings that ate a designer bag.** A refund won't reupholster your LV — and Amazon knows it.

- **Recalled hoverboards, shipped anyway.** When the fix is small claims court, the system has already failed.

- **The "Prime support" phone scam.** A smart-TV setup that quietly hands your account to strangers asking for passcodes.

- **Photographed on the doorstep, then pocketed.** The delivery proof and the theft were the same trip.

- **"Your photo doesn't show damage."** Leaking Fiji bottles, time-stamped evidence, and a denial anyway.

- **Counterfeits, three for three.** A sight, protein powder, and vitamins — when even the supplements are fake, trust is the real casualty.

- **Loyalty, then the lockout.** Banned for "too many returns" by a member who swears he's never returned a thing.

## Files

| File | Contents |
|---|---|
| ../workflow_2k.js | The 4-phase workflow (filter+extract read batch files; BT/UCB/constraints in JS). |
| reviews_2k_sample.json | The 2,000 real reviews used (compact). |
| candidates_2k.json | The 160-candidate pool with BT / pulls / uncertainty / UCB. |
| results_2k.json | Full run output incl. all tables and convergence trace. |
