import ArticlePage, {
  generateArticleMetadata,
  getArticleStaticParams,
  type ArticleProps,
} from '@/layouts/ArticlePage'

export function generateMetadata(props: ArticleProps) {
  return generateArticleMetadata(props, 'blog')
}

export function generateStaticParams() {
  return getArticleStaticParams('blog')
}

export default function Page(props: ArticleProps) {
  return <ArticlePage {...props} section="blog" />
}
