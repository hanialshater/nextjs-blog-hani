# Bilingual editorial pass — 6 September 2026

This is a review draft of eleven published posts in English and Arabic, plus a project note for **When Thought Became Electric**. The aim is to strengthen the serious arguments and make the Arabic read naturally in Hani’s conversational Levantine voice. Short observations and fiction receive lighter treatment. Humor, technical detail, equations, and existing illustrations remain part of the writing.

**The substantive Hume/Dream pass is deferred at Hani’s request.** Its two files contain only an added note identifying *The Dream That Gave Us Computers* as the larger book project. Their original bodies are otherwise unchanged. Unpublished posts are outside this pass.

## Article-by-article review

Each row has its own content commit, with both languages together.

| Article | Pass | Main changes |
| --- | --- | --- |
| When Thought Became Electric — [EN](../data/posts/thinking-became-electric-part-1/index.mdx) · [AR](../data/posts/thinking-became-electric-part-1/index.ar.mdx) | Project note only | Identify the larger Dream book project. Leave the argument, history, Hume section, and demos for the later pass. |
| Agent Autonomy, Part 1 — [EN](../data/posts/agent-autonomy/index.mdx) · [AR](../data/posts/agent-autonomy/index.ar.mdx) | Substantive corrections and line edits | Separate algorithm families from historical eras; correct complexity and optimization claims; distinguish illustrative figures and a local packing score from a verified record; repair references and awkward Arabic terminology. |
| Agent Autonomy, Part 2 — [EN](../data/posts/agent-autonomy-part-2/index.mdx) · [AR](../data/posts/agent-autonomy-part-2/index.ar.mdx) | Substantive structural pass | Keep the proposed architecture while distinguishing model analogies, evaluator scores, working interfaces, and evidence of learning. Clarify evaluator separation and reference access. Remove the unfinished video placeholder. |
| The AGI Misunderstanding — [EN](../data/posts/agi-misunderstanding/index.mdx) · [AR](../data/posts/agi-misunderstanding/index.ar.mdx) | Reworked argument | Keep the daughter’s number game and skeptical humor. Show why the initial number cancels. Separate choosing a value, maintaining a commitment, and subjective experience. |
| Practical Decision-Making / The Bandit Legacy — [EN](../data/posts/edp-sort/index.mdx) · [AR](../data/posts/edp-sort/index.ar.mdx) | Technical and Arabic pass | Distinguish regret minimization from identification and ranking; describe the pairing demo’s actual metric; flag the inconsistent constraint count; correct the Arabic RUCB discussion. Add an Arabic version of the averaged pairing demo. |
| Vision-Encoded Text Compression — [EN](../data/posts/vision-encoded-text-compression/index.mdx) · [AR](../data/posts/vision-encoded-text-compression/index.ar.mdx) | Major revision | Preserve the exploratory result, images, and reported scores. Withdraw the unsupported 8× billing claim; separate readability, pixel area, and provider token accounting. Fix the arithmetic and improve the illustrative rendering code. Propose a reproducible benchmark. |
| Modeling Resilience / Option B — [EN](../data/posts/modeling-resilience-option-b/index.mdx) · [AR](../data/posts/modeling-resilience-option-b/index.ar.mdx) | Major revision | Present a synthetic-data modeling essay. Explain the logistic curve, partial pooling, parameter units, and limitations. Separate assumptions and parameter recovery from psychological or causal findings. |
| Welcome to the Greatest Hallucination — [EN](../data/posts/welcome-to-the-greatest-hallucination/index.mdx) · [AR](../data/posts/welcome-to-the-greatest-hallucination/index.ar.mdx) | Major revision | Keep the Baudrillard-inspired critique and LinkedIn satire. Treat the four phases as a lens; distinguish evidence from prestige. Correct Nobel framing and valuation reasoning; label the funding-loop example as hypothetical. |
| Ignore the Feathers — [EN](../data/posts/ignore-the-feathers/index.mdx) · [AR](../data/posts/ignore-the-feathers/index.ar.mdx) | Focused pass | Preserve the peacock and roadmap argument. Qualify costly signaling, use realistic experiment budgets, expose scoring assumptions, and question bad metrics. Replace literal Arabic idioms. |
| The Panic Button — [EN](../data/posts/panic-button-principle/index.mdx) · [AR](../data/posts/panic-button-principle/index.ar.mdx) | Focused rewrite | Keep a short leadership essay with three practical actions. Remove unsupported physiological/productivity claims. Make the promise of help credible, and avoid treating an unused button as proof that the system works. |
| Price of Anarchy — [EN](../data/posts/price-of-anarchy/index.mdx) · [AR](../data/posts/price-of-anarchy/index.ar.mdx) | Light conceptual pass | Keep Uncle Jalal and the political satire. Correct the definitions of price of anarchy and Nash equilibrium, and place Ostrom’s work in context. Keep the car-scratching proposal inside the joke. |
| The Love-Prompt of Devesh the Octopus — [EN](../data/posts/the-love-prompt-of-devesh-the-octopus/index.mdx) · [AR](../data/posts/the-love-prompt-of-devesh-the-octopus/index.ar.mdx) | Light fiction pass | Improve Arabic rhythm and clarify the performed romance and decoy-coffee gag so the reveal fits. Keep the strange plot and comedy. |

## Evidence still needed for stronger experimental claims

The editorial pass checks reasoning and selected primary references. It does **not** rerun the model experiments, reproduce the external notebooks, or independently validate their datasets.

- **Circle packing:** full-precision coordinates and sum, independent feasibility checks, numerical tolerances, run budget, and a dated reference are needed before restoring a record or comparative-speed claim.
- **Vision compression:** source passages, raw outputs, model/version/settings, repeated runs, a defined error metric, and provider-reported token usage are needed. The displayed historical scores remain reported observations, not a newly validated benchmark. The Python block is an illustrative implementation, not a reproduction of those results.
- **Bandit review-ranking example:** 22 rankings of at most 14 items yield at most 2,002 pairwise constraints. The original 2,582 count needs the run log to explain larger slates, additional comparisons, or accumulated history. It has not been silently replaced by a guessed result.
- **Educational demos:** evaluator preferences and functioning controls do not establish learning. A controlled comparison with learner transfer tasks is proposed, not reported as completed.
- **Resilience model:** parameter recovery, identifiability, sensitivity, misspecification, and sampler diagnostics are proposed checks. Synthetic trajectories cannot independently establish effects in people.

Review the major rewrites for authorial intent before merging. These are editorial proposals; the qualification of a claim should remain even if Hani prefers different wording or a sharper joke.

## Validation

- Contentlayer compiled all 30 documents, including all 24 published EN/AR post versions.
- TypeScript checking passed. The production build also passed, generating 89 routes and completing the draft-isolation check.
- All 84 direct image/demo references across published posts resolve to local assets after content synchronization; the six direct article links resolve to published routes.
- The new Arabic demo’s inline JavaScript parses. Its simulation logic is inherited from the existing English averaged pairing demo; labels and direction are localized.
- Verified that removing the new Dream-project notes restores those files exactly to the base revision.
- `git diff --check` passed. Draft post sources are unchanged.
- Visual verification remains pending: the available browser could not open the local preview (`ERR_BLOCKED_BY_CLIENT`).

Contentlayer emits an existing warning because `data/posts/README.md` is not a content document and is skipped. The build also reports a Node `punycode` deprecation warning.
