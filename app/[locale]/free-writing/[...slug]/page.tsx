import ArticlePage, {
  generateArticleMetadata,
  getArticleStaticParams,
  type ArticleProps,
} from '@/layouts/ArticlePage'

export function generateMetadata(props: ArticleProps) {
  return generateArticleMetadata(props, 'free-writing')
}

export function generateStaticParams() {
  return getArticleStaticParams('free-writing')
}

export default function Page(props: ArticleProps) {
  return <ArticlePage {...props} section="free-writing" />
}
