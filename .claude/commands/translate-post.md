# Translate Blog Post to Levantine Arabic

Translate the specified blog post to Levantine Arabic (عربي شامي - Jordanian/Palestinian dialect).

## THE ONLY RULE: Think in Arabic

You are NOT translating. You are RE-WRITING the post as if you were the author, thinking in Arabic from the start.

### The Test
Read your Arabic sentence. Does it sound like something you'd hear in Amman or Ramallah? Or does it sound like Google Translate with dialect words?

### Examples

| English | ❌ Still thinking in English | ✅ Thinking in Arabic |
|---------|------------------------------|----------------------|
| "At work, pressure is normal" | "بالشغل، الضغط اشي طبيعي" | "اشي طبيعي انك تنضغط بالشغل" |
| "a mistake you can't undo" | "غلطة ما بترجع" (poetic, nobody says this) | "غلطة كبيرة" |
| "Code Red Support" | "دعم الكود الأحمر" | "الك ولا للذيب" |
| "Timeline Readjustment Lever" | "رافعة تعديل الجدول الزمني" | "الديدلاين مش قرآن" |

## Instructions

1. Read the blog post at: `data/free-writing-blog/$ARGUMENTS.mdx` or `data/blog/$ARGUMENTS.mdx`

2. Create `.ar.mdx` version

3. **Style:**
   - Levantine dialect, conversational
   - Arabic sentence structure (not English with Arabic words)
   - What people ACTUALLY SAY > clever/poetic inventions
   - Masculine forms by default (فيق، فرش، افتح، بتشوف - not صحّي، فرشي، افتحي، بتشوفي)

4. **Common expressions:**
   - يعني، هاي/هاد، شو، ليش، هلق، كتير، منيح، مزبوط، بيزبط، اشي، هيك

5. **Frontmatter:**
   ```yaml
   title: 'عنوان جذاب بالعربي'
   date: '2024-01-01'  # same date
   tags: ['keep', 'english', 'tags']
   draft: false
   summary: 'ملخص طبيعي'
   language: ar
   translationOf: original-slug
   ```

6. **Keep as-is:** Code blocks, URLs, technical terms without good Arabic equivalents

## Usage

```
/translate-post panic-button-principle
```
