# Translate Blog Post

Translate the specified blog post. Supports both directions:
- English → Levantine Arabic
- Arabic → English

## THE ONLY RULE: Think in the Target Language

You are NOT translating. You are RE-WRITING the post as if you were the author, thinking in the target language from the start.

## Instructions

1. Read the source post at: `data/free-writing-blog/$ARGUMENTS.mdx` (or `.ar.mdx`)

2. Determine direction from the source file's `language` field

3. Create the translated file:
   - English original → `[slug].ar.mdx`
   - Arabic original → `[slug].mdx` (remove `.ar`)

4. **Frontmatter:**
   ```yaml
   title: 'Translated title'
   date: '2024-01-01'  # same date
   tags: ['keep', 'original', 'tags']
   draft: false
   summary: 'Translated summary'
   language: [target language: en or ar]
   translationOf: [original-slug]
   originalLanguage: [source language: en or ar]
   ```

5. **Keep as-is:** Code blocks, URLs, technical terms

---

## For English → Arabic

### The Test
Does it sound like something you'd hear in Amman or Ramallah? Or like Google Translate with dialect words?

### Examples
| English | ❌ Wrong | ✅ Right |
|---------|----------|----------|
| "At work, pressure is normal" | "بالشغل، الضغط اشي طبيعي" | "اشي طبيعي انك تنضغط بالشغل" |
| "a mistake you can't undo" | "غلطة ما بترجع" | "غلطة كبيرة" |
| "Code Red Support" | "دعم الكود الأحمر" | "الك ولا للذيب" |

### Style
- Levantine dialect (عربي شامي), conversational
- Arabic sentence structure, not English with Arabic words
- What people ACTUALLY SAY > clever/poetic inventions
- Masculine forms by default (فيق، فرش، افتح، بتشوف)
- Common: يعني، هاي/هاد، شو، ليش، هلق، كتير، منيح، مزبوط، بيزبط، اشي، هيك

---

## For Arabic → English

### The Test
Does it read naturally like native English? Or like word-for-word translation?

### Style
- Natural, conversational English
- Preserve the author's voice and humor
- Adapt cultural references appropriately
- Don't over-explain Arabic concepts—translate the feeling, not just the words

---

## Usage

```
/translate-post panic-button-principle
/translate-post panic-button-principle.ar
```
