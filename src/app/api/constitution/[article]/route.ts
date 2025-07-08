import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET(
  request: NextRequest,
  { params }: { params: { article: string } }
) {
  try {
    const articleNumber = params.article
    const filePath = path.join(
      process.cwd(),
      'src/data/laws/jp/constitution',
      `${articleNumber}.json`
    )

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      )
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8')
    const articleData = JSON.parse(fileContent)

    return NextResponse.json(articleData)
  } catch (error) {
    console.error('Error loading article:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}