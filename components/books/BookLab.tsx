'use client'

import { useState } from 'react'

type Locale = 'ar' | 'en'
type LabKind =
  | 'russell'
  | 'coding'
  | 'turing'
  | 'circuits'
  | 'feedback'
  | 'descent'
  | 'monte-carlo'
  | 'bayes'
type Props = { kind: LabKind; locale?: Locale }
const pick = (locale: Locale, en: string, ar: string) => (locale === 'ar' ? ar : en)
const format = (value: number, places = 4) =>
  Number.isFinite(value) ? Number(value.toFixed(places)).toString() : '∞'

function Russell({ locale }: { locale: Locale }) {
  const [inside, setInside] = useState<boolean | null>(null)
  return (
    <>
      <p>
        {pick(
          locale,
          'R contains exactly the sets that do not contain themselves. Does R contain itself?',
          'المجموعة R بتضم بالضبط المجموعات اللي ما بتضم حالها. هل R بتضم حالها؟'
        )}
      </p>
      <p className="lab-code">x ∈ R ⇔ x ∉ x</p>
      <button onClick={() => setInside(true)}>{pick(locale, 'Assume yes', 'افترض نعم')}</button>
      <button onClick={() => setInside(false)}>{pick(locale, 'Assume no', 'افترض لا')}</button>
      {inside !== null && (
        <output aria-live="polite">
          {inside
            ? pick(
                locale,
                'Assume R ∈ R. The membership rule then requires R ∉ R. Contradiction.',
                'افترض R ∈ R. قاعدة العضوية بتطلب إذن R ∉ R. تناقض.'
              )
            : pick(
                locale,
                'Assume R ∉ R. R now meets its own membership rule, so R ∈ R. Contradiction.',
                'افترض R ∉ R. هيك R بتحقق شرط العضوية تبعها، فبصير R ∈ R. تناقض.'
              )}
        </output>
      )}
      <p className="lab-caption">
        {pick(
          locale,
          'Both choices fail under this unrestricted set-building rule. This does not show that every formal system is contradictory.',
          'الاختياران بفشلوا مع قاعدة بناء المجموعات هاي بلا قيود. هذا مش دليل إن كل نظام رسمي متناقض.'
        )}
      </p>
    </>
  )
}

function Coding({ locale }: { locale: Locale }) {
  const [sequence, setSequence] = useState('1,2,1')
  const values = sequence.split(',').map(Number)
  const primes = [
    BigInt(2),
    BigInt(3),
    BigInt(5),
    BigInt(7),
    BigInt(11),
    BigInt(13),
    BigInt(17),
    BigInt(19),
    BigInt(23),
  ]
  const code = values.reduce(
    (product, exponent, i) =>
      product * Array.from({ length: exponent }).reduce<bigint>((n) => n * primes[i], BigInt(1)),
    BigInt(1)
  )
  const [decoded, setDecoded] = useState(false)
  let remaining = code
  const recovered = values.map((_, i) => {
    let exponent = 0
    while (remaining % primes[i] === BigInt(0)) {
      remaining /= primes[i]
      exponent++
    }
    return exponent
  })
  return (
    <>
      <p>
        {pick(
          locale,
          'Give each symbol a positive integer. Use successive primes to remember the order.',
          'اعطِ كل رمز رقماً موجباً. واستعمل الأعداد الأولية بالترتيب عشان تحفظ ترتيب الرموز.'
        )}
      </p>
      <label>
        {pick(locale, 'Sequence of symbol codes', 'سلسلة أرقام الرموز')}
        <select
          value={sequence}
          onChange={(event) => {
            setSequence(event.target.value)
            setDecoded(false)
          }}
          dir="ltr"
        >
          <option>1,2,1</option>
          <option>2,1,1</option>
          <option>2,3,1,4,5,2,3,1,4</option>
        </select>
      </label>
      <output className="lab-code" aria-live="polite">
        {values.map((v, i) => `${primes[i]}^${v}`).join(' × ')} = {code.toString()}
      </output>
      <button onClick={() => setDecoded(true)}>
        {pick(locale, 'Decode by factorization', 'فك الترميز بالتحليل لعوامل')}
      </button>
      {decoded && (
        <output aria-live="polite" className="lab-code">
          {code.toString()} → [{recovered.join(', ')}]
        </output>
      )}
      <p className="lab-caption">
        {pick(
          locale,
          'This is a small encoding demonstration, not Gödel’s original numbering and not the incompleteness proof. A code can represent an ill-formed string too.',
          'هذا مثال صغير للترميز، مش ترقيم غودل الأصلي ولا برهان عدم الاكتمال. وحتى سلسلة رموز مش سليمة نحوياً إلها ترميز.'
        )}
      </p>
    </>
  )
}

