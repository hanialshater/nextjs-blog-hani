import fs from 'node:fs/promises'
import path from 'node:path'

// Synthetic text only: public CI never needs the private manuscript or token.
export async function makeBookFixture(directory) {
  await fs.mkdir(directory, { recursive: true })
  const revision = '0123456789abcdef'
  const parts = [1, 2, 3, 4].map((number) => ({
    number,
    title: { en: `Part ${number}`, ar: `الجزء ${number}` },
  }))
  const manifest = { schema: 1, revision, title: { en: 'The Dream', ar: 'الحلم' }, parts }
  await fs.writeFile(path.join(directory, 'manifest.json'), JSON.stringify(manifest))
  const sourceIDs = [
    1,
    2,
    3,
    4,
    5,
    9,
    8,
    10,
    7,
    6,
    11,
    12,
    13,
    15,
    16,
    17,
    19,
    14,
    18,
    20,
    21,
    ...Array.from({ length: 17 }, (_, i) => i + 22),
    ...Array.from({ length: 17 }, (_, i) => i + 40),
  ]
  const labs = {
    10: 'descent',
    11: 'russell',
    17: 'bayes',
    20: 'coding',
    22: 'turing',
    25: 'circuits',
    29: 'feedback',
    34: 'monte-carlo',
  }
  for (const locale of ['ar', 'en'])
    for (let part = 1; part <= 4; part++) {
      const chapters = sourceIDs.flatMap((source, i) => {
        const number = i + 1
        const chapterPart = number <= 4 ? 1 : number <= 21 ? 2 : number <= 40 ? 3 : 4
        if (chapterPart !== part) return []
        const id = `chapter-${String(source).padStart(2, '0')}`
        const passage = `${id}-p-fixture`
        const text = `${locale === 'ar' ? 'فقرة اصطناعية لاختبار القراءة.' : 'A synthetic paragraph for reader verification.'} PRIVATE_BOOK_SENTINEL ${source}`
        const content = [
          `jsx('p', {id:${JSON.stringify(passage)},'data-passage':${JSON.stringify(passage)},children:${JSON.stringify(text)}})`,
          ...Array.from(
            { length: 3 },
            () => `jsx('p',{children:${JSON.stringify(text.repeat(8))}})`
          ),
          ...(labs[source]
            ? [
                `jsx(c.TechnicalNote,{title:'Worked example',children:jsx(c.BookLab,{kind:${JSON.stringify(labs[source])},locale:${JSON.stringify(locale)}})})`,
              ]
            : []),
        ]
        return [
          {
            id,
            number,
            title: `${locale === 'ar' ? 'الفصل' : 'Chapter'} ${number}`,
            words: 200,
            passages: { [passage]: text },
            code: `const {jsx,jsxs}=arguments[0];return {default:({components:c})=>jsxs('div',{children:[${content.join(',')}]})}`,
          },
        ]
      })
      await fs.writeFile(
        path.join(directory, `part-${part}.${locale}.json`),
        JSON.stringify({
          schema: 1,
          revision,
          locale,
          part,
          title: parts[part - 1].title[locale],
          chapters,
        })
      )
    }
}
