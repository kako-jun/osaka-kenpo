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

// バッチでメタデータを取得する新しい関数
export async function loadBatchMetadata(): Promise<{
  lawsMetadata: LawsMetadata | null,
  lawMetadata: { [key: string]: LawMetadata | null }
}> {
  try {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/metadata/batch`)
    if (!response.ok) {
      return { lawsMetadata: null, lawMetadata: {} }
    }
    
    const data = await response.json()
    return {
      lawsMetadata: LawsMetadataSchema.parse(data.lawsMetadata),
      lawMetadata: data.lawMetadata
    }
  } catch (error) {
    console.error(`バッチメタデータの読み込みに失敗`, error)
    return { lawsMetadata: null, lawMetadata: {} }
  }
}

// 個別法律用のバッチメタデータ取得関数
export async function loadLawBatchMetadata(lawCategory: string, lawName: string): Promise<{
  lawMetadata: LawMetadata | null,
  famousArticles: FamousArticles | null,
  chapters: ChaptersData | null
}> {
  try {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/metadata/${lawCategory}/${lawName}/batch`)
    if (!response.ok) {
      return { lawMetadata: null, famousArticles: null, chapters: null }
    }
    
    const data = await response.json()
    return {
      lawMetadata: data.lawMetadata ? LawMetadataSchema.parse(data.lawMetadata) : null,
      famousArticles: data.famousArticles ? FamousArticlesSchema.parse(data.famousArticles) : null,
      chapters: data.chapters ? ChaptersSchema.parse(data.chapters) : null
    }
  } catch (error) {
    console.error(`法律バッチメタデータの読み込みに失敗: ${lawCategory}/${lawName}`, error)
    return { lawMetadata: null, famousArticles: null, chapters: null }
  }
}

// 個別条文用のバッチデータ取得関数
export async function loadArticleBatchData(lawCategory: string, lawName: string, article: string): Promise<{
  articleData: any | null,
  lawMetadata: LawMetadata | null,
  allArticles: any[] | null
}> {
  try {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/${lawCategory}/${lawName}/${article}/batch`)
    if (!response.ok) {
      return { articleData: null, lawMetadata: null, allArticles: null }
    }
    
    const data = await response.json()
    return {
      articleData: data.articleData,
      lawMetadata: data.lawMetadata ? LawMetadataSchema.parse(data.lawMetadata) : null,
      allArticles: data.allArticles
    }
  } catch (error) {
    console.error(`条文バッチデータの読み込みに失敗: ${lawCategory}/${lawName}/${article}`, error)
    return { articleData: null, lawMetadata: null, allArticles: null }
  }
}

export async function getLawName(lawCategory: string, lawName: string): Promise<string> {
  const metadata = await loadLawMetadata(lawCategory, lawName)
  return metadata?.name || lawName
}