function Turing({ locale }: { locale: Locale }) {
  const [length, setLength] = useState(3)
  const [program, setProgram] = useState('increment')
  const [tape, setTape] = useState<string[]>(['1', '1', '1', '□', '□', '□', '□', '□'])
  const [head, setHead] = useState(0)
  const [steps, setSteps] = useState(0)
  const [halted, setHalted] = useState(false)
  function reset(n = length) {
    setTape(Array.from({ length: 10 }, (_, i) => (i < n ? '1' : '□')))
    setHead(0)
    setSteps(0)
    setHalted(false)
  }
  function step() {
    if (halted || steps >= 40) return
    setSteps(steps + 1)
    if (program === 'loop') {
      setHead(head === 0 ? 1 : 0)
      return
    }
    if (tape[head] === '1') {
      setHead(head + 1)
      return
    }
    const next = [...tape]
    next[head] = '1'
    setTape(next)
    setHalted(true)
  }
  return (
    <>
      <label>
        {pick(locale, 'Input in unary', 'العدد بترميز أحادي')}: {length}
        <input
          type="range"
          min={0}
          max={6}
          value={length}
          onChange={(e) => {
            const n = Number(e.target.value)
            setLength(n)
            reset(n)
          }}
        />
      </label>
      <label>
        {pick(locale, 'Program', 'البرنامج')}
        <select
          value={program}
          onChange={(e) => {
            setProgram(e.target.value)
            reset()
          }}
        >
          <option value="increment">{pick(locale, 'Add one', 'زيد واحد')}</option>
          <option value="loop">
            {pick(locale, 'Oscillate forever', 'تحرّك رايح جاي بلا توقف')}
          </option>
        </select>
      </label>
      <p className="lab-code">
        {program === 'increment'
          ? '(scan,1) → (1,R,scan); (scan,□) → (1,S,halt)'
          : '(right,s) → (s,R,left); (left,s) → (s,L,right)'}
      </p>
      <div
        className="lab-tape"
        aria-label={pick(
          locale,
          'Tape; the highlighted cell is under the head',
          'الشريط؛ الخانة الملوّنة تحت الرأس'
        )}
      >
        {tape.map((symbol, i) => (
          <span key={i} aria-current={i === head}>
            {symbol}
          </span>
        ))}
      </div>
      <button onClick={step} disabled={halted || steps >= 40}>
        {pick(locale, 'One step', 'خطوة وحدة')}
      </button>
      <button onClick={() => reset()}>{pick(locale, 'Restart', 'من الأول')}</button>
      <output aria-live="polite">
        {pick(locale, 'Steps', 'الخطوات')}: {steps} · {pick(locale, 'Head position', 'موقع الرأس')}:{' '}
        {head} · {halted ? pick(locale, 'HALTED', 'توقّفت') : pick(locale, 'RUNNING', 'بتشتغل')}
        {halted && (
          <>
            {' '}
            · {pick(locale, 'Output', 'الناتج')}: {tape.filter((s) => s === '1').length}
          </>
        )}
      </output>
      <p className="lab-caption">
        {pick(
          locale,
          '□ is blank; R/L move the head, S leaves it in place. The two-state oscillating program has no halt transition. The 40-step UI limit alone would not prove that an unknown program runs forever.',
          'الرمز □ خانة فاضية؛ R وL بتحرّك الرأس، وS بتخلّيه مكانه. البرنامج المتذبذب ما فيه انتقال لحالة توقف. حدّ الواجهة، 40 خطوة، لحاله ما بثبت إن برنامجاً مجهولاً رح يضل شغّال للأبد.'
        )}
      </p>
    </>
  )
}

