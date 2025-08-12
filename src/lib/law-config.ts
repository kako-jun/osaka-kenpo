/**
 * 法律の設定データを動的に取得するユーティリティ
 */

export interface LawSource {
  name: string
  year: number
  source: string
  description: string
  links?: Array<{
    text: string
    url: string
  }>
}

export interface ChapterInfo {
  chapter: number
  title: string
  titleOsaka?: string
  articles: number[]
  description: string
  descriptionOsaka?: string
}

export interface ChaptersData {
  chapters: ChapterInfo[]
}

/**
 * 指定された法律のメタデータを取得する
 * @param lawCategory - 法律カテゴリ（例: 'jp', 'foreign_old'）
 * @param lawName - 法律名（例: 'constitution', 'magna_carta'）
 * @returns メタデータまたはnull（ファイルが存在しない場合）
 */
export async function getLawMetadata(
  lawCategory: string, 
  lawName: string
): Promise<LawSource | null> {
  try {
    const lawMetadata = await import(`@/data/laws/${lawCategory}/${lawName}/law-metadata.json`)
    return lawMetadata.default as LawSource
  } catch (error) {
    return null
  }
}

/**
 * 指定された法律の章構成情報を取得する
 * @param lawCategory - 法律カテゴリ（例: 'jp', 'foreign_old'）
 * @param lawName - 法律名（例: 'constitution'）
 * @returns 章構成情報またはnull（ファイルが存在しない場合）
 */
export async function getChapters(
  lawCategory: string, 
  lawName: string
): Promise<ChaptersData | null> {
  try {
    const chapters = await import(`@/data/laws/${lawCategory}/${lawName}/chapters.json`)
    return chapters.default as ChaptersData
  } catch (error) {
    return null
  }
}

/**
 * 法律名を動的に取得する
 * @param lawCategory - 法律カテゴリ
 * @param lawName - 法律名
 * @returns 法律名またはnull
 */
export async function getLawName(
  lawCategory: string, 
  lawName: string
): Promise<string | null> {
  const lawMetadata = await getLawMetadata(lawCategory, lawName)
  return lawMetadata?.name || null
}

/**
 * 法律年度を動的に取得する
 * @param lawCategory - 法律カテゴリ
 * @param lawName - 法律名
 * @returns 年度またはnull
 */
export async function getLawYear(
  lawCategory: string, 
  lawName: string
): Promise<number | null> {
  const lawMetadata = await getLawMetadata(lawCategory, lawName)
  return lawMetadata?.year || null
}