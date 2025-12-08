# Translate Blog Post to Levantine Arabic

Translate the specified blog post to Levantine Arabic (عربي شامي - Jordanian/Palestinian dialect).

## CRITICAL: Cultural Adaptation, NOT Literal Translation

**DO NOT translate literally.** This is about cultural adaptation. The goal is to write as if the post was originally written in Levantine Arabic by someone who thinks in that language and culture.

### Bad (Still thinking in English):
- "بالشغل، الضغط اشي طبيعي" (At work, pressure is normal - English structure)
- "غلطة ما بترجع" (mistake that doesn't come back - poetic but unnatural)
- "دعم الكود الأحمر" (Code Red Support - literal)

### Good (Thinking in Arabic):
- "اشي طبيعي انك تنضغط بالشغل" (natural Arabic sentence flow)
- "غلطة كبيرة" (what people actually say)
- "الك ولا للذيب" (real expression)

## Instructions

1. Read the blog post file at: `data/free-writing-blog/$ARGUMENTS.mdx` or `data/blog/$ARGUMENTS.mdx`

2. Create a new translated file with `.ar.mdx` extension

3. **Writing Style Guidelines:**
   - **THINK IN ARABIC, not English.** Sentence structure must be Arabic, not English sentences with Arabic words.
   - Conversational Levantine dialect, NOT formal/corporate Arabic
   - Dark humor and philosophical depth
   - Use what people ACTUALLY SAY, not creative translations of English idioms
   - Simple, common expressions > poetic/clever but unnatural phrases
   - **IMPORTANT: Use masculine forms by default** (Arabic convention). Don't use feminine verb forms like "صحّي، فرشي، افتحي، بتشوفي" - use masculine "فيق، فرش، افتح، بتشوف"

4. **Voice Examples - Natural Arabic Flow:**
   ```
   اشي طبيعي انك تنضغط بالشغل. بس لما الضغط يتحول لخوف من غلطة كبيرة،
   أو تحس حالك غرقان وما حدا رح يمد إيده—هون الموضوع بيتحول من تحدي لشلل.

   المفارقة؟ لما الناس تعرف إنك موجود، نادراً بتحتاجك.

   أسوأ اشي لما حدا يكمل بمشروع فاشل لأنه خايف يعترف إنه مش ماشي.
   ```

5. **Common Levantine expressions:**
   - "يعني" (I mean / meaning)
   - "هاي/هاد" (this)
   - "شو" (what)
   - "ليش" (why)
   - "هلق" (now)
   - "كتير" (very)
   - "منيح" (good)
   - "مزبوط" (right/correct)
   - "بيزبط/ما بيزبط" (works/doesn't work)
   - "اشي" (thing)
   - "هيك" (like this)

6. **Update the frontmatter:**
   - Keep the same date
   - Translate the title naturally (make it catchy, not literal)
   - Translate the summary
   - Add `language: ar`
   - Add `translationOf: [original-slug]`
   - Keep tags in English

7. **Preserve:**
   - Code blocks exactly as-is
   - URLs and links
   - Technical terms that don't have good Arabic equivalents

## Example frontmatter:

```yaml
---
title: 'زر الطوارئ اللي ما حدا بيضغطه'
date: '2024-01-01'
tags: ['leadership', 'psychology']
draft: false
summary: 'ليش مجرد وجود مخرج طوارئ بيخلي الناس تشتغل أحسن، حتى لو عمرهم ما استخدموه.'
language: ar
translationOf: panic-button-principle
---
```

## Usage

```
/translate-post panic-button-principle
```