function Circuits({ locale }: { locale: Locale }) {
  const [a, setA] = useState(false)
  const [b, setB] = useState(false)
  const sum = Number(a !== b)
  const carry = Number(a && b)
  return (
    <>
      <p>
        {pick(
          locale,
          'Flip the input switches. The same two bits feed three different logical rules.',
          'اقلب مفتاحَي الإدخال. نفس البتّين بيفوتوا على ثلاث قواعد منطقية مختلفة.'
        )}
      </p>
      <div className="lab-bits" dir="ltr">
        <button aria-pressed={a} onClick={() => setA(!a)}>
          A = {Number(a)}
        </button>
        <button aria-pressed={b} onClick={() => setB(!b)}>
          B = {Number(b)}
        </button>
      </div>
      <output aria-live="polite" className="lab-code">
        AND = {carry} · OR = {Number(a || b)} · XOR = {sum}
        <br />
        {Number(a)} + {Number(b)} = {carry}
        {sum}₂ = {2 * carry + sum}₁₀
      </output>
      <table dir="ltr">
        <caption>{pick(locale, 'Half-adder truth table', 'جدول الحقيقة لنصف جامع')}</caption>
        <thead>
          <tr>
            <th>A</th>
            <th>B</th>
            <th>SUM (XOR)</th>
            <th>CARRY (AND)</th>
          </tr>
        </thead>
        <tbody>
          {[0, 1].flatMap((x) =>
            [0, 1].map((y) => (
              <tr
                key={`${x}${y}`}
                style={{ background: Number(a) === x && Number(b) === y ? '#d9ba7b55' : undefined }}
              >
                <td>{x}</td>
                <td>{y}</td>
                <td>{x ^ y}</td>
                <td>{x & y}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <p className="lab-caption">
        {pick(
          locale,
          'This is a half adder: it has no carry-in. A full adder also accepts a carry from the previous column.',
          'هذا نصف جامع: ما بستقبل حمل من الخانة السابقة. الجامع الكامل بستقبل هذا الحمل كمان.'
        )}
      </p>
    </>
  )
}

function Trace({ values, target, label }: { values: number[]; target: number; label: string }) {
  const minimum = Math.min(0, target, ...values)
  const maximum = Math.max(1, target, ...values)
  const y = (v: number) => 145 - (130 * (v - minimum)) / (maximum - minimum || 1)
  const points = values
    .map((value, index) => `${15 + (390 * index) / Math.max(1, values.length - 1)},${y(value)}`)
    .join(' ')
  return (
    <svg role="img" aria-label={label} viewBox="0 0 420 165">
      <line x1="15" x2="405" y1={y(target)} y2={y(target)} stroke="#a69b89" strokeDasharray="5 4" />
      <polyline points={points} fill="none" stroke="#a27132" strokeWidth="2.5" />
      {values.map((value, i) => (
        <circle
          key={i}
          cx={15 + (390 * i) / Math.max(1, values.length - 1)}
          cy={y(value)}
          r={3}
          fill="#a27132"
        />
      ))}
    </svg>
  )
}

function Feedback({ locale }: { locale: Locale }) {
  const [gain, setGain] = useState(0.5)
  const [delay, setDelay] = useState(0)
  const [values, setValues] = useState([0])
  function step() {
    if (values.length > 40) return
    const measured = values[Math.max(0, values.length - 1 - delay)]
    setValues([...values, values[values.length - 1] + gain * (10 - measured)])
  }
  return (
    <>
      <p className="lab-code">x[t+1] = x[t] + k × (10 − x[t−d]); x[t≤0] = 0</p>
      <label>
        {pick(locale, 'Correction strength k', 'قوة التصحيح k')}: {gain}
        <input
          type="range"
          min={0.1}
          max={2.2}
          step={0.1}
          value={gain}
          onChange={(e) => {
            setGain(Number(e.target.value))
            setValues([0])
          }}
        />
      </label>
      <label>
        {pick(locale, 'Measurement delay d', 'تأخير القياس d')}: {delay}
        <input
          type="range"
          min={0}
          max={3}
          step={1}
          value={delay}
          onChange={(e) => {
            setDelay(Number(e.target.value))
            setValues([0])
          }}
        />
      </label>
      <button onClick={step} disabled={values.length > 40}>
        {pick(locale, 'Apply one correction', 'طبّق تصحيح واحد')}
      </button>
      <button onClick={() => setValues([0])}>{pick(locale, 'Restart', 'من الأول')}</button>
      <Trace
        values={values}
        target={10}
        label={pick(
          locale,
          'State after each correction; dashed target is 10',
          'قيمة الحالة بعد كل تصحيح؛ خط الهدف المتقطّع عند 10'
        )}
      />
      <output aria-live="polite">
        {pick(locale, 'Step', 'الخطوة')}: {values.length - 1} · x = {format(values.at(-1)!)} ·{' '}
        {pick(locale, 'Error', 'الخطأ')} = {format(10 - values.at(-1)!)}
      </output>
      <details>
        <summary>{pick(locale, 'Numerical trace', 'الخطوات بالأرقام')}</summary>
        <p className="lab-code">{values.map((v, i) => `${i}: ${format(v)}`).join(' · ')}</p>
      </details>
      <p className="lab-caption">
        {pick(
          locale,
          'Try k = 0.5 with delay 0, then delay 3. With no delay, convergence requires 0 < k < 2 for this model. Delay changes that condition. This is a discrete teaching model, not a thermostat simulation.',
          'جرّب k = 0.5 بلا تأخير، وبعدين مع تأخير 3. بلا تأخير، التقارب في هذا المثال بده 0 < k < 2. التأخير بغيّر الشرط. هذا نموذج تعليمي بخطوات منفصلة، مش محاكاة ترموستات حقيقي.'
        )}
      </p>
    </>
  )
}

function Descent({ locale }: { locale: Locale }) {
  const [rate, setRate] = useState(0.1)
  const [values, setValues] = useState([0])
  const a = values.at(-1)!
  const gradient = (2 / 3) * (14 * a - 23)
  const loss = ((a - 2) ** 2 + (2 * a - 3) ** 2 + (3 * a - 5) ** 2) / 3
  return (
    <>
      <p className="lab-code">
        data = [(1,2),(2,3),(3,5)] · prediction = a × x<br />
        L(a) = [(a−2)²+(2a−3)²+(3a−5)²]/3
        <br />
        dL/da = (28a−46)/3
      </p>
      <label>
        {pick(locale, 'Step size η', 'حجم الخطوة η')}: {rate}
        <input
          type="range"
          min={0.01}
          max={0.3}
          step={0.01}
          value={rate}
          onChange={(e) => {
            setRate(Number(e.target.value))
            setValues([0])
          }}
        />
      </label>
      <button
        onClick={() => setValues([...values, a - rate * gradient])}
        disabled={values.length > 40}
      >
        {pick(locale, 'One gradient step', 'خطوة gradient وحدة')}
      </button>
      <button onClick={() => setValues([0])}>{pick(locale, 'Restart', 'من الأول')}</button>
      <Trace
        values={values}
        target={23 / 14}
        label={pick(
          locale,
          'Slope after each update; dashed optimum is 23/14',
          'الميل بعد كل تحديث؛ القيمة المثلى المتقطّعة 23/14'
        )}
      />
      <output aria-live="polite" className="lab-code">
        step = {values.length - 1} · a = {format(a)} · L = {format(loss)}
        <br />
        gradient = {format(gradient)} · next a = {format(a - rate * gradient)}
      </output>
      <p className="lab-caption">
        {pick(
          locale,
          'The exact best slope is 23/14. Here convergence from a = 0 requires 0 < η < 3/14. Try 0.1 and 0.25. This quadratic has one global minimum; a neural network’s loss need not.',
          'الميل الأمثل بالضبط 23/14. التقارب من a = 0 هون بده 0 < η < 3/14. جرّب 0.1 و0.25. هذا المثال التربيعي إله حد أدنى شامل واحد؛ خسارة الشبكة العصبية مش ملزمة تكون هيك.'
        )}
      </p>
    </>
  )
}

function MonteCarlo({ locale }: { locale: Locale }) {
  const [points, setPoints] = useState<Array<[number, number]>>([])
  const [seed, setSeed] = useState(42)
  function sample() {
    let state = seed
    const random = () => {
      state = (Math.imul(1664525, state) + 1013904223) >>> 0
      return state / 4294967296
    }
    const batch = Array.from({ length: 100 }, () => [random(), random()] as [number, number])
    setSeed(state)
    setPoints([...points, ...batch])
  }
  const hits = points.filter(([x, y]) => x * x + y * y <= 1).length
  const estimate = points.length ? (4 * hits) / points.length : 0
  return (
    <>
      <p>
        {pick(
          locale,
          'Sample points in a unit square. Count how many fall inside the quarter circle x² + y² ≤ 1.',
          'اسحب نقاطاً من مربع طول ضلعه 1. عدّ اللي بتقع جوّا ربع الدائرة x² + y² ≤ 1.'
        )}
      </p>
      <button onClick={sample} disabled={points.length >= 5000}>
        {pick(locale, 'Sample 100 points', 'اسحب 100 نقطة')}
      </button>
      <button
        onClick={() => {
          setPoints([])
          setSeed(42)
        }}
      >
        {pick(locale, 'Restart with seed 42', 'من الأول ببذرة 42')}
      </button>
      <svg
        viewBox="0 0 260 260"
        role="img"
        aria-label={pick(
          locale,
          'Sampled points; gold inside, grey outside',
          'النقاط المسحوبة؛ ذهبي جوّا، رمادي برّا'
        )}
      >
        <rect x="5" y="5" width="250" height="250" fill="none" stroke="#9f9584" />
        <path d="M 255 255 A 250 250 0 0 0 5 5" fill="none" stroke="#9f9584" />
        {points.slice(-1000).map(([x, y], i) => (
          <circle
            key={i}
            cx={5 + 250 * x}
            cy={255 - 250 * y}
            r={1.5}
            fill={x * x + y * y <= 1 ? '#a27132' : '#888'}
          />
        ))}
      </svg>
      <output aria-live="polite">
        N = {points.length} · {pick(locale, 'inside', 'جوّا')} = {hits}
        {points.length > 0 && (
          <>
            {' '}
            · π ≈ 4 × {hits}/{points.length} = {format(estimate)} ·{' '}
            {pick(locale, 'absolute error', 'الخطأ المطلق')} ={' '}
            {format(Math.abs(estimate - Math.PI))}
          </>
        )}
      </output>
      <p className="lab-caption">
        {pick(
          locale,
          'The count uses every sample; the plot shows the latest 1,000. A fixed pseudorandom seed makes this reproducible. More samples improve typical accuracy, but the error need not shrink at every step. This estimates π; it does not prove its value.',
          'الحساب بستعمل كل العينات، والرسم بعرض آخر 1000. البذرة الثابتة بتخلي التجربة قابلة للإعادة. زيادة العينات بتحسّن الدقة عادةً، بس الخطأ مش لازم ينقص بكل خطوة. هذا تقدير لـπ، مش برهان قيمتها.'
        )}
      </p>
    </>
  )
}

function Bayes({ locale }: { locale: Locale }) {
  const [base, setBase] = useState(1)
  const good = (10000 * base) / 100
  const truePositive = good * 0.9
  const falsePositive = (10000 - good) * 0.05
  const posterior = truePositive / (truePositive + falsePositive)
  return (
    <>
      <p>
        {pick(
          locale,
          'A fictional factory flag catches 90% of defective items and mistakenly flags 5% of sound items. What fraction of flagged items are actually defective?',
          'بمصنع افتراضي، الفحص بيمسك 90% من القطع المعيبة، وبعلّم بالغلط على 5% من القطع السليمة. من القطع المعلَّمة، كم وحدة معيبة فعلاً؟'
        )}
      </p>
      <label>
        {pick(locale, 'Defect rate before testing', 'نسبة العيب قبل الفحص')}: {base}%
        <input
          type="range"
          min={1}
          max={50}
          value={base}
          onChange={(e) => setBase(Number(e.target.value))}
        />
      </label>
      <table>
        <caption>
          {pick(locale, 'Expected counts among 10,000 items', 'الأعداد المتوقعة من 10000 قطعة')}
        </caption>
        <thead>
          <tr>
            <th>{pick(locale, 'Reality', 'الواقع')}</th>
            <th>{pick(locale, 'Flagged', 'معلَّمة')}</th>
            <th>{pick(locale, 'Not flagged', 'مش معلَّمة')}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>{pick(locale, 'Defective', 'معيبة')}</th>
            <td>{truePositive}</td>
            <td>{format(good - truePositive)}</td>
          </tr>
          <tr>
            <th>{pick(locale, 'Sound', 'سليمة')}</th>
            <td>{falsePositive}</td>
            <td>{format(10000 - good - falsePositive)}</td>
          </tr>
        </tbody>
      </table>
      <output aria-live="polite">
        {pick(locale, 'P(defect | flag)', 'احتمال العيب بشرط العلامة')} = {truePositive}/(
        {truePositive}+{falsePositive}) = {format(100 * posterior, 2)}%
      </output>
      <p className="lab-caption">
        {pick(
          locale,
          'These are expected counts under stipulated rates, not measurements of a real detector. P(flag | defect) and P(defect | flag) answer different questions.',
          'هاي أعداد متوقعة تحت نسب افترضناها، مش قياسات لجهاز حقيقي. احتمال العلامة بشرط العيب غير احتمال العيب بشرط العلامة.'
        )}
      </p>
    </>
  )
}

const labs = {
  russell: Russell,
  coding: Coding,
  turing: Turing,
  circuits: Circuits,
  feedback: Feedback,
  descent: Descent,
  'monte-carlo': MonteCarlo,
  bayes: Bayes,
}
const names: Record<LabKind, [string, string]> = {
  russell: ['Try the membership rule', 'جرّب قاعدة العضوية'],
  coding: ['Turn symbols into a number', 'حوّل الرموز لعدد'],
  turing: ['Operate a Turing machine', 'شغّل آلة تورنغ'],
  circuits: ['Make a circuit add', 'خلّي الدائرة تجمع'],
  feedback: ['Correct a delayed measurement', 'صحّح قياساً متأخراً'],
  descent: ['Fit a line, one step at a time', 'لائم خطاً، خطوة بخطوة'],
  'monte-carlo': ['Estimate by sampling', 'قدّر بالسحب العشوائي'],
  bayes: ['Reverse the conditional', 'اقلب الاحتمال الشرطي'],
}

export default function BookLab({ kind, locale = 'en' }: Props) {
  const Lab = labs[kind]
  if (!Lab) return null
  return (
    <section
      className="book-lab not-prose"
      dir={locale === 'ar' ? 'rtl' : 'ltr'}
      data-lab={kind}
      aria-label={names[kind][locale === 'ar' ? 1 : 0]}
    >
      <header>
        <h4>{names[kind][locale === 'ar' ? 1 : 0]}</h4>
      </header>
      <Lab locale={locale} />
    </section>
  )
}
