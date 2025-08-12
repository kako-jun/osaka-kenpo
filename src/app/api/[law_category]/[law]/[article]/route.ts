import { NextResponse } from 'next/server'
import { createErrorResponse, createSuccessResponse } from '@/lib/utils'
import { loadArticle } from '@/lib/article_loader'
import type { ArticleData } from '@/lib/types'

export async function GET(
  request: Request,
  { params }: { params: { law_category: string; law: string; article: string } }
) {
  const { law_category, law, article } = params

  if (!law_category || !law || !article) {
    return NextResponse.json(
      createErrorResponse('Missing law category, law, or article'),
      { status: 400 }
    )
  }

  try {
    // 新しいローダーを使用（YAML優先、JSONフォールバック）
    const articleData = await loadArticle(law_category, law, article)
    
    return NextResponse.json(
      createSuccessResponse(articleData)
    )
  } catch (error) {
    console.error(`Error reading article ${law_category}/${law}/${article}:`, error)
    return NextResponse.json(
      createErrorResponse(
        `Article ${article} for law ${law} in category ${law_category} not found`,
        404
      ),
      { status: 404 }
    )
  }
}