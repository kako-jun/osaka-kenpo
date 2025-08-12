import { LawMetadata, LawMetadataSchema } from './schemas/law_metadata'
import { FamousArticles, FamousArticlesSchema } from './schemas/famous_articles'
import { ChaptersData, ChaptersSchema } from './schemas/chapters'
import { LawsMetadata, LawsMetadataSchema } from './schemas/laws_metadata'

// Browser環境でのベースURL取得
const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  return ''
}

export async function loadLawMetadata(lawCategory: string, lawName: string): Promise<LawMetadata | null> {
  try {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/metadata/${lawCategory}/${lawName}/law_metadata`)
    if (!response.ok) {
      return null
    }
    
    const data = await response.json()
    return LawMetadataSchema.parse(data)
  } catch (error) {
    console.error(`法律メタデータの読み込みに失敗: ${lawCategory}/${lawName}`, error)
    return null
  }
}

export async function loadFamousArticles(lawCategory: string, lawName: string): Promise<FamousArticles | null> {
  try {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/metadata/${lawCategory}/${lawName}/famous_articles`)
    if (!response.ok) {
      return null
    }
    
    const data = await response.json()
    return FamousArticlesSchema.parse(data)
  } catch (error) {
    console.error(`有名条文データの読み込みに失敗: ${lawCategory}/${lawName}`, error)
    return null
  }
}

export async function loadChapters(lawCategory: string, lawName: string): Promise<ChaptersData | null> {
  try {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/metadata/${lawCategory}/${lawName}/chapters`)
    if (!response.ok) {
      return null
    }
    
    const data = await response.json()
    return ChaptersSchema.parse(data)
  } catch (error) {
    console.error(`章データの読み込みに失敗: ${lawCategory}/${lawName}`, error)
    return null
  }
}

export async function loadLawsMetadata(): Promise<LawsMetadata | null> {
  try {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/metadata/laws_metadata`)
    if (!response.ok) {
      return null
    }
    
    const data = await response.json()
    return LawsMetadataSchema.parse(data)
  } catch (error) {
    console.error(`法律一覧メタデータの読み込みに失敗`, error)
    return null
  }
}

export async function getLawName(lawCategory: string, lawName: string): Promise<string> {
  const metadata = await loadLawMetadata(lawCategory, lawName)
  return metadata?.name || lawName
}