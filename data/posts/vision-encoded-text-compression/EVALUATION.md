# Evaluation: "Vision-Encoded Text Compression"

_Independent review of `index.mdx`, conducted 2026-07-06. Method: source review, direct
reproduction (reading the actual compressed images with an off-the-shelf VLM), token-billing
verification against provider docs, and a local build + Chromium render of the page._

## Verdict

The core phenomenon is real and reproducible, but the headline claim — **8× / 87% token
savings on Gemini** — rests on a token-accounting error: it applies **Claude's** image-token
formula to **Gemini**, which does not bill images that way. The realistic saving on Gemini is
roughly **20%**, not 87%. There is also a live Markdown formatting bug on the page.

## What holds up (verified by reproduction)

- **Readability**: The 800×38 px image (8px Verdana, Y-scale 0.6) was transcribed
  near-perfectly by a general-purpose VLM with no OCR fine-tuning, tested on a 3× upscale
  (upscaling adds no information, so the information genuinely survives the compression).
  The second image (news_f8, 800×43) reads just as cleanly.
- **Pipeline**: The Playwright + Pillow rendering code is sound and matches the shipped images.
- **DeepSeek-OCR characterization** (~97% @ 10×, 7–20× range, custom 3B VLM) matches the paper.
- The Methodology Notes disclaimer is honest about the small scale.

## Critical flaw: the 40-token number is not real on Gemini

- `tokens = (width × height) / 750` is **Anthropic's Claude formula**
  (https://docs.anthropic.com/en/docs/build-with-claude/vision).
- Gemini 2.0/2.5 bills a **flat 258 tokens** for images ≤384×384 px, and 258 tokens per
  768×768 tile for larger images (https://ai.google.dev/gemini-api/docs/tokens,
  https://ai.google.dev/gemini-api/docs/image-understanding).
- So the celebrated image costs **≥258 tokens on Gemini** vs 321 tokens of plain text:
  ~**20% saving, not 87%**.
- Tokens were _calculated_, never _measured_ — the API's `usageMetadata.promptTokenCount`
  would have shown this immediately.
- The irony: **Claude** would bill ~40 tokens for this image but (per the post's own table)
  cannot read 8px text; **Gemini** can read it but does not bill 40 tokens. The two halves of
  the claim come from different providers and cannot be combined.

**Fix**: re-run one call, report measured prompt tokens, and reframe: "text-as-image is
surprisingly readable to off-the-shelf VLMs; on Claude's billing model this _would_ be 8× if
Claude could read it; on Gemini it is ~20% today."

## Internal inconsistencies

1. **Arithmetic**: "800×30px = 24,000 pixels / 750 = 40 tokens" — 24,000/750 = **32**.
   The actual image is 800×**38** px (→ 40.5), so the stated dimensions are wrong but the
   answer accidentally matches the real file.
2. **Example 1**: the news image is 800×43 → 45.9 tokens by the post's own formula, but the
   post says 53.
3. **Non-monotonic quality cliff**: 99.4% (Y=0.8) → 55.0% (Y=0.7) → 99.5% (Y=0.6). A dip that
   recovers is a red flag for single-run noise or a resampling/aliasing artifact at fractional
   pixel heights; it needs repeated runs before being presented as a "sweet spot".
4. **"Gemini's vision model is 4× better"**: 14px vs 8px is 1.75× linear (~3× by area); the
   4× figure comes from the token ratio, which inherits the billing error.

## Methodological gap

Accuracy is measured only as _transcription fidelity_. The proposed use case is sending
prompts as images, so the untested question is **downstream task quality** (summarization,
QA, reasoning) over vision-encoded text. 99.5% OCR accuracy does not imply equal reasoning
performance.

## Presentation (local build + Chromium)

- **Formatting bug (visible on the live page)**: at `index.mdx:190` the `---` sits directly
  under the closing paragraph with no blank line, so Markdown parses it as a setext underline
  and _"No custom models, no infrastructure, no training. Just render, compress, and send."_
  renders as a giant H2 heading. One blank line fixes it.
- **Frontmatter summary typos** (`index.mdx:7`): "revolutary" → "revolutionary",
  "achive" → "achieve". This string is the SEO/social-preview description.
- Otherwise the page renders well: tables, both images, and the Arabic-version link all work.

## Recommended changes (not applied)

1. Measure real Gemini prompt tokens and correct the savings claim throughout (results table,
   DeepSeek comparison, Claude-vs-Gemini table, "You Can Use This Today").
2. Re-run the Y-scale ablation with multiple samples; explain or remove the 0.7 anomaly.
3. Add one downstream-task experiment (e.g. summarize from the image vs from text).
4. Fix the `---` blank-line bug and the summary typos.
