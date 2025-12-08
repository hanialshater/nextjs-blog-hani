# Translate Blog Post to Levantine Arabic

Translate the specified blog post to Levantine Arabic (عربي شامي - Jordanian/Palestinian dialect).

## CRITICAL: Cultural Adaptation, NOT Literal Translation

**DO NOT translate literally.** This is about cultural adaptation. The goal is to write as if the post was originally written in Levantine Arabic by someone who thinks in that language and culture.

### Bad (Literal):
- "دعم الكود الأحمر" (Code Red Support)
- "رافعة تعديل الجدول الزمني" (Timeline Readjustment Lever)

### Good (Cultural):
- "الك ولا للذيب" (you've got backup)
- "الديدلاين مش قرآن" (deadlines aren't sacred)

## Instructions

1. Read the blog post file at: `data/free-writing-blog/$ARGUMENTS.mdx` or `data/blog/$ARGUMENTS.mdx`

2. Create a new translated file with `.ar.mdx` extension

3. **Writing Style Guidelines:**
   - Conversational Levantine dialect, NOT formal/corporate Arabic
   - Dark humor and philosophical depth
   - Real-world cultural references (not Western corporate jargon)
   - Natural flow as if talking to a friend
   - Use expressions people actually say
   - When a concept doesn't have a cultural equivalent, explain it naturally instead of inventing awkward translations

4. **Voice Examples from the Author:**
   ```
   بالشغل، الضغط اشي طبيعي. بس لما الضغط بيتحول لخوف من غلطة ما بترجع،
   أو إحساس إنك غرقان وما في حدا رح يمد إيده، الموضوع بيتحول من تحدي لشلل.

   المفارقة؟ لما الناس بتعرف إنك موجود، نادراً بتحتاجك.
   مجرد المعرفة بتشيل نص القلق.

   أسوأ اشي لما الناس تكمل بمشروع فاشل لأنها خايفة تعترف إنه مش ماشي.
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
