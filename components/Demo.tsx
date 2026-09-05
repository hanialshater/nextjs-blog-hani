'use client'

import { useEffect, useRef, useState } from 'react'

interface DemoProps {
  src: string
  title?: string
  height?: number | string
}

export default function Demo({ src, title, height = 480 }: DemoProps) {
  const ref = useRef<HTMLIFrameElement>(null)
  const [measured, setMeasured] = useState<number | null>(null)

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      const iframe = ref.current
      if (!iframe || event.source !== iframe.contentWindow) return
      const data = event.data
      if (
        data &&
        data.type === 'demo-height' &&
        typeof data.height === 'number' &&
        Number.isFinite(data.height) &&
        data.height > 0 &&
        data.height < 20000
      ) {
        setMeasured(Math.ceil(data.height))
      }
    }

    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  useEffect(() => {
    setMeasured(null)
  }, [src])

  const resolvedHeight =
    measured != null ? `${measured}px` : typeof height === 'number' ? `${height}px` : height

  return (
    <figure className="my-6">
      <iframe
        ref={ref}
        src={src}
        title={title || 'Interactive demo'}
        loading="lazy"
        scrolling="auto"
        className="w-full rounded-lg border border-gray-200 bg-white dark:border-gray-700"
        style={{ height: resolvedHeight }}
      />
    </figure>
  )
}
