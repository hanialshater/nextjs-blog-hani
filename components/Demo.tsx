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

function RucbPanel() {
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
  return (
    <aside className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-5 text-sm dark:border-gray-700 dark:bg-gray-800/40">
      <h3 className="mt-0 text-lg font-semibold">What “combinatorial” and “semi-bandit” mean</h3>
      <p>
        <strong>Combinatorial</strong> describes the action. Instead of selecting one arm, the learner chooses
        a feasible structure built from base items: a top-K slate, a matching, a path, or a budgeted set.
      </p>
      <p>
        <strong>Semi-bandit</strong> describes the feedback. After choosing a slate, the learner observes the
        outcome of every selected base item, but observes nothing for unselected items.
      </p>
      <div className="my-4 overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-gray-300 dark:border-gray-700">
              <th className="p-2">Setting</th>
              <th className="p-2">Action</th>
              <th className="p-2">Feedback</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-200 dark:border-gray-800">
              <td className="p-2 font-medium">Ordinary bandit</td>
              <td className="p-2">One item</td>
              <td className="p-2">One reward for that item</td>
            </tr>
            <tr className="border-b border-gray-200 dark:border-gray-800">
              <td className="p-2 font-medium">Semi-bandit</td>
              <td className="p-2">A constrained subset / slate</td>
              <td className="p-2">One reward for each selected base item</td>
            </tr>
            <tr>
              <td className="p-2 font-medium">Full-bandit slate feedback</td>
              <td className="p-2">A constrained subset / slate</td>
              <td className="p-2">One aggregate reward for the whole slate</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        In the independent additive case, each selected item has a stochastic weight and slate reward is the
        sum of those selected weights. The learner forms an optimistic score for each base item, then calls
        a deterministic optimizer:
      </p>
      <pre className="overflow-x-auto rounded-md bg-gray-900 p-4 text-xs leading-5 text-gray-100">
{`U[e] = estimated_mean[e] + confidence_bonus[e]
A[t] = argmax over feasible slates A of sum_e A[e] * U[e]
observe rewards for every selected e in A[t]
update only selected items`}
      </pre>
      <p className="mt-4">
        Top-K is the easy special case because the optimizer is sorting the optimistic item scores. For a
        matching, route, or budgeted package, the optimizer is respectively a matching, shortest-path, or
        knapsack solver. The learning rule estimates item weights; the optimizer enforces the structure.
      </p>
      <p>
        This is why Comb-UCB is only faithful when rewards are observed per selected item and slate value is
        additive. Product ranking often violates additivity through position effects, substitution, price,
        inventory, and slate interaction. Observing a click for every displayed item does not make independent
        top-K UCB correct if those item rewards depend on the slate.
      </p>
    </aside>
  )
}

function BanditHistoryPanel() {
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
  const showRucb = pathname === '/demos/posts/edp-sort/pairing-race.html'
  const showSemiBandit = pathname === '/demos/posts/edp-sort/bt-vs-combucb.html'

  return (
    <>
      <AutoHeightFrame src={src} title={title} height={height} />
      {showRucb && <RucbPanel />}
      {showSemiBandit && <SemiBanditPanel />}
      {showSemiBandit && <BanditHistoryPanel />}
    </>
  )
}
