'use client'

import { Comments as CommentsComponent } from 'pliny/comments'
import { useState } from 'react'
import { useLocale } from '@/i18n/LocaleContext'
import siteMetadata from '@/data/siteMetadata'

export default function Comments({ slug }: { slug: string }) {
  const { t, locale } = useLocale()
  const [loadComments, setLoadComments] = useState(false)

  if (!siteMetadata.comments?.provider) {
    return null
  }
  return (
    <>
      {loadComments ? (
        <CommentsComponent
          commentsConfig={
            siteMetadata.comments.provider === 'giscus'
              ? {
                  ...siteMetadata.comments,
                  giscusConfig: { ...siteMetadata.comments.giscusConfig, lang: locale },
                }
              : siteMetadata.comments
          }
          slug={slug}
        />
      ) : (
        <button onClick={() => setLoadComments(true)}>{t('comments.loadComments')}</button>
      )}
    </>
  )
}
