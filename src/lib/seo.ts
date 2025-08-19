import { Metadata } from 'next'
import { ArticleData } from './types'

/**
 * 条文ページ用のメタデータを生成
 */
export function generateArticleMetadata(
  articleData: ArticleData,
  lawName: string,
  categoryName: string,
  lawCategory: string,
  lawId: string
): Metadata {
  const articleNumber = typeof articleData.article === 'number' 
    ? `第${articleData.article}条` 
    : articleData.article.startsWith('fusoku_') 
      ? `附則第${articleData.article.replace('fusoku_', '')}条` 
      : `第${articleData.article}条`

  const title = `${lawName} ${articleNumber} - おおさかけんぽう`
  const description = articleData.osakaText?.[0] 
    ? `${lawName}${articleNumber}を大阪弁で解説：${articleData.osakaText[0].substring(0, 100)}...`
    : `${lawName}${articleNumber}の条文と解説`

  const url = `/law/${lawCategory}/${lawId}/${articleData.article}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type: 'article',
      siteName: 'おおさかけんぽう',
      images: [
        {
          url: '/osaka-kenpo-logo.webp',
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/osaka-kenpo-logo.webp'],
    },
    alternates: {
      canonical: url,
    },
  }
}

/**
 * 法律ページ用のメタデータを生成
 */
export function generateLawMetadata(
  lawName: string,
  lawDescription: string,
  categoryName: string,
  lawCategory: string,
  lawId: string
): Metadata {
  const title = `${lawName} - ${categoryName} - おおさかけんぽう`
  const description = `${lawName}を大阪弁で親しみやすく解説。${lawDescription}`

  const url = `/law/${lawCategory}/${lawId}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      siteName: 'おおさかけんぽう',
      images: [
        {
          url: '/osaka-kenpo-logo.webp',
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/osaka-kenpo-logo.webp'],
    },
    alternates: {
      canonical: url,
    },
  }
}

/**
 * カテゴリページ用のメタデータを生成
 */
export function generateCategoryMetadata(
  categoryName: string,
  categoryDescription: string,
  lawCategory: string
): Metadata {
  const title = `${categoryName} - おおさかけんぽう`
  const description = `${categoryName}の法律を大阪弁で親しみやすく解説。${categoryDescription}`

  const url = `/law/${lawCategory}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      siteName: 'おおさかけんぽう',
      images: [
        {
          url: '/osaka-kenpo-logo.webp',
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/osaka-kenpo-logo.webp'],
    },
    alternates: {
      canonical: url,
    },
  }
}