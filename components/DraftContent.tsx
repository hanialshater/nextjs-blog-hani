'use client'

import type { ComponentProps } from 'react'
import { MDXLayoutRenderer } from 'pliny/mdx-components'
import { components } from './MDXComponents'
import Image from './ZoomableImage'
import Demo from './Demo'
import Figure from './Figure'
import BookIllustration from './BookIllustration'
import { draftAssetPath } from '@/lib/drafts/assetPaths'

const draftComponents = {
  ...components,
  Image: (props: ComponentProps<typeof Image>) => (
    <Image
      {...props}
      src={typeof props.src === 'string' ? draftAssetPath(props.src) : props.src}
      alt={props.alt}
      unoptimized
    />
  ),
  img: (props: ComponentProps<'img'>) => (
    <img
      {...props}
      src={typeof props.src === 'string' ? draftAssetPath(props.src) : props.src}
      alt={props.alt || ''}
    />
  ),
  Demo: (props: ComponentProps<typeof Demo>) => <Demo {...props} src={draftAssetPath(props.src)} />,
  Figure: (props: ComponentProps<typeof Figure>) => (
    <Figure
      {...props}
      src={typeof props.src === 'string' ? draftAssetPath(props.src) : props.src}
      alt={props.alt}
      unoptimized
    />
  ),
  BookIllustration: (props: ComponentProps<typeof BookIllustration>) => (
    <BookIllustration {...props} src={draftAssetPath(props.src)} unoptimized />
  ),
  a: (props: ComponentProps<'a'>) => (
    <a {...props} href={props.href ? draftAssetPath(props.href) : props.href}>
      {props.children}
    </a>
  ),
}

export default function DraftContent({ code, toc }: { code: string; toc: unknown }) {
  return <MDXLayoutRenderer code={code} components={draftComponents} toc={toc} />
}
