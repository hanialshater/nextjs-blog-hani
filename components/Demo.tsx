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

const englishVariants: Record<string, string> = {
  '/demos/posts/edp-sort/pitch-match.html': '/demos/posts/edp-sort/pitch-match.en.html',
  '/demos/posts/edp-sort/topk-scale.html': '/demos/posts/edp-sort/topk-scale.en.html',
}

function resolveSrc(src: string) {
  const [pathname, query = ''] = src.split('?')
  const params = new URLSearchParams(query)

  if (params.get('lang') === 'en' && englishVariants[pathname]) {
    return englishVariants[pathname]
  }

  return src
}

function EDPImplementationNotes() {
  return (
    <aside className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-5 text-sm dark:border-gray-700 dark:bg-gray-800/40">
      <h3 className="mt-0 text-base font-semibold">Algorithm notes and sources</h3>
      <p className="mb-3">
        The post deliberately mixes canonical algorithms with small scheduling heuristics. They are not
        the same kind of claim.
      </p>
      <ul className="mb-4 space-y-2">
        <li>
          <strong>UCB1, Bernoulli KL-UCB, and Beta–Bernoulli Thompson sampling</strong> are direct
          implementations of their standard index or posterior-sampling rules. They assume stationary,
          independent Bernoulli rewards in the demos.
        </li>
        <li>
          <strong>Disjoint LinUCB</strong> is the usual ridge-regression confidence-ellipsoid rule: each
          arm has a separate linear reward model. It is appropriate only when the context is available
          before the choice and the expected reward is plausibly linear in those features.
        </li>
        <li>
          <strong>Bradley–Terry plus online Elo</strong> uses a logistic pairwise model and a stochastic
          gradient update on its log-likelihood. The batch code is the standard minorization–maximization
          fit for a connected comparison graph; a production system needs regularization or a prior.
        </li>
        <li>
          <strong>Dueling bandit</strong> names the interaction—choose a pair and observe a winner. It does
          not require Bradley–Terry. The “information” scheduler in these demos is our transparent
          heuristic, based on local BTL information <code>p(1-p)</code> and under-sampling; it is not a
          named minimax-optimal active-ranking algorithm.
        </li>
        <li>
          <strong>Combinatorial UCB</strong> here is the independent-item, additive-reward special case of a
          combinatorial semi-bandit. Selecting top-K UCBs is valid only when every selected item returns
          its own reward and slate value is additive. Position effects, substitution, and only observing a
          slate total require a different model.
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
            R. Heckel, N. Shah, K. Ramchandran, and M. Wainwright (2016),{' '}
            <a href="https://arxiv.org/abs/1606.08842" target="_blank" rel="noreferrer">
              Active Ranking from Pairwise Comparisons and when Parametric Assumptions Don&apos;t Help
            </a>{' '}
            — active top-K ranking.
          </li>
          <li>
            Z. Wen, B. Kveton, and A. Ashkan (2014),{' '}
            <a href="https://arxiv.org/abs/1406.7443" target="_blank" rel="noreferrer">
              Efficient Learning in Large-Scale Combinatorial Semi-Bandits
            </a>{' '}
            — semi-bandit feedback and combinatorial UCB-style methods.
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
  const resolvedSrc = resolveSrc(src)
  const isEDPFinalDemo = src.split('?')[0] === '/demos/posts/edp-sort/bt-vs-combucb.html'

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
          src={resolvedSrc}
          title={title}
          loading="lazy"
          scrolling="no"
          className="w-full rounded-lg border border-gray-200 bg-white dark:border-gray-700"
          style={{ height: resolvedHeight }}
        />
      </figure>
      {isEDPFinalDemo && <EDPImplementationNotes />}
    </>
  )
}
