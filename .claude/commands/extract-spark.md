# Extract Spark from Blog Post

Extract a notable idea, quote, or provocation from a blog post and save it as a localized spark.

## Process

1. Read the specified blog post (or use the currently open file)
2. Identify 1-3 powerful, quotable ideas that:
   - Are thought-provoking or counterintuitive
   - Stand alone without context
   - Represent a key insight from the post
3. For each idea, create a new JSON file in `content-sparks/`

## Spark Format

Create a JSON file at `content-sparks/{id}.json`:

```json
{
  "id": "unique-slug",
  "text": {
    "en": "The English quote...",
    "ar": "الترجمة العربية..."
  },
  "source": "blog-post-slug"
}
```

## Guidelines

- Keep quotes concise (1-2 sentences max)
- The quote should be impactful when read in isolation
- Translate to Arabic preserving the tone and meaning
- Use a descriptive id that hints at the content
- Link to the source blog post slug

## Usage

```
/extract-spark data/free-writing-blog/my-post.mdx
```

Or with the file already open, just run `/extract-spark` to extract from the current context.
