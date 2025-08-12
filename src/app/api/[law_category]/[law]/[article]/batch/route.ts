import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import yaml from 'js-yaml'
import { LawMetadataSchema } from '@/lib/schemas/law_metadata'
import { ArticleSchema } from '@/lib/schemas/article'

export async function GET(
  request: NextRequest,
  { params }: { params: { law_category: string; law: string; article: string } }
) {
  try {
    const { law_category, law, article } = params
    const dataDir = path.join(process.cwd(), 'src/data/laws', law_category, law)
    
    const result: {
      articleData: any | null,
      lawMetadata: any | null,
      allArticles: any[] | null
    } = {
      articleData: null,
      lawMetadata: null,
      allArticles: null
    }

    // 条文データを読み込み
    try {
      const articlePath = path.join(dataDir, `${article}.yaml`)
      if (fs.existsSync(articlePath)) {
        const yamlContent = fs.readFileSync(articlePath, 'utf-8')
        const data = yaml.load(yamlContent)
        result.articleData = ArticleSchema.parse(data)
      }
    } catch (error) {
      console.error(`Failed to load article data for ${law_category}/${law}/${article}:`, error)
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

    // 全条文リストを読み込み
    try {
      if (fs.existsSync(dataDir)) {
        const articleFiles = fs.readdirSync(dataDir)
          .filter(file => file.endsWith('.yaml') && !['law_metadata.yaml', 'chapters.yaml', 'famous_articles.yaml'].includes(file))
          .sort((a, b) => {
            // ファイル名を数値として比較（fusoku_付きは後に）
            const aNum = a.replace('.yaml', '')
            const bNum = b.replace('.yaml', '')
            
            if (aNum.startsWith('fusoku_') && !bNum.startsWith('fusoku_')) return 1
            if (!aNum.startsWith('fusoku_') && bNum.startsWith('fusoku_')) return -1
            
            if (aNum.startsWith('fusoku_') && bNum.startsWith('fusoku_')) {
              const aVal = parseInt(aNum.replace('fusoku_', ''))
              const bVal = parseInt(bNum.replace('fusoku_', ''))
              return aVal - bVal
            }
            
            return parseInt(aNum) - parseInt(bNum)
          })

        const allArticles = []
        for (const file of articleFiles) {
          try {
            const articlePath = path.join(dataDir, file)
            const yamlContent = fs.readFileSync(articlePath, 'utf-8')
            const data = yaml.load(yamlContent)
            const validatedData = ArticleSchema.parse(data)
            allArticles.push({
              article: validatedData.article,
              title: validatedData.title,
              titleOsaka: validatedData.titleOsaka
            })
          } catch (error) {
            console.error(`Failed to load article ${file}:`, error)
          }
        }
        result.allArticles = allArticles
      }
    } catch (error) {
      console.error(`Failed to load all articles for ${law_category}/${law}:`, error)
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Failed to load article batch data:', error)
    return NextResponse.json({ error: 'Failed to load article batch data' }, { status: 500 })
  }
}