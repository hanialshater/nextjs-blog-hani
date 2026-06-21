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
    challenger = int(np.argmax(ucb[:, champion]))
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
      <details>
        <summary className="cursor-pointer font-medium">Primary sources and assumptions</summary>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li>Auer, Cesa-Bianchi, Fischer (2002): UCB1.</li>
          <li>Garivier, Cappé (2011): KL-UCB.</li>
          <li>Agrawal, Goyal (2011): Thompson sampling.</li>
          <li>Li et al. (2010): LinUCB.</li>
          <li>Yue, Joachims (2009): dueling-bandit feedback.</li>
          <li>Kveton et al. (2015): stochastic combinatorial semi-bandits.</li>
          <li>Wen, Kveton, Ashkan (2017): large-scale combinatorial semi-bandits.</li>
        </ul>
      </details>
    </aside>
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
    </>
  )
}
