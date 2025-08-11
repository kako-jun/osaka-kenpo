import { NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs/promises'
import { createErrorResponse, createSuccessResponse, sortArticleNumbers, safeJsonParse } from '@/lib/utils'
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

  const articlesDirectory = path.join(process.cwd(), 'src', 'data', 'laws', law_category, law)

  try {
    const files = await fs.readdir(articlesDirectory)
    const articleFiles = files.filter(file => file.endsWith('.json'))

    const articlesData: ArticleListItem[] = await Promise.all(
      articleFiles.map(async (fileName) => {
        const articleId = fileName.replace('.json', '')
        const filePath = path.join(articlesDirectory, fileName)
        const fileContent = await fs.readFile(filePath, 'utf8')
        const data = safeJsonParse(fileContent) as any
        
        if (!data) {
          console.warn(`Invalid article data in ${filePath}`)
          return { article: articleId, title: `第${articleId}条` }
        }
        
        // タイトルが空文字の場合は条文番号を使用
        const title = data.title || `第${articleId}条`
        return { 
          article: articleId, 
          title: title,
          titleOsaka: data.titleOsaka || title
        }
      })
    )

    // 記事番号でソート
    const sortedArticles = [...articlesData].sort((a, b) => {
      const numA = parseInt(a.article)
      const numB = parseInt(b.article)
      return numA - numB
    })

    return NextResponse.json(
      createSuccessResponse(sortedArticles)
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
