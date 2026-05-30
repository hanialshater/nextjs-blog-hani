interface DemoProps {
  /**
   * URL of a self-contained HTML demo. For co-located post bundles this is
   * `/demos/posts/<slug>/<file>.html`, synced from `data/posts/<slug>/demos/`.
   */
  src: string
  title?: string
  height?: number | string
}

// Embeds a self-contained HTML demo in an isolated, lazily-loaded iframe so a
// post can ship its own interactive widgets without touching the app bundle.
export default function Demo({ src, title = 'Interactive demo', height = 480 }: DemoProps) {
  return (
    <figure className="my-6">
      <iframe
        src={src}
        title={title}
        loading="lazy"
        className="w-full rounded-lg border border-gray-200 bg-white dark:border-gray-700"
        style={{ height: typeof height === 'number' ? `${height}px` : height }}
      />
    </figure>
  )
}
