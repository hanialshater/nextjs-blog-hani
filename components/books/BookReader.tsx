'use client'

import { memo, useEffect, useMemo, useRef, useState } from 'react'
import * as runtime from 'react/jsx-runtime'
import type { ComponentType } from 'react'
import { components } from '@/components/MDXComponents'
import BookLab from './BookLab'
import { BOOK_ROOT, feedbackCategories } from '@/lib/books/types'
import type { BookChapter, BookManifest, BookPart, FeedbackCategory } from '@/lib/books/types'

type ReaderChapter = Omit<BookChapter, 'passages'>
type ReaderPart = Omit<BookPart, 'chapters'> & { chapters: ReaderChapter[] }
type Position = { part: number; chapter: string; passage: string; revision: string }
type Note = {
  chapter: string
  passage: string
  quote: string
  comment: string
  category: FeedbackCategory
  submission: string
}

const words = {
  en: {
    draft: 'Working draft',
    parts: 'Parts',
    chapters: 'Chapters in this part',
    language: 'العربية',
    feedback: 'Leave a note',
    resume: 'Continue where I stopped',
    hint: 'Select a passage, then leave a note. You can also comment on a whole chapter.',
    noteTitle: 'Help shape the next draft',
    category: 'What did you notice?',
    categories: [
      'I lost the thread',
      'I need an example',
      'A claim needs correcting',
      'This pulled me in',
      'Something else',
    ],
    comment: 'Your note',
    placeholder: 'What happened while you were reading? What would help?',
    quote: 'Selected passage',
    noQuote: 'Commenting on the chapter',
    submit: 'Send privately to Hani',
    download: 'Download this note',
    downloaded: 'Your note was downloaded. It has not been sent to Hani.',
    localOnly: 'Your note stays in this browser. Download it to share with Hani.',
    allDrafts: 'All drafts',
    sending: 'Sending…',
    close: 'Close',
    saved: 'Your note was saved for Hani. Thank you.',
    failed: 'Your note was not sent. It remains on this device; you can try again.',
    stale: 'The edition has changed. Your note remains on this device. Copy it before reloading.',
    local:
      'Unsent notes and your reading position stay in this browser. Submitted notes go to Hani’s private review inbox.',
    next: 'Next part',
    previous: 'Previous part',
    revision: 'Revision',
    skip: 'Go to the text',
    minutes: 'min reading, plus experiments',
  },
  ar: {
    draft: 'مسوّدة قيد العمل',
    parts: 'الأجزاء',
    chapters: 'فصول هذا الجزء',
    language: 'English',
    feedback: 'اترك ملاحظة',
    resume: 'كمّل من المكان اللي وقفت فيه',
    hint: 'حدّد فقرة وبعدين اترك ملاحظة. وبتقدر تعلّق على الفصل كله.',
    noteTitle: 'ساعدني أحسّن المسوّدة الجاية',
    category: 'شو لاحظت؟',
    categories: [
      'ضيّعت خيط الحكاية',
      'بحتاج مثال',
      'في ادعاء بحاجة لتصحيح',
      'هذا المقطع شدّني',
      'إشي ثاني',
    ],
    comment: 'ملاحظتك',
    placeholder: 'شو صار معك وإنت بتقرأ؟ وشو ممكن يساعد؟',
    quote: 'المقطع المحدّد',
    noQuote: 'تعليق على الفصل',
    submit: 'ابعث الملاحظة لهاني بشكل خاص',
    download: 'نزّل الملاحظة',
    downloaded: 'نزلت الملاحظة كملف. لسه ما انبعتت لهاني.',
    localOnly: 'ملاحظتك بتضل بهالمتصفح. نزّلها كملف عشان تبعثها لهاني.',
    allDrafts: 'كل المسودات',
    sending: 'عم تنبعت…',
    close: 'إغلاق',
    saved: 'وصلت ملاحظتك لهاني. شكراً.',
    failed: 'الملاحظة ما انبعتت. ضلّت محفوظة على هذا الجهاز؛ بتقدر تحاول مرة ثانية.',
    stale: 'الطبعة تغيّرت. ملاحظتك لسه على هذا الجهاز. انسخها قبل ما تحدّث الصفحة.',
    local:
      'مكان القراءة والملاحظات اللي ما انبعتت بتضل بهالمتصفح. الملاحظات المرسلة بتوصل لصندوق مراجعة خاص بهاني.',
    next: 'الجزء الجاي',
    previous: 'الجزء السابق',
    revision: 'نسخة',
    skip: 'انتقل للنص',
    minutes: 'دقيقة قراءة، غير التجارب',
  },
}

const Chapter = memo(function Chapter({ chapter }: { chapter: ReaderChapter }) {
  // Only compiled output from the author's checked-in reading edition reaches
  // this renderer. Never accept MDX/code from readers or feedback submissions.
  const Content = useMemo(
    () =>
      (
        new Function(chapter.code)(runtime) as {
          default: ComponentType<{ components: typeof components }>
        }
      ).default,
    [chapter.code]
  )
  return (
    <article
      id={chapter.id}
      data-chapter={chapter.id}
      className="book-chapter reading-prose prose dark:prose-invert"
    >
      <h2>{chapter.title}</h2>
      <Content components={{ ...components, BookLab }} />
    </article>
  )
})

