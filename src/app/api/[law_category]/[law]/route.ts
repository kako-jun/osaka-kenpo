import { NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs/promises'
import { createErrorResponse, createSuccessResponse } from '@/lib/utils'
import { loadAllArticles } from '@/lib/article_loader'
import type { ArticleListItem } from '@/lib/types'

export async function GET(
  request: Request,
  { params }: { params: { law_category: string; law: string } }
) {
  const { law_category, law } = params

  if (!law_category || !law) {
    return NextResponse.json(
      createErrorResponse('Missing law category or law'), 
      { status: 400 }
    )
  }

  try {
    // 新しいローダーを使用して全条文を取得
    const articles = await loadAllArticles(law_category, law)
    
    // ArticleListItem形式に変換
    const articlesData: ArticleListItem[] = articles.map(article => ({
      id: article.article.toString(),
      article: article.article.toString(),
      title: article.title,
      titleOsaka: article.titleOsaka || article.title
    }))

    return NextResponse.json(
      createSuccessResponse(articlesData)
    )
  } catch (error) {
    console.error(`Error reading articles for ${law_category}/${law}:`, error)
    return NextResponse.json(
      createErrorResponse(
        `Could not load articles for ${law_category}/${law}`,
        500
      ),
      { status: 500 }
    )
  }
}
