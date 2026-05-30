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

// Embeds a self-contained HTML demo in an isolated, lazily-loaded iframe so a
// post can ship its own interactive widgets without touching the app bundle.
// If the demo posts a `demo-height` message (see the snippet in each demo HTML),
// the iframe grows to fit its content so there are no inner scrollbars.
export default function Demo({ src, title = 'Interactive demo', height = 480 }: DemoProps) {
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

  const resolvedHeight =
    measured != null ? `${measured}px` : typeof height === 'number' ? `${height}px` : height

  return (
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
  )
}