export default function BookReader({
  manifest,
  edition,
  feedbackEnabled = false,
}: {
  manifest: BookManifest
  edition: ReaderPart
  feedbackEnabled?: boolean
}) {
  const { locale, part, revision, chapters } = edition
  const t = words[locale]
  const otherLocale = locale === 'ar' ? 'en' : 'ar'
  const [current, setCurrent] = useState(chapters[0].id)
  const [position, setPosition] = useState<Position | null>(null)
  const [note, setNote] = useState<Note | null>(null)
  const [status, setStatus] = useState<
    'idle' | 'sending' | 'saved' | 'failed' | 'stale' | 'downloaded'
  >('idle')
  const dialog = useRef<HTMLDialogElement>(null)
  const articleRoot = useRef<HTMLElement>(null)
  const saveKey = `dream:position:${locale}`
  const noteKey = `dream:unsent:${locale}:${part}`

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(saveKey) || 'null')
      if (saved && /^[a-z0-9-]+$/.test(saved.chapter) && saved.part >= 1 && saved.part <= 4)
        setPosition(saved)
    } catch {
      /* Storage can be unavailable in private browsing. */
    }
    let timer: ReturnType<typeof setTimeout> | undefined
    const followHash = () => {
      let id: string
      try {
        id = decodeURIComponent(window.location.hash.slice(1))
      } catch {
        return
      }
      const target = document.getElementById(id)
      const article = target?.closest<HTMLElement>('[data-chapter]')
      if (!article) return
      setCurrent(article.id)
      try {
        localStorage.setItem(
          saveKey,
          JSON.stringify({
            part,
            chapter: article.id,
            passage: target?.hasAttribute('data-passage') ? id : '',
            revision,
          })
        )
      } catch {
        /* Optional. */
      }
    }
    const track = () => {
      clearTimeout(timer)
      timer = setTimeout(() => {
        const articles = Array.from(
          articleRoot.current?.querySelectorAll<HTMLElement>('[data-chapter]') || []
        )
        const active =
          articles.filter((a) => a.getBoundingClientRect().top <= 180).at(-1) || articles[0]
        if (!active) return
        setCurrent(active.id)
        const passages = Array.from(active.querySelectorAll<HTMLElement>('[data-passage]'))
        const passage =
          passages.filter((p) => p.getBoundingClientRect().top <= 180).at(-1)?.id || ''
        try {
          localStorage.setItem(
            saveKey,
            JSON.stringify({ part, chapter: active.id, passage, revision })
          )
        } catch {
          /* Optional. */
        }
      }, 200)
    }
    window.addEventListener('scroll', track, { passive: true })
    window.addEventListener('hashchange', followHash)
    followHash()
    return () => {
      clearTimeout(timer)
      window.removeEventListener('scroll', track)
      window.removeEventListener('hashchange', followHash)
    }
  }, [part, revision, saveKey])

  useEffect(() => {
    if (note) {
      if (!dialog.current?.open) dialog.current?.showModal()
      if (status !== 'saved') {
        try {
          localStorage.setItem(noteKey, JSON.stringify({ ...note, revision }))
        } catch {
          /* Optional. */
        }
      }
    } else dialog.current?.close()
  }, [note, noteKey, revision, status])

  function openNote() {
    const selection = window.getSelection()
    const anchor = selection?.anchorNode
    const element = anchor instanceof Element ? anchor : anchor?.parentElement
    const selectedArticle = element?.closest<HTMLElement>('[data-chapter]')
    const selectedPassage = element?.closest<HTMLElement>('[data-passage]')
    const quote = selectedArticle ? (selection?.toString() || '').trim().slice(0, 1200) : ''
    let initial: Note = {
      chapter: selectedArticle?.id || current,
      passage: quote ? selectedPassage?.id || '' : '',
      quote,
      comment: '',
      category: 'other',
      submission: crypto.randomUUID(),
    }
    if (!quote) {
      try {
        const unsent = JSON.parse(localStorage.getItem(noteKey) || 'null')
        if (unsent?.revision === revision && chapters.some((c) => c.id === unsent.chapter))
          initial = unsent
      } catch {
        /* Optional. */
      }
    }
    setStatus('idle')
    setNote(initial)
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    if (!note || status === 'sending') return
    if (!feedbackEnabled) {
      const url = URL.createObjectURL(
        new Blob([JSON.stringify({ ...note, locale, part, revision }, null, 2)], {
          type: 'application/json',
        })
      )
      const link = document.createElement('a')
      link.href = url
      link.download = `dream-note-${locale}-${note.chapter}-${note.submission}.json`
      link.click()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
      setStatus('downloaded')
      return
    }
    setStatus('sending')
    try {
      const response = await fetch(`${BOOK_ROOT}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...note, locale, part, revision }),
      })
      if (!response.ok) {
        setStatus(response.status === 409 ? 'stale' : 'failed')
        return
      }
      setStatus('saved')
      try {
        localStorage.removeItem(noteKey)
      } catch {
        /* Optional. */
      }
    } catch {
      setStatus('failed')
    }
  }

  return (
    <>
      <a className="book-skip" href="#book-text">
        {t.skip}
      </a>
      <header className="book-toolbar">
        <a href={`${BOOK_ROOT}/${locale}/part-1`}>{manifest.title[locale]}</a>
        <span className="book-draft-label">{t.draft}</span>
        <a
          href={`${BOOK_ROOT}/${otherLocale}/part-${part}#${current}`}
          lang={otherLocale}
          hrefLang={otherLocale}
        >
          {t.language}
        </a>
        <button type="button" onClick={openNote}>
          {t.feedback}
        </button>
      </header>
      <div className="book-shell">
        <aside className="book-sidebar">
          <a href={`/drafts/${locale}`} className="book-small">
            {t.allDrafts}
          </a>
          <nav aria-label={t.parts}>
            <ol>
              {manifest.parts.map((p) => (
                <li key={p.number}>
                  <a
                    href={`${BOOK_ROOT}/${locale}/part-${p.number}`}
                    aria-current={part === p.number ? 'page' : undefined}
                  >
                    <span>{p.number.toString().padStart(2, '0')}</span> {p.title[locale]}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
          <details className="book-chapter-menu" open>
            <summary>{t.chapters}</summary>
            <nav aria-label={t.chapters}>
              {chapters.map((c) => (
                <a
                  key={c.id}
                  href={`#${c.id}`}
                  aria-current={current === c.id ? 'location' : undefined}
                >
                  {c.title}
                </a>
              ))}
            </nav>
          </details>
          {position && (
            <a
              className="book-resume"
              href={`${BOOK_ROOT}/${locale}/part-${position.part}#${position.revision === revision && position.passage ? position.passage : position.chapter}`}
            >
              {t.resume}
            </a>
          )}
          <p className="book-small">{t.hint}</p>
        </aside>
        <main id="book-text" ref={articleRoot} className="book-text">
          <div className="book-part-heading">
            <span className="book-part-number">{part.toString().padStart(2, '0')}</span>
            <p>
              {t.draft} · {t.revision} <bdi>{revision.slice(0, 8)}</bdi>
            </p>
            <h1>{edition.title}</h1>
            <p>
              {Math.ceil(
                chapters.reduce((sum, c) => sum + c.words, 0) / (locale === 'ar' ? 180 : 220)
              )}{' '}
              {t.minutes}
            </p>
          </div>
          {chapters.map((chapter) => (
            <Chapter key={chapter.id} chapter={chapter} />
          ))}
          <nav className="book-part-links" aria-label={t.parts}>
            {part > 1 && <a href={`${BOOK_ROOT}/${locale}/part-${part - 1}`}>{t.previous}</a>}
            {part < 4 && <a href={`${BOOK_ROOT}/${locale}/part-${part + 1}`}>{t.next}</a>}
          </nav>
        </main>
      </div>
      <dialog ref={dialog} className="book-feedback" onCancel={() => setNote(null)}>
        {note && (
          <form onSubmit={submit}>
            <div className="book-feedback-heading">
              <h2>{t.noteTitle}</h2>
              <button type="button" onClick={() => setNote(null)}>
                {t.close}
              </button>
            </div>
            <p className="book-small">{chapters.find((c) => c.id === note.chapter)?.title}</p>
            {note.quote ? (
              <blockquote>
                <span>{t.quote}</span>
                <p>{note.quote}</p>
              </blockquote>
            ) : (
              <p>{t.noQuote}</p>
            )}
            <label htmlFor="book-category">{t.category}</label>
            <select
              id="book-category"
              value={note.category}
              disabled={status === 'saved' || status === 'sending'}
              onChange={(e) => setNote({ ...note, category: e.target.value as FeedbackCategory })}
            >
              {feedbackCategories.map((category, index) => (
                <option value={category} key={category}>
                  {t.categories[index]}
                </option>
              ))}
            </select>
            <label htmlFor="book-comment">{t.comment}</label>
            <textarea
              id="book-comment"
              value={note.comment}
              required
              minLength={3}
              maxLength={4000}
              rows={5}
              placeholder={t.placeholder}
              disabled={status === 'saved' || status === 'sending'}
              onChange={(e) => setNote({ ...note, comment: e.target.value })}
            />
            <p className="book-small">{feedbackEnabled ? t.local : t.localOnly}</p>
            {status !== 'idle' && status !== 'sending' && <p role="status">{t[status]}</p>}
            <button
              className="book-submit"
              disabled={status === 'sending' || status === 'saved'}
              type="submit"
            >
              {status === 'sending' ? t.sending : feedbackEnabled ? t.submit : t.download}
            </button>
          </form>
        )}
      </dialog>
    </>
  )
}
