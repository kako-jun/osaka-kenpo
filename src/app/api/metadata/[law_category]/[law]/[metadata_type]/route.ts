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
    console.log(`API: メタデータリクエスト: ${law_category}/${law}/${metadata_type}`)
    
    const dataDir = path.join(process.cwd(), 'src/data')
    const metadataPath = path.join(dataDir, 'laws', law_category, law, `${metadata_type}.yaml`)
    console.log(`API: ファイルパス: ${metadataPath}`)
    
    if (!fs.existsSync(metadataPath)) {
      console.log(`API: ファイルが見つかりません: ${metadataPath}`)
      return NextResponse.json({ error: 'Metadata not found', path: metadataPath }, { status: 404 })
    }
    
    console.log(`API: ファイル読み込み開始`)
    const yamlContent = fs.readFileSync(metadataPath, 'utf-8')
    const data = yaml.load(yamlContent)
    console.log(`API: YAML解析完了:`, data)
    
    // メタデータタイプに応じてバリデーションスキーマを選択
    let validatedData
    switch (metadata_type) {
      case 'law-metadata':
        console.log(`API: 法律メタデータのバリデーション開始`)
        validatedData = LawMetadataSchema.parse(data)
        break
      case 'famous-articles':
        console.log(`API: 有名条文データのバリデーション開始`)
        validatedData = FamousArticlesSchema.parse(data)
        break
      case 'chapters':
        console.log(`API: 章データのバリデーション開始`)
        validatedData = ChaptersSchema.parse(data)
        break
      default:
        console.log(`API: 無効なメタデータタイプ: ${metadata_type}`)
        return NextResponse.json({ error: 'Invalid metadata type' }, { status: 400 })
    }
    
    console.log(`API: バリデーション完了、レスポンス送信`)
    return NextResponse.json(validatedData)
  } catch (error) {
    console.error('API: メタデータ読み込みエラー:', error)
    return NextResponse.json({ 
      error: 'Failed to load metadata',
      details: error instanceof Error ? error.message : String(error),
      params: { law_category: params.law_category, law: params.law, metadata_type: params.metadata_type }
    }, { status: 500 })
  }
}