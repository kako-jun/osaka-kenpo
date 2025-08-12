import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import yaml from 'js-yaml'
import { LawMetadataSchema } from '@/lib/schemas/law_metadata'
import { FamousArticlesSchema } from '@/lib/schemas/famous_articles'
import { ChaptersSchema } from '@/lib/schemas/chapters'

export async function GET(
  request: NextRequest,
  { params }: { params: { law_category: string; law: string } }
) {
  try {
    const { law_category, law } = params
    const dataDir = path.join(process.cwd(), 'src/data/laws', law_category, law)
    
    const result: {
      lawMetadata: any | null,
      famousArticles: any | null,
      chapters: any | null
    } = {
      lawMetadata: null,
      famousArticles: null,
      chapters: null
    }

    // 法律メタデータを読み込み
    try {
      const lawMetadataPath = path.join(dataDir, 'law_metadata.yaml')
      if (fs.existsSync(lawMetadataPath)) {
        const yamlContent = fs.readFileSync(lawMetadataPath, 'utf-8')
        const data = yaml.load(yamlContent)
        result.lawMetadata = LawMetadataSchema.parse(data)
      }
    } catch (error) {
      console.error(`Failed to load law metadata for ${law_category}/${law}:`, error)
    }

    // 有名条文データを読み込み
    try {
      const famousArticlesPath = path.join(dataDir, 'famous_articles.yaml')
      if (fs.existsSync(famousArticlesPath)) {
        const yamlContent = fs.readFileSync(famousArticlesPath, 'utf-8')
        const data = yaml.load(yamlContent)
        result.famousArticles = FamousArticlesSchema.parse(data)
      }
    } catch (error) {
      console.error(`Failed to load famous articles for ${law_category}/${law}:`, error)
    }

    // 章データを読み込み
    try {
      const chaptersPath = path.join(dataDir, 'chapters.yaml')
      if (fs.existsSync(chaptersPath)) {
        const yamlContent = fs.readFileSync(chaptersPath, 'utf-8')
        const data = yaml.load(yamlContent)
        result.chapters = ChaptersSchema.parse(data)
      }
    } catch (error) {
      console.error(`Failed to load chapters for ${law_category}/${law}:`, error)
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Failed to load law batch metadata:', error)
    return NextResponse.json({ error: 'Failed to load law batch metadata' }, { status: 500 })
  }
}