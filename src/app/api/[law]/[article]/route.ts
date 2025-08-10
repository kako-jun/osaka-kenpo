import { NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs/promises'

export async function GET(
  request: Request,
  { params }: { params: { law: string; article: string } }
) {
  const { law, article } = params

  if (!law || !article) {
    return NextResponse.json({ error: 'Missing law or article' }, { status: 400 })
  }

  try {
    const filePath = path.join(process.cwd(), 'src', 'data', 'laws', 'jp', law, `${article}.json`)
    const fileContent = await fs.readFile(filePath, 'utf8')
    const data = JSON.parse(fileContent)
    return NextResponse.json(data)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: `Article ${article} for law ${law} not found` },
      { status: 404 }
    )
  }
}