'use client'

/* eslint-disable prettier/prettier */

import { useEffect, useRef, useState } from 'react'

interface DemoProps {
  src: string
  title?: string
  height?: number | string
}

function AutoHeightFrame({ src, title, height = 480 }: DemoProps) {
  const ref = useRef<HTMLIFrameElement>(null)
  const [measured, setMeasured] = useState<number | null>(null)

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      const iframe = ref.current
      if (!iframe || event.source !== iframe.contentWindow) return
      const data = event.data
      if (data && data.type === 'demo-height' && typeof data.height === 'number') {
        setMeasured(Math.ceil(data.height))
      }
    }

    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  useEffect(() => {
    setMeasured(null)
  }, [src])

  const resolvedHeight = measured != null ? `${measured}px` : typeof height === 'number' ? `${height}px` : height

  return (
    <figure className="my-6">
      <iframe
        ref={ref}
        src={src}
        title={title || 'Interactive demo'}
        loading="lazy"
        scrolling="no"
        className="w-full rounded-lg border border-gray-200 bg-white dark:border-gray-700"
        style={{ height: resolvedHeight }}
      />
    </figure>
  )
}

export function RucbPanel() {
  return (
    <section className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-5 text-sm dark:border-gray-700 dark:bg-gray-800/40">
      <h3 className="mt-0 text-lg font-semibold">A canonical dueling-bandit algorithm: RUCB</h3>
      <p>
        A dueling bandit chooses two items and receives only the winner. It does not need a Bradley–Terry
        score model. RUCB instead learns a pairwise preference matrix: <code>p[i, j]</code> is the probability
        that item <em>i</em> beats item <em>j</em>.
      </p>
      <p>
        RUCB assumes a <strong>Condorcet winner</strong>: one item beats every other item with probability
        greater than one half. It permits cycles among the other items, so it is useful precisely when a
        global scalar ranking may be wrong.
      </p>
      <ol className="list-decimal space-y-2 pl-5">
        <li>Build an upper-confidence estimate for every pairwise win probability.</li>
        <li>Choose a possible champion: an item that could still beat every rival.</li>
        <li>Challenge it with the rival most plausibly able to beat it.</li>
      </ol>
      <pre className="mt-4 overflow-x-auto rounded-md bg-gray-900 p-4 text-xs leading-5 text-gray-100">
{`def rucb_pair(wins, t, alpha=0.6, rng=None):
    pair_games = wins + wins.T
    empirical = np.divide(wins, pair_games, out=np.zeros_like(wins, dtype=float), where=pair_games > 0)
    ucb = np.ones_like(wins, dtype=float)
    seen = pair_games > 0
    ucb[seen] = empirical[seen] + np.sqrt(alpha * np.log(max(t, 2)) / pair_games[seen])
    np.fill_diagonal(ucb, 0.5)

    potential = np.flatnonzero(np.all(ucb >= 0.5, axis=1))
    champion = rng.choice(potential) if len(potential) else rng.integers(len(wins))
    challenger_scores = ucb[:, champion].copy()
    challenger_scores[champion] = -np.inf
    challenger = int(np.argmax(challenger_scores))
    return champion, challenger`}
      </pre>
      <p className="mt-4">
        The live demo below has one Condorcet winner while several other items form a deliberate preference
        cycle. That makes the distinction from BTL visible.
      </p>
      <AutoHeightFrame
        src="/demos/posts/edp-sort/dueling-rucb.html"
        title="RUCB dueling bandit demo"
        height={900}
      />
      <p className="mb-0 text-gray-600 dark:text-gray-300">
        Source: M. Zoghi et al.,{' '}
        <a href="https://arxiv.org/abs/1312.3393" target="_blank" rel="noreferrer">
          Relative Upper Confidence Bound for the K-Armed Dueling Bandit Problem
        </a>
        . If no Condorcet winner exists, define another target such as a Copeland or Borda winner instead.
      </p>
    </section>
  )
}

function SemiBanditPanel() {
  const selectedCandidates = [
    ['C-07', '81.4'], ['C-18', '73.2'], ['C-21', '79.8'], ['C-29', '66.1'], ['C-34', '76.9'],
    ['C-42', '71.6'], ['C-51', '82.0'], ['C-59', '69.4'], ['C-66', '75.1'], ['C-73', '78.5'],
  ]

  return (
    <aside className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-5 text-sm dark:border-gray-700 dark:bg-gray-800/40">
      <h3 className="mt-0 text-xl font-semibold">One semi-bandit round, slowly</h3>
      <p>
        Put football aside for a moment. You have <strong>80 candidate models</strong>, but a fixed evaluation
        budget: this week you can run only <strong>10</strong> candidates on the same standardized benchmark.
        The benchmark has noise—hardware, random seeds, test samples—but a score belongs to the candidate that
        produced it. That makes this a clean place to see semi-bandit feedback.
      </p>

      <div className="my-5 grid gap-3 md:grid-cols-4">
        <div className="rounded-md border border-gray-200 p-3 dark:border-gray-700">
          <div className="font-mono text-xs text-blue-600 dark:text-blue-300">1. Action</div>
          <strong>Choose a batch</strong>
          <p className="mb-0 mt-1 text-gray-600 dark:text-gray-300">Pick 10 of the 80 candidates. The action is a set, not one arm.</p>
        </div>
        <div className="rounded-md border border-gray-200 p-3 dark:border-gray-700">
          <div className="font-mono text-xs text-blue-600 dark:text-blue-300">2. Run</div>
          <strong>Same benchmark</strong>
          <p className="mb-0 mt-1 text-gray-600 dark:text-gray-300">Every selected candidate faces the same test protocol.</p>
        </div>
        <div className="rounded-md border border-gray-200 p-3 dark:border-gray-700">
          <div className="font-mono text-xs text-blue-600 dark:text-blue-300">3. Observe</div>
          <strong>Ten separate scores</strong>
          <p className="mb-0 mt-1 text-gray-600 dark:text-gray-300">Each score updates the candidate that generated it.</p>
        </div>
        <div className="rounded-md border border-gray-200 p-3 dark:border-gray-700">
          <div className="font-mono text-xs text-blue-600 dark:text-blue-300">4. Learn</div>
          <strong>Nothing about 70 others</strong>
          <p className="mb-0 mt-1 text-gray-600 dark:text-gray-300">Unselected candidates remain counterfactual and uncertain.</p>
        </div>
      </div>

      <div className="rounded-lg border border-gray-300 bg-white p-4 dark:border-gray-700 dark:bg-gray-900/40">
        <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
          <strong>Round 17: the selected benchmark batch</strong>
          <span className="font-mono text-xs text-gray-500 dark:text-gray-400">10 chosen · 10 scores returned</span>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {selectedCandidates.map(([candidate, score]) => (
            <div key={candidate} className="rounded border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-700 dark:bg-gray-800">
              <div className="font-mono text-xs text-gray-500 dark:text-gray-400">{candidate}</div>
              <div className="mt-1 font-mono text-base font-semibold text-green-700 dark:text-green-300">{score}</div>
            </div>
          ))}
        </div>
        <p className="mb-0 mt-3 text-gray-600 dark:text-gray-300">
          The crucial fact is not that the batch contains ten candidates. It is that the response comes back as
          ten labelled observations: <code>C-07 → 81.4</code>, <code>C-18 → 73.2</code>, and so on. The learner
          can assign credit correctly.
        </p>
      </div>

      <h4 className="mb-2 mt-6 text-lg font-semibold">Why it is called a semi-bandit</h4>
      <p>
        A full-information evaluator would reveal every candidate score, including all 70 candidates you did not
        run. A normal one-arm bandit would let you run only one candidate and observe one score. Here you get the
        useful middle ground: feedback for <em>every selected component</em>, but none for the rest.
      </p>
      <div className="my-4 overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-gray-300 dark:border-gray-700">
              <th className="p-2">What you choose</th>
              <th className="p-2">What returns</th>
              <th className="p-2">What can be updated</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-200 dark:border-gray-800">
              <td className="p-2 font-medium">One candidate</td>
              <td className="p-2">One benchmark score</td>
              <td className="p-2">One candidate</td>
            </tr>
            <tr className="border-b border-gray-200 dark:border-gray-800">
              <td className="p-2 font-medium">Ten-candidate batch</td>
              <td className="p-2">Ten labelled benchmark scores</td>
              <td className="p-2">All ten selected candidates</td>
            </tr>
            <tr>
              <td className="p-2 font-medium">Ten-candidate batch</td>
              <td className="p-2">Only one batch average: 75.4</td>
              <td className="p-2">Not cleanly attributable: this is full-bandit feedback</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        That last row is the boundary. Seeing only “the batch averaged 75.4” is not semi-bandit feedback; you do
        not know whether C-07 was excellent and C-29 poor, or the reverse. You have a single outcome for a whole
        structured action and need a more difficult slate-level learner.
      </p>

      <h4 className="mb-2 mt-6 text-lg font-semibold">What Comb-UCB does with the ten scores</h4>
      <p>
        For every candidate <code>i</code>, it keeps an average benchmark score and a count of how often that
        candidate has been evaluated. Then it adds an optimism bonus. A candidate that has looked strong gets a
        high score; a barely tested candidate also gets a temporary chance because its true score might still be
        higher than it looks.
      </p>
      <pre className="overflow-x-auto rounded-md bg-gray-900 p-4 text-xs leading-5 text-gray-100">
{`mean[i]  = total_benchmark_score[i] / benchmark_runs[i]
bonus[i] = exploration * sqrt(log(round) / benchmark_runs[i])
ucb[i]   = mean[i] + bonus[i]

next_batch = 10 candidates with the largest ucb[i]
run benchmark for all 10
update only those 10 means and counts`}
      </pre>
      <p className="mt-4">
        This is not a benchmark scorer. It is a <strong>budget-allocation policy</strong>. It decides which
        candidates deserve expensive evaluation next: established leaders because they may belong in the final
        top ten, and uncertain challengers because they might displace one.
      </p>

      <div className="my-5 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/25">
        <div className="font-semibold text-blue-950 dark:text-blue-100">Where “combinatorial” enters</div>
        <p className="mb-0 mt-2 text-blue-950/80 dark:text-blue-100/80">
          The learner supplies optimistic values <code>ucb[i]</code>. An optimizer turns them into a valid batch.
          With only the rule “choose any ten,” that optimizer is sorting. With costs, hardware capacity,
          fairness, compatibility, routes, or assignments, it becomes a knapsack, matching, path, or constrained
          set solver. The learning rule estimates uncertain component values; the optimizer enforces the shape of
          the action.
        </p>
      </div>

      <h4 className="mb-2 mt-6 text-lg font-semibold">Why this is not the football problem</h4>
      <p>
        In football, <code>Ada beat Bruno</code> is a relation. It tells us about the difference between their
        latent skills, not Ada’s opponent-independent reward. Ada could beat Bruno often and still lose to Hana.
        That requires a shared pairwise model such as Bradley–Terry. A standardized benchmark gives
        <code>candidate C-07 scored 81.4</code>: a direct sample of C-07’s own unknown mean. That is why the
        benchmark batch permits independent per-candidate UCB estimates.
      </p>

      <p className="mb-0">
        <strong>Production warning:</strong> product clicks are usually not standardized benchmark scores. They
        depend on user context, position, price, inventory, the rest of the slate, and the policy that exposed
        them. Independent Comb-UCB is faithful only when selected-item outcomes are genuinely comparable and
        slate value is close to additive; otherwise the reward model and optimizer must represent those
        interactions explicitly.
      </p>
    </aside>
  )
}

export function BanditHistoryPanel() {
  return (
    <section className="mt-8 rounded-lg border border-gray-200 bg-gray-50 p-5 text-sm dark:border-gray-700 dark:bg-gray-800/40">
      <h2 className="mt-0 text-xl font-semibold">A short history of bandits</h2>
      <p>
        The basic problem is old: learn which uncertain option is best while losing as little as possible on
        the way. The language changed, the feedback channels multiplied, and the action space grew from one
        lever to whole slates and structured decisions. The core tension survived.
      </p>
      <div className="my-5 grid gap-3 md:grid-cols-2">
        <div className="rounded-md border border-gray-200 p-3 dark:border-gray-700"><div className="font-mono text-xs text-blue-600 dark:text-blue-300">1933</div><strong>Thompson</strong><br />Probability matching: sample a plausible world, then act as though it were true.</div>
        <div className="rounded-md border border-gray-200 p-3 dark:border-gray-700"><div className="font-mono text-xs text-blue-600 dark:text-blue-300">1952</div><strong>Robbins</strong><br />Sequential allocation becomes the modern multi-armed-bandit question.</div>
        <div className="rounded-md border border-gray-200 p-3 dark:border-gray-700"><div className="font-mono text-xs text-blue-600 dark:text-blue-300">1985–2002</div><strong>Lai–Robbins to UCB1</strong><br />Regret lower bounds clarify the cost of learning; confidence bounds give a practical optimistic rule.</div>
        <div className="rounded-md border border-gray-200 p-3 dark:border-gray-700"><div className="font-mono text-xs text-blue-600 dark:text-blue-300">2009 onward</div><strong>Different feedback, different bandits</strong><br />Contextual, dueling, ranking, and combinatorial versions make the feedback channel part of the problem definition.</div>
      </div>
      <p>
        The post follows that expansion: one reward becomes context-conditioned reward; then a pairwise win;
        then item-level feedback for a whole slate. The action changes, but so does what reality lets the
        learner observe.
      </p>

      <h3 className="mb-3 mt-6 text-lg font-semibold">Primary reading</h3>
      <ol className="list-decimal space-y-2 pl-5">
        <li><a className="underline" href="https://doi.org/10.1093/biomet/25.3-4.285" target="_blank" rel="noreferrer">Thompson (1933), <em>On the Likelihood that One Unknown Probability Exceeds Another</em></a>.</li>
        <li><a className="underline" href="https://doi.org/10.1090/S0002-9904-1952-09620-8" target="_blank" rel="noreferrer">Robbins (1952), <em>Some Aspects of the Sequential Design of Experiments</em></a>.</li>
        <li><a className="underline" href="https://doi.org/10.1214/aos/1176349742" target="_blank" rel="noreferrer">Lai and Robbins (1985), <em>Asymptotically Efficient Adaptive Allocation Rules</em></a>.</li>
        <li><a className="underline" href="https://link.springer.com/article/10.1023/A:1013689704352" target="_blank" rel="noreferrer">Auer, Cesa-Bianchi, and Fischer (2002), <em>Finite-Time Analysis of the Multiarmed Bandit Problem</em></a>.</li>
        <li><a className="underline" href="https://arxiv.org/abs/1003.0146" target="_blank" rel="noreferrer">Li, Chu, Langford, and Schapire (2010), <em>A Contextual-Bandit Approach to Personalized News Article Recommendation</em></a>.</li>
        <li><a className="underline" href="https://www.cs.cornell.edu/people/tj/publications/yue_joachims_09a.pdf" target="_blank" rel="noreferrer">Yue and Joachims (2009), <em>Interactively Optimizing Information Retrieval Systems as a Dueling Bandits Problem</em></a>.</li>
        <li><a className="underline" href="https://arxiv.org/abs/1312.3393" target="_blank" rel="noreferrer">Zoghi et al. (2014), <em>Relative Upper Confidence Bound for the K-Armed Dueling Bandit Problem</em></a>.</li>
        <li><a className="underline" href="https://arxiv.org/abs/1410.0949" target="_blank" rel="noreferrer">Kveton et al. (2015), <em>Tight Regret Bounds for Stochastic Combinatorial Semi-Bandits</em></a>.</li>
      </ol>
      <p className="mb-0 mt-5 text-gray-600 dark:text-gray-300">
        <strong>About the interactive demos:</strong> UCB1, KL-UCB, Thompson sampling, LinUCB, Bradley–Terry,
        Elo, RUCB, and combinatorial semi-bandits correspond to established families above. The active-pairing
        scheduler, the cutline matcher, and the overlapping bootstrap-Elo leagues are explanatory heuristics
        built for this post; they are not claimed as canonical algorithms or theorem-optimal policies.
      </p>
    </section>
  )
}

export default function Demo({ src, title = 'Interactive demo', height = 480 }: DemoProps) {
  const pathname = src.split('?')[0]
  // The RUCB and bandit-history panels are placed explicitly in the appendix via the
  // RucbAppendix / BanditHistory MDX components, not auto-attached to a demo by src.
  const showSemiBandit = pathname === '/demos/posts/edp-sort/bt-vs-combucb.html'

  return (
    <>
      <AutoHeightFrame src={src} title={title} height={height} />
      {showSemiBandit && <SemiBanditPanel />}
    </>
  )
}
