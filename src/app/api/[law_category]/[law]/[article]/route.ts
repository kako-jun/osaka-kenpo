import { NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs/promises'
import { createErrorResponse, createSuccessResponse, safeJsonParse, validateArticleData } from '../../../../../lib/utils'
import type { ArticleData } from '../../../../../lib/types'

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
    const filePath = path.join(
      process.cwd(), 
      'src', 
      'data', 
      'laws', 
      law_category, 
      law, 
      `${article}.json`
    )
    
    const fileContent = await fs.readFile(filePath, 'utf8')
    const data = safeJsonParse<ArticleData>(fileContent)
    
    if (!data) {
      return NextResponse.json(
        createErrorResponse('Invalid JSON format'),
        { status: 500 }
      )
    }
    
    if (!validateArticleData(data)) {
      return NextResponse.json(
        createErrorResponse('Invalid article data structure'),
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      createSuccessResponse(data)
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