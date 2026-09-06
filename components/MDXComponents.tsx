import dynamic from 'next/dynamic'
import TOCInline from 'pliny/ui/TOCInline'
import Pre from 'pliny/ui/Pre'
import BlogNewsletterForm from 'pliny/ui/BlogNewsletterForm'
import type { MDXComponents } from 'mdx/types'
import Image from './ZoomableImage'
import CustomLink from './Link'
import TableWrapper from './TableWrapper'
import Caption from './Caption'
import Demo from './Demo'
import { RucbPanel, BanditHistoryPanel, SemiBanditPanel } from '@/data/posts/edp-sort/BanditPanels'
import CollisionBoard from './CollisionBoard'
import BookIllustration from './BookIllustration'
import Figure from './Figure'
import TechnicalNote from './TechnicalNote'

const MapElitesDemo = dynamic(() => import('./MapElitesDemo'))
const AlgorithmDemos = dynamic(() => import('./AlgorithmDemos'))
const EvolvedDemos = dynamic(() => import('./EvolvedDemos'))

export const components: MDXComponents = {
  Image,
  TOCInline,
  a: CustomLink,
  pre: Pre,
  table: TableWrapper,
  BlogNewsletterForm,
  Caption,
  Demo,
  CollisionBoard,
  BookIllustration,
  Figure,
  TechnicalNote,
  RucbAppendix: RucbPanel,
  BanditHistory: BanditHistoryPanel,
  SemiBandit: SemiBanditPanel,
  MapElitesDemo,
  AlgorithmDemos,
  EvolvedDemos,
}
