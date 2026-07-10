interface CollisionBoardProps {
  chapter: string
  question: string
  collision: string
  epistemology: string
}

export default function CollisionBoard({
  chapter,
  question,
  collision,
  epistemology,
}: CollisionBoardProps) {
  return (
    <aside
      dir="rtl"
      className="my-7 overflow-hidden rounded-xl border border-amber-200 bg-amber-50/70 text-right shadow-sm dark:border-amber-900/70 dark:bg-amber-950/20"
    >
      <div className="flex flex-wrap items-center gap-2 border-b border-amber-200 px-5 py-3 dark:border-amber-900/70">
        <span className="rounded-full bg-amber-200/80 px-2.5 py-1 text-xs font-semibold text-amber-950 dark:bg-amber-900/70 dark:text-amber-100">
          {chapter}
        </span>
        <strong className="text-amber-950 dark:text-amber-100">لوحة الاصطدام</strong>
      </div>
      <dl className="m-0 grid gap-3 px-5 py-4 text-[0.96rem] leading-7">
        <div>
          <dt className="inline font-semibold">السؤال: </dt>
          <dd className="inline">{question}</dd>
        </div>
        <div>
          <dt className="inline font-semibold">الاصطدام: </dt>
          <dd className="inline">{collision}</dd>
        </div>
        <div className="border-t border-amber-200 pt-3 text-sm text-gray-600 dark:border-amber-900/70 dark:text-gray-300">
          <dt className="inline font-semibold">الإبستمولوجيا هون: </dt>
          <dd className="inline">{epistemology}</dd>
        </div>
      </dl>
    </aside>
  )
}
