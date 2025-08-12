import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import yaml from 'js-yaml'
import { LawMetadataSchema } from '@/lib/schemas/law-metadata'
import { FamousArticlesSchema } from '@/lib/schemas/famous-articles'
import { ChaptersSchema } from '@/lib/schemas/chapters'

type RouteParams = {
  law_category: string
  law: string
  metadata_type: string
}

export async function GET(
  request: NextRequest,
  { params }: { params: RouteParams }
) {
  try {
    const { law_category, law, metadata_type } = params
    
    const dataDir = path.join(process.cwd(), 'src/data')
    const metadataPath = path.join(dataDir, 'laws', law_category, law, `${metadata_type}.yaml`)
    
    if (!fs.existsSync(metadataPath)) {
      return NextResponse.json({ error: 'Metadata not found' }, { status: 404 })
    }
    
    const yamlContent = fs.readFileSync(metadataPath, 'utf-8')
    const data = yaml.load(yamlContent)
    
    // メタデータタイプに応じてバリデーションスキーマを選択
    let validatedData
    switch (metadata_type) {
      case 'law-metadata':
        validatedData = LawMetadataSchema.parse(data)
        break
      case 'famous-articles':
        validatedData = FamousArticlesSchema.parse(data)
        break
      case 'chapters':
        validatedData = ChaptersSchema.parse(data)
        break
      default:
        return NextResponse.json({ error: 'Invalid metadata type' }, { status: 400 })
    }
    
    return NextResponse.json(validatedData)
  } catch (error) {
    console.error('Failed to load metadata:', error)
    return NextResponse.json({ error: 'Failed to load metadata' }, { status: 500 })
  }
}