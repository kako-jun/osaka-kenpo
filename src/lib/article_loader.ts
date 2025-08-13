import fs from 'fs/promises'
import path from 'path'
import yaml from 'js-yaml'
import { validateArticleData, safeValidateArticleData, type ArticleData } from './schemas/article'

/**
 * YAML形式の条文データを読み込み、Zodで検証する
 * @param filePath YAMLファイルのパス
 * @returns 検証済み条文データ
 */
export async function loadArticleFromYaml(filePath: string): Promise<ArticleData> {
  try {
    const fileContent = await fs.readFile(filePath, 'utf8')
    const rawData = yaml.load(fileContent)
    
    // Zodで検証
    const validatedData = validateArticleData(rawData)
    return validatedData
    
  } catch (error) {
    console.error(`Failed to load article from ${filePath}:`, error)
    throw new Error(`条文データの読み込みに失敗しました: ${path.basename(filePath)}`)
  }
}

/**
 * テキストを段落配列に分割する
 */
function splitIntoParagraphs(text: string): string[] {
  if (!text) return ['']
  return text.split('\n\n')
    .map(paragraph => paragraph.trim())
    .filter(paragraph => paragraph.length > 0)
}

/**
 * JSON形式の条文データを読み込み、Zodで検証する（互換性のため）
 * @param filePath JSONファイルのパス
 * @returns 検証済み条文データ
 */
export async function loadArticleFromJson(filePath: string): Promise<ArticleData> {
  try {
    const fileContent = await fs.readFile(filePath, 'utf8')
    const rawData = JSON.parse(fileContent)
    
    // 旧形式から新形式へのフィールドマッピング（配列形式に変換）
    const mappedData = {
      article: rawData.article,
      title: rawData.title || '',
      ...(rawData.titleOsaka && { titleOsaka: rawData.titleOsaka }),
      originalText: splitIntoParagraphs(rawData.original),
      osakaText: splitIntoParagraphs(rawData.osaka),
      commentary: splitIntoParagraphs(rawData.commentary),
      ...(rawData.commentaryOsaka && { 
        commentaryOsaka: splitIntoParagraphs(rawData.commentaryOsaka) 
      })
    }
    
    // Zodで検証
    const validatedData = validateArticleData(mappedData)
    return validatedData
    
  } catch (error) {
    console.error(`Failed to load article from ${filePath}:`, error)
    throw new Error(`条文データの読み込みに失敗しました: ${path.basename(filePath)}`)
  }
}

/**
 * 条文データを自動で読み込む（YAML優先、JSONフォールバック）
 * @param lawCategory 法律カテゴリ
 * @param lawName 法律名
 * @param articleNumber 条文番号
 * @returns 検証済み条文データ
 */
export async function loadArticle(
  lawCategory: string,
  lawName: string,
  articleNumber: string | number
): Promise<ArticleData> {
  const basePath = path.join(process.cwd(), 'src', 'data', 'laws', lawCategory, lawName)
  const articleId = articleNumber.toString()
  
  // YAML形式を優先的に試す
  const yamlPath = path.join(basePath, `${articleId}.yaml`)
  try {
    await fs.access(yamlPath)
    return await loadArticleFromYaml(yamlPath)
  } catch {
    // YAML が見つからない場合、JSONを試す
    const jsonPath = path.join(basePath, `${articleId}.json`)
    try {
      return await loadArticleFromJson(jsonPath)
    } catch {
      throw new Error(`条文データが見つかりません: ${lawCategory}/${lawName}/${articleId}`)
    }
  }
}

/**
 * 法律の全条文を読み込む
 * @param lawCategory 法律カテゴリ
 * @param lawName 法律名
 * @returns 検証済み条文データの配列
 */
export async function loadAllArticles(
  lawCategory: string,
  lawName: string
): Promise<ArticleData[]> {
  const basePath = path.join(process.cwd(), 'src', 'data', 'laws', lawCategory, lawName)
  
  try {
    const files = await fs.readdir(basePath)
    const articleFiles = files.filter(file => 
      (file.endsWith('.yaml') || file.endsWith('.json')) &&
      !file.includes('metadata') &&
      !file.includes('famous_articles') &&
      !file.includes('chapters')
    )
    
    const articles: ArticleData[] = []
    
    for (const file of articleFiles) {
      const articleId = file.replace(/\.(yaml|json)$/, '')
      try {
        const article = await loadArticle(lawCategory, lawName, articleId)
        articles.push(article)
      } catch (error) {
        console.warn(`Skipping invalid article: ${file}`, error)
      }
    }
    
    // 条文番号でソート（数値とそれ以外を適切に処理）
    return articles.sort((a, b) => {
      const aNum = typeof a.article === 'number' ? a.article : parseInt(String(a.article)) || Number.MAX_SAFE_INTEGER
      const bNum = typeof b.article === 'number' ? b.article : parseInt(String(b.article)) || Number.MAX_SAFE_INTEGER
      
      if (aNum !== Number.MAX_SAFE_INTEGER && bNum !== Number.MAX_SAFE_INTEGER) {
        return aNum - bNum
      }
      
      if (aNum !== Number.MAX_SAFE_INTEGER) return -1
      if (bNum !== Number.MAX_SAFE_INTEGER) return 1
      
      // 両方とも非数値の場合は文字列でソート（附則を最後に）
      return String(a.article).localeCompare(String(b.article))
    })
    
  } catch (error) {
    console.error(`Failed to load articles from ${lawCategory}/${lawName}:`, error)
    throw new Error(`条文一覧の読み込みに失敗しました: ${lawCategory}/${lawName}`)
  }
}

/**
 * 条文データの検証結果を取得（エラーハンドリング用）
 * @param data 検証対象のデータ
 * @returns 検証結果
 */
export function getArticleValidationErrors(data: unknown): string[] {
  const result = safeValidateArticleData(data)
  if (result.success) {
    return []
  }
  
  return result.error.issues.map((err: any) => 
    `${err.path.join('.')}: ${err.message}`
  )
}