'use client'

import { useEffect, useRef, useState } from 'react'

interface DemoProps {
  /**
   * URL of a self-contained HTML demo. For co-located post bundles this is
   * `/demos/posts/<slug>/<file>.html`, synced from `data/posts/<slug>/demos/`.
   */
  src: string
  title?: string
  /** Initial / fallback height. The demo auto-resizes to its content if it reports a height. */
  height?: number | string
}

function DuelingBanditPanel() {
  return (
    <section className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-800/40">
      <h3 className="mt-0 text-lg font-semibold">A real dueling-bandit algorithm: RUCB</h3>
      <p>
        A <strong>dueling bandit</strong> does not need latent scores. It maintains an unknown preference
        matrix \(P\), where \(p_{{ij}}\) is the probability that item <em>i</em> beats item <em>j</em>. The
        standard RUCB algorithm assumes only a <strong>Condorcet winner</strong>: one item that beats every
        other item with probability above one half. It does not require the rest of the matrix to be
        transitive or Bradley–Terry shaped. Zoghi et al. define the interaction exactly this way and give
        the RUCB rule below.{' '}
        <a href="https://arxiv.org/abs/1312.3393" target="_blank" rel="noreferrer">
          Read the RUCB paper
        </a>
        .
      </p>
      <div className="my-4 grid gap-3 rounded-md border border-gray-200 bg-white p-4 text-sm dark:border-gray-700 dark:bg-gray-900/50 md:grid-cols-3">
        <div>
          <strong>1. Optimistic matrix</strong>
          <p className="mb-0 mt-1 text-gray-600 dark:text-gray-300">
            Estimate every pairwise win rate and add a confidence bonus. Unseen pairs remain maximally
            plausible.
          </p>
        </div>
        <div>
          <strong>2. Potential champion</strong>
          <p className="mb-0 mt-1 text-gray-600 dark:text-gray-300">
            Choose an item whose upper confidence bound says it could still beat every rival.
          </p>
        </div>
        <div>
          <strong>3. Strongest challenger</strong>
          <p className="mb-0 mt-1 text-gray-600 dark:text-gray-300">
            Challenge that champion with the rival most plausibly able to beat it, then update one matrix
            entry.
          </p>
        </div>
      </div>
      <pre className="overflow-x-auto rounded-md bg-gray-900 p-4 text-xs leading-5 text-gray-100">
{`def rucb_pair(wins, t, alpha=0.6, rng=None):
    # wins[i, j]: how often i beat j. RUCB requires alpha > 1/2.
    pair_games = wins + wins.T
    ucb = np.ones_like(wins, dtype=float)
    seen = pair_games > 0
    empirical = np.divide(wins, pair_games, out=np.zeros_like(wins, dtype=float), where=seen)
    ucb[seen] = empirical[seen] + np.sqrt(alpha * np.log(max(t, 2)) / pair_games[seen])
    np.fill_diagonal(ucb, 0.5)

    potential_champions = np.flatnonzero(np.all(ucb >= 0.5, axis=1))
    champion = rng.choice(potential_champions) if len(potential_champions) else rng.integers(len(wins))
    challenger = int(np.argmax(ucb[:, champion]))
    return champion, challenger

# Compare champion with challenger; increment wins[winner, loser].`}
      </pre>
      <p className="mt-4">
        The demo below uses a world where <strong>A</strong> is a Condorcet winner, while B, C, and D form a
        rock–paper–scissors-like cycle. That is intentional: it proves visually that RUCB can remain
        meaningful when a global BTL score is the wrong model.
      </p>
      <iframe
        src="/demos/posts/edp-sort/dueling-rucb.html"
        title="Relative Upper Confidence Bound dueling bandit"
        loading="lazy"
        scrolling="no"
        className="my-4 w-full rounded-lg border border-gray-200 bg-white dark:border-gray-700"
        style={{ height: '590px' }}
      />
      <p className="mb-0 text-sm text-gray-600 dark:text-gray-300">
        RUCB is appropriate when the target is a Condorcet winner. If preferences cycle with no Condorcet
        winner, you need to state another target—such as a Copeland or Borda winner—rather than pretending
        the ranking is globally coherent.
      </p>
    </section>
  )
}

function EDPImplementationNotes() {
  return (
    <aside className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-5 text-sm dark:border-gray-700 dark:bg-gray-800/40">
      <h3 className="mt-0 text-lg font-semibold">What “combinatorial” and “semi-bandit” actually mean</h3>
      <p>
        A standard bandit chooses <em>one</em> arm. A <strong>combinatorial bandit</strong> chooses a feasible
        structure made of base items: a top-K slate, a matching, a path, a budgeted set, or a set of ads
        subject to business rules. Formally, choose \(A_t \in \mathcal{{F}} \subseteq \{{0,1\}}^L\), where
        \(A_{t,e}=1\) means that base item <em>e</em> is selected.
      </p>
      <p>
        In the independent additive version, every selected item has a stochastic weight \(X_{t,e}\), and
        the slate reward is \(R_t(A_t)=\sum_e A_{t,e}X_{t,e}\). The feedback model is the essential
        distinction:
      </p>
      <div className="my-4 overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-gray-300 dark:border-gray-700">
              <th className="p-2">Setting</th>
              <th className="p-2">Action</th>
              <th className="p-2">What arrives after the action</th>
              <th className="p-2">What can be estimated directly</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-200 dark:border-gray-800">
              <td className="p-2 font-medium">Ordinary bandit</td>
              <td className="p-2">One item</td>
              <td className="p-2">One reward</td>
              <td className="p-2">The chosen item’s mean</td>
            </tr>
            <tr className="border-b border-gray-200 dark:border-gray-800">
              <td className="p-2 font-medium">Semi-bandit</td>
              <td className="p-2">A constrained subset / slate</td>
              <td className="p-2">A reward for <em>every selected base item</em></td>
              <td className="p-2">Every selected item’s mean</td>
            </tr>
            <tr>
              <td className="p-2 font-medium">Full-bandit slate feedback</td>
              <td className="p-2">A constrained subset / slate</td>
              <td className="p-2">Only one aggregate slate reward</td>
              <td className="p-2">The slate total, not the individual contributions</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        It is called <strong>semi</strong>-bandit because it sits between the two extremes: you do not observe
        the outcomes of unselected items, but you observe more than one aggregate number. Kveton et al.
        define stochastic combinatorial semi-bandits exactly as selecting a constrained subset, observing
        the selected items’ stochastic weights, and receiving their sum.{' '}
        <a href="https://arxiv.org/abs/1410.0949" target="_blank" rel="noreferrer">
          Read the paper
        </a>
        .
      </p>
      <h4 className="mb-2 mt-5 text-base font-semibold">Why top-K UCB is only the easy special case</h4>
      <p>
        Give each base item an optimistic score \(U_e=\hat\mu_e+b_e\), then solve the deterministic
        optimization problem using those scores:
      </p>
      <pre className="overflow-x-auto rounded-md bg-gray-900 p-4 text-xs leading-5 text-gray-100">
{`U_e(t) = empirical_mean_e + confidence_bonus_e
A_t = argmax_{A in F} sum_e A_e * U_e(t)
observe X_{t,e} for every e selected in A_t
update only those selected items`}
      </pre>
      <p>
        For top-K, \(\mathcal{{F}}\) is simply “all subsets of size K,” so the oracle is a sort. For a
        matching it could be a matching solver; for a route it could be a shortest-path solver; for a
        budgeted set it could be a knapsack solver. The bandit part learns optimistic item weights. The
        combinatorial optimizer enforces the feasible structure.
      </p>
      <p>
        This is why the current Comb-UCB demo is faithful only under its stated assumptions: independent
        item rewards, additive slate value, and semi-bandit feedback. A ranked product page can expose
        clicks for each displayed item yet still violate those assumptions because clicks depend on position,
        substitutions, price, inventory, and the rest of the slate. In that case the observation may be
        per-item, but the <em>value model</em> is not additive; choosing top-K independent UCBs is no longer
        the correct optimization problem.
      </p>
      <h4 className="mb-2 mt-5 text-base font-semibold">Algorithm notes and primary sources</h4>
      <ul className="mb-4 space-y-2">
        <li>
          <strong>UCB1, Bernoulli KL-UCB, and Beta–Bernoulli Thompson sampling</strong> are direct
          implementations of their standard index or posterior-sampling rules. They assume stationary,
          independent Bernoulli rewards in the demos.
        </li>
        <li>
          <strong>Disjoint LinUCB</strong> is the usual ridge-regression confidence-ellipsoid rule: each arm
          has a separate linear reward model, and context must be known before acting.
        </li>
        <li>
          <strong>Bradley–Terry plus online Elo</strong> uses a logistic pairwise model and a stochastic
          gradient update on its log-likelihood. The batch code is a standard MM-style fit for a connected
          comparison graph; production requires regularization or a prior.
        </li>
        <li>
          <strong>The original “information” scheduler</strong> in this post remains an explanatory BTL
          heuristic. RUCB, added above, is the canonical paper-backed dueling-bandit algorithm.
        </li>
      </ul>
      <details>
        <summary className="cursor-pointer font-medium">Primary references</summary>
        <ol className="mt-3 space-y-2 pl-5">
          <li>
            P. Auer, N. Cesa-Bianchi, and P. Fischer (2002),{' '}
            <a href="https://link.springer.com/article/10.1023/A:1013689704352" target="_blank" rel="noreferrer">
              Finite-time Analysis of the Multiarmed Bandit Problem
            </a>{' '}
            — UCB1.
          </li>
          <li>
            A. Garivier and O. Cappé (2011),{' '}
            <a href="https://arxiv.org/abs/1102.2490" target="_blank" rel="noreferrer">
              The KL-UCB Algorithm for Bounded Stochastic Bandits and Beyond
            </a>{' '}
            — KL-UCB.
          </li>
          <li>
            S. Agrawal and N. Goyal (2011),{' '}
            <a href="https://arxiv.org/abs/1111.1797" target="_blank" rel="noreferrer">
              Analysis of Thompson Sampling for the Multi-armed Bandit Problem
            </a>{' '}
            — posterior sampling for Bernoulli bandits.
          </li>
          <li>
            L. Li, W. Chu, J. Langford, and R. Schapire (2010),{' '}
            <a href="https://arxiv.org/abs/1003.0146" target="_blank" rel="noreferrer">
              A Contextual-Bandit Approach to Personalized News Article Recommendation
            </a>{' '}
            — LinUCB.
          </li>
          <li>
            R. Bradley and M. Terry (1952), <em>Rank Analysis of Incomplete Block Designs I: The Method
            of Paired Comparisons</em>, <em>Biometrika</em> 39, 324–345 — the Bradley–Terry model.
          </li>
          <li>
            Y. Yue and T. Joachims (2009),{' '}
            <a href="https://www.cs.cornell.edu/people/tj/publications/yue_joachims_09a.pdf" target="_blank" rel="noreferrer">
              Interactively Optimizing Information Retrieval Systems as a Dueling Bandits Problem
            </a>{' '}
            — dueling-bandit feedback.
          </li>
          <li>
            M. Zoghi, S. Whiteson, R. Munos, and M. de Rijke (2014),{' '}
            <a href="https://arxiv.org/abs/1312.3393" target="_blank" rel="noreferrer">
              Relative Upper Confidence Bound for the K-Armed Dueling Bandit Problem
            </a>{' '}
            — RUCB under a Condorcet-winner assumption.
          </li>
          <li>
            R. Heckel, N. Shah, K. Ramchandran, and M. Wainwright (2016),{' '}
            <a href="https://arxiv.org/abs/1606.08842" target="_blank" rel="noreferrer">
              Active Ranking from Pairwise Comparisons and when Parametric Assumptions Don&apos;t Help
            </a>{' '}
            — active top-K ranking.
          </li>
          <li>
            B. Kveton, Z. Wen, A. Ashkan, and C. Szepesvári (2015),{' '}
            <a href="https://arxiv.org/abs/1410.0949" target="_blank" rel="noreferrer">
              Tight Regret Bounds for Stochastic Combinatorial Semi-Bandits
            </a>{' '}
            — independent-item combinatorial semi-bandits and UCB-style learning.
          </li>
          <li>
            Z. Wen, B. Kveton, and A. Ashkan (2017),{' '}
            <a href="https://arxiv.org/abs/1406.7443" target="_blank" rel="noreferrer">
              Efficient Learning in Large-Scale Combinatorial Semi-Bandits
            </a>{' '}
            — linear generalization, CombLinUCB, and CombLinTS.
          </li>
        </ol>
      </details>
    </aside>
  )
}

