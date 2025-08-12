import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import yaml from 'js-yaml'
import { LawsMetadataSchema } from '@/lib/schemas/laws_metadata'
import { LawMetadataSchema } from '@/lib/schemas/law_metadata'

export async function GET(request: NextRequest) {
  try {
    const dataDir = path.join(process.cwd(), 'src/data')
    const metadataPath = path.join(dataDir, 'laws_metadata.yaml')
    
    if (!fs.existsSync(metadataPath)) {
      return NextResponse.json({ error: 'Laws metadata not found' }, { status: 404 })
    }
    
    const yamlContent = fs.readFileSync(metadataPath, 'utf-8')
    const data = yaml.load(yamlContent)
    const validatedData = LawsMetadataSchema.parse(data)
    
    // 各法律の詳細メタデータをバッチで取得
    const batchMetadata: { [key: string]: any } = {}
    
    for (const category of validatedData.categories) {
      for (const law of category.laws) {
        const pathParts = law.path.split('/')
        const lawCategory = pathParts[2]
        const lawId = pathParts[3]
        const key = `${lawCategory}/${lawId}`
        
        try {
          const lawMetadataPath = path.join(dataDir, 'laws', lawCategory, lawId, 'law_metadata.yaml')
          
          if (fs.existsSync(lawMetadataPath)) {
            const lawYamlContent = fs.readFileSync(lawMetadataPath, 'utf-8')
            const lawData = yaml.load(lawYamlContent)
            const validatedLawData = LawMetadataSchema.parse(lawData)
            batchMetadata[key] = validatedLawData
          }
        } catch (error) {
          console.error(`Failed to load metadata for ${key}:`, error)
          // エラーの場合はnullを設定
          batchMetadata[key] = null
        }
      }
    }
    
    return NextResponse.json({
      lawsMetadata: validatedData,
      lawMetadata: batchMetadata
    })
  } catch (error) {
    console.error('Failed to load batch metadata:', error)
    return NextResponse.json({ error: 'Failed to load batch metadata' }, { status: 500 })
  }
}