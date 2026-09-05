'use client'

import type { ComponentProps } from 'react'
import { MDXLayoutRenderer } from 'pliny/mdx-components'
import { components } from './MDXComponents'
import Image from './Image'
import Demo from './Demo'
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
  a: (props: ComponentProps<'a'>) => (
    <a {...props} href={props.href ? draftAssetPath(props.href) : props.href}>
      {props.children}
    </a>
  ),
}

export default function DraftContent({ code, toc }: { code: string; toc: unknown }) {
  return <MDXLayoutRenderer code={code} components={draftComponents} toc={toc} />
}
