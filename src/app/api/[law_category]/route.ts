import { NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs/promises'
import { getLawName, getLawYear } from '../../../lib/law-mappings'
import { createErrorResponse, createSuccessResponse } from '../../../lib/utils'
import type { LawInfo } from '../../../lib/types'

export async function GET(
  request: Request,
  { params }: { params: { law_category: string } }
) {
  const { law_category } = params

  if (!law_category) {
    return NextResponse.json(
      createErrorResponse('Missing law category'), 
      { status: 400 }
    )
  }

  const lawsDirectory = path.join(process.cwd(), 'src', 'data', 'laws', law_category)

  try {
    const dirents = await fs.readdir(lawsDirectory, { withFileTypes: true })
    const lawFolders = dirents.filter(dirent => dirent.isDirectory()).map(dirent => dirent.name)

    const lawsData: LawInfo[] = lawFolders.map(slug => ({
      slug,
      name: getLawName(slug),
      year: getLawYear(slug)
    }))

    // 年情報でソート
    lawsData.sort((a, b) => {
      if (a.year === null || a.year === undefined || 
          b.year === null || b.year === undefined) return 0
      return a.year - b.year
    })

    return NextResponse.json(
      createSuccessResponse(lawsData)
    )
  } catch (error) {
    console.error(`Error reading laws for category ${law_category}:`, error)
    return NextResponse.json(
      createErrorResponse(
        `Could not load laws for category ${law_category}`,
        500
      ),
      { status: 500 }
    )
  }
}
