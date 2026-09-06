import type { ReactNode } from 'react'
import type { ImageProps } from 'next/image'
import ZoomableImage from './ZoomableImage'

interface FigureProps extends Omit<ImageProps, 'fill'> {
  caption?: ReactNode
  credit?: ReactNode
  wide?: boolean
}

export default function Figure({ caption, credit, wide = false, ...image }: FigureProps) {
  return (
    <figure className={`article-figure not-prose ${wide ? 'article-figure-wide' : ''}`}>
      <ZoomableImage {...image} sizes={image.sizes || '(min-width: 1024px) 800px, 100vw'} />
      {(caption || credit) && (
        <figcaption>
          {caption}
          {credit && <span className="figure-credit">{credit}</span>}
        </figcaption>
      )}
    </figure>
  )
}