// Embeds a self-contained HTML demo in an isolated, lazily-loaded iframe so a
// post can ship its own interactive widgets without touching the app bundle.
// If the demo posts a `demo-height` message (see the snippet in each demo HTML),
// the iframe grows to fit its content so there are no inner scrollbars.
export default function Demo({ src, title = 'Interactive demo', height = 480 }: DemoProps) {
  const ref = useRef<HTMLIFrameElement>(null)
  const [measured, setMeasured] = useState<number | null>(null)
  const pathname = src.split('?')[0]
  const isEDPPairingDemo = pathname === '/demos/posts/edp-sort/pairing-race.html'
  const isEDPFinalDemo = pathname === '/demos/posts/edp-sort/bt-vs-combucb.html'

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

  const resolvedHeight =
    measured != null ? `${measured}px` : typeof height === 'number' ? `${height}px` : height

  return (
    <>
      <figure className="my-6">
        <iframe
          ref={ref}
          src={src}
          title={title}
          loading="lazy"
          scrolling="no"
          className="w-full rounded-lg border border-gray-200 bg-white dark:border-gray-700"
          style={{ height: resolvedHeight }}
        />
      </figure>
      {isEDPPairingDemo && <DuelingBanditPanel />}
      {isEDPFinalDemo && <EDPImplementationNotes />}
    </>
  )
}
