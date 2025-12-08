# Translate Blog Post to Levantine Arabic

Translate the specified blog post to Levantine Arabic (عربي شامي - Jordanian/Palestinian dialect).

## Instructions

1. Read the blog post file at: `data/free-writing-blog/$ARGUMENTS.mdx`

2. Create a new translated file at: `data/free-writing-blog/$ARGUMENTS.ar.mdx`

3. Translation Guidelines for Levantine Arabic:
   - Use colloquial Levantine Arabic, not Modern Standard Arabic (فصحى)
   - Write naturally as a Jordanian/Palestinian would speak
   - Use common Levantine expressions and phrases
   - Maintain the author's voice and tone
   - Keep technical terms in English when there's no good Arabic equivalent
   - Use Arabic numerals (١٢٣) for numbers
   - Preserve all code blocks exactly as-is (don't translate code)
   - Keep URLs and links unchanged

4. Update the frontmatter:
   - Keep the same date
   - Translate the title naturally
   - Translate the summary
   - Add `language: ar`
   - Add `translationOf: [original-slug]`
   - Keep the same tags (in English for URL compatibility)

5. Common Levantine phrases to use:
   - "يعني" instead of "أي" (meaning)
   - "هاي" instead of "هذه" (this)
   - "شو" instead of "ما" (what)
   - "كيف" instead of "كيف" (how - same)
   - "ليش" instead of "لماذا" (why)
   - "هلق" instead of "الآن" (now)
   - "كتير" instead of "جداً" (very)
   - "منيح" instead of "جيد" (good)

## Example frontmatter for translated post:

```yaml
---
title: 'العنوان المترجم'
date: '2024-01-01'
tags: ['tag1', 'tag2']
draft: false
summary: 'ملخص المقال بالعربي الشامي'
language: ar
translationOf: original-post-slug
authors: ['default']
---
```

## Usage

```
/translate-post panic-button-principle
```

This will translate `data/free-writing-blog/panic-button-principle.mdx` and create `data/free-writing-blog/panic-button-principle.ar.mdx`
